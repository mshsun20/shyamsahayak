import mongoose from "mongoose";
import {
    createFunction,
    readFunction,
    readByIdFunction,
    readByUniqueKeyFunction,
    updateFunction,
    deleteFunction
} from "../services/KnowledgeBase.service.js";
import KnowledgeBaseCategory from "../models/knowledgeBaseCategory.model.js";
import {
    uploadMultipleFiles,
} from "../services/file.service.js";
import {
    syncKnowledgeBaseAssets,
    queueKnowledgeBaseReindex,
    cleanupKnowledgeBaseIndex,
} from "../services/knowledgeBaseAI/ingestion.service.js";
import { mapValidObjectId } from "../utils/objectValidation.util.js";
import { asciiGenerator } from "../utils/asciiGenrator.js";

// Reusable functions
const codeGenerator = (text) => {
    const code = String(text || "").trim().toLowerCase();
    return `KB-${asciiGenerator(code)}`;
}

// Resolves a category reference to its master record.
// Accepts the category _id (admin / API), or its name or code (CSV bulk import).
const resolveCategory = async (value, { requireActive = true } = {}) => {
    const text = String(value?._id || value || "").trim();
    if (!text) throw new Error("Knowledge Base category is required");
    let doc = null;
    if (mongoose.isValidObjectId(text)) doc = await KnowledgeBaseCategory.findById(text).select("name status").lean();
    if (!doc) {
        const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        doc = await KnowledgeBaseCategory.findOne({
            $or: [{ name: new RegExp(`^${escaped}$`, "i") }, { code: text.toUpperCase() }],
        }).select("name status").lean();
    }
    if (!doc) throw new Error(`Knowledge Base category '${text}' does not exist`);
    if (requireActive && doc.status !== "Active") throw new Error(`Knowledge Base category '${doc.name}' is inactive`);
    return doc;
};

const uploadFilesFromRequest = async (req, payload) => {
    const attachments = req.files?.attachments || [];
    if (attachments.length) {
        const report = await uploadMultipleFiles(attachments);
        const ids = (report.uploaded || []).filter((f) => f && f._id).map((f) => f._id);
        if (ids.length !== attachments.length) throw new Error("One or more attachments failed to upload");
        payload.attachments = ids;
    }
    const banner = req.files?.banner?.[0];
    if (banner) {
        const report = await uploadMultipleFiles([banner]);
        const uploaded = (report.uploaded || []).find((f) => f && f._id);
        if (!uploaded) throw new Error("Banner upload failed");
        payload.banner = uploaded._id;
    }
};


// Handler functions
const create = async (req, res) => {
    try {
        const payload = { ...req.body };
        await uploadFilesFromRequest(req, payload);
        const category = await resolveCategory(payload.category);
        payload.category = category._id;
        payload.code = codeGenerator(`${category.name}${payload.title}`);
        if (await readByUniqueKeyFunction(payload.code)) return res.status(409).json({ success: false, message: "Knowledge Base entry already exists" });
        payload.status = payload.status || "Draft";
        payload.createdBy = req.user?._id || null;
        payload.aiEnabled = payload.aiEnabled === true || payload.aiEnabled === "true";
        const created = await createFunction(payload);
        try { await syncKnowledgeBaseAssets(created._id); }
        catch (error) { console.error("[KB] Asset synchronization failed after create:", error); }
        const data = await readByIdFunction(created._id);
        res.status(201).json({ success: true, message: "Knowledge Base created successfully", data });
    } catch (error) { console.error(error); res.status(400).json({ success: false, message: error.message }); }
};

const upload = async (req, res) => {
    try {
        const rows = Array.isArray(req.body?.knowledgeBases) ? req.body.knowledgeBases : [];
        const results = [];
        for (const row of rows) {
            const payload = { ...row };
            const category = await resolveCategory(payload.category);
            payload.category = category._id;
            const existing = payload.code ? await readByUniqueKeyFunction(String(payload.code).trim()) : null;
            let saved;
            if (existing) {
                delete payload._id; delete payload.code; delete payload.title; delete payload.createdBy;
                payload.updatedBy = req.user?._id || null;
                saved = await updateFunction(existing._id, payload);
            } else {
                payload.code = payload.code || codeGenerator(`${category.name}${payload.title}`);
                payload.createdBy = req.user?._id || null;
                saved = await createFunction(payload);
            }
            await syncKnowledgeBaseAssets(saved._id);
            results.push({ code: saved.code, success: true, data: saved });
        }
        res.status(201).json({ success: true, message: "Knowledge Base bulk import completed", data: results });
    } catch (error) { console.error(error); res.status(400).json({ success: false, message: error.message }); }
};

const read = async (_req, res) => {
    try { res.status(200).json({ success: true, message: "All Knowledge Bases fetched successfully", data: await readFunction() }); }
    catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

const readById = async (req, res) => {
    try {
        const data = await readByIdFunction(mapValidObjectId(req.params.id));
        if (!data) return res.status(404).json({ success: false, message: "Knowledge Base entry not found" });
        res.status(200).json({ success: true, data });
    } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

const readByUniqueKey = async (req, res) => {
    try {
        const data = await readByUniqueKeyFunction(String(req.params.key || "").trim());
        if (!data) return res.status(404).json({ success: false, message: "Knowledge Base entry not found" });
        res.status(200).json({ success: true, data });
    } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

const update = async (req, res) => {
    try {
        const id = mapValidObjectId(req.params.id);
        const existing = await readByIdFunction(id);
        if (!existing) return res.status(404).json({ success: false, message: "Knowledge Base entry does not exist" });
        const payload = { ...req.body };
        await uploadFilesFromRequest(req, payload);
        if (payload.category) {
            // An article may keep a category that has since been deactivated; only a *changed* category must be active.
            const current = String(existing.category?._id || existing.category || "");
            const requested = String(payload.category?._id || payload.category).trim();
            payload.category = requested === current
                ? (existing.category?._id || existing.category)
                : (await resolveCategory(requested))._id;
        }
        for (const key of ["_id", "code", "title", "createdBy"]) delete payload[key];
        if (payload.aiEnabled !== undefined) payload.aiEnabled = payload.aiEnabled === true || String(payload.aiEnabled).toLowerCase() === "true";
        payload.updatedBy = req.user?._id || null;
        const updated = await updateFunction(id, payload);
        await syncKnowledgeBaseAssets(id);
        res.status(200).json({ success: true, message: "Knowledge Base updated successfully", data: updated });
    } catch (error) { console.error(error); res.status(400).json({ success: false, message: error.message }); }
};

const remove = async (req, res) => {
    try {
        const id = mapValidObjectId(req.params.id);
        const existing = await readByIdFunction(id);
        if (!existing) return res.status(404).json({ success: false, message: "Knowledge Base entry does not exist" });
        await cleanupKnowledgeBaseIndex(id);
        const removed = await deleteFunction(id);
        res.status(200).json({ success: true, message: "Knowledge Base removed successfully", data: removed });
    } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

const reindex = async (req, res) => {
    try {
        const id = mapValidObjectId(req.params.id);
        const kb = await readByIdFunction(id);
        if (!kb) return res.status(404).json({ success: false, message: "Knowledge Base entry not found" });
        await queueKnowledgeBaseReindex(id);
        res.status(202).json({ success: true, message: "Knowledge Base reindex queued", data: { _id: id } });
    } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

const reindexAll = async (_req, res) => {
    try {
        const { default: KnowledgeBase } = await import("../models/knowledgeBase.model.js");
        const docs = await KnowledgeBase.find({ status: "Published", aiEnabled: true }).select("_id").lean();
        for (const doc of docs) await queueKnowledgeBaseReindex(doc._id);
        res.status(202).json({ success: true, message: "Reindex jobs queued", data: { count: docs.length } });
    } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

const KnowledgeBase = { create, upload, read, readById, readByUniqueKey, update, remove, reindex, reindexAll }

export default KnowledgeBase;