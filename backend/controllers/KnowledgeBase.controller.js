import mongoose from "mongoose";
import {
    createFunction,
    readFunction,
    readIndexedFunction,
    readByIdFunction,
    readByUniqueKeyFunction,
    updateFunction,
    deleteFunction
} from "../services/knowledgeBase.service.js";
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

const codeGenerator = (text) => {
    const code = String(text || "").trim().toLowerCase();
    return `KB-${asciiGenerator(code)}`;
};

// --------------------------------------------------
// COMMON HELPERS
// --------------------------------------------------

const resolveCategory = async (
    value,
    { requireActive = true } = {}
) => {
    const text = String(value?._id || value || "").trim();

    if (!text) {
        throw new Error("Knowledge Base category is required");
    }

    let doc = null;

    if (mongoose.isValidObjectId(text)) {
        doc = await KnowledgeBaseCategory
            .findById(text)
            .select("name status")
            .lean();
    }

    if (!doc) {
        const escaped = text.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        doc = await KnowledgeBaseCategory.findOne({
            $or: [
                { name: new RegExp(`^${escaped}$`, "i") },
                { code: text.toUpperCase() }
            ]
        })
            .select("name status")
            .lean();
    }

    if (!doc) {
        throw new Error(
            `Knowledge Base category '${text}' does not exist`
        );
    }

    if (requireActive && doc.status !== "Active") {
        throw new Error(
            `Knowledge Base category '${doc.name}' is inactive`
        );
    }

    return doc;
};

// Parse multipart JSON arrays safely.
const parseIdArray = (value, fieldName) => {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    let parsed = value;

    if (typeof parsed === "string") {
        try {
            parsed = JSON.parse(parsed);
        } catch {
            throw new Error(
                `${fieldName} must be a valid JSON array`
            );
        }
    }

    if (!Array.isArray(parsed)) {
        throw new Error(
            `${fieldName} must be an array`
        );
    }

    const ids = parsed.map((item) => {
        const id = String(item || "").trim();

        if (!mongoose.isValidObjectId(id)) {
            throw new Error(
                `Invalid attachment ID: ${id}`
            );
        }

        return id;
    });

    // Remove duplicate IDs.
    return [...new Set(ids)];
};

// Normalize multipart boolean fields.
const parseBoolean = (value, defaultValue = false) => {
    if (value === undefined || value === null || value === "") {
        return defaultValue;
    }

    if (typeof value === "boolean") {
        return value;
    }

    return String(value).toLowerCase() === "true";
};

// --------------------------------------------------
// NORMALIZE KNOWLEDGE BASE TAGS
// --------------------------------------------------

const normalizeArrayField = (value) => {
    const tags = [];

    const processValue = (item, depth = 0) => {
        // Prevent excessively nested or malformed input.
        if (depth > 5 || item === undefined || item === null) {
            return;
        }

        // Handle arrays recursively.
        if (Array.isArray(item)) {
            item.forEach((nestedItem) => {
                processValue(nestedItem, depth + 1);
            });

            return;
        }

        // Handle strings and JSON-stringified arrays.
        if (typeof item === "string") {
            const trimmed = item.trim();

            if (!trimmed) return;

            try {
                const parsed = JSON.parse(trimmed);

                // JSON array: process each individual tag.
                if (Array.isArray(parsed)) {
                    processValue(parsed, depth + 1);
                    return;
                }

                // JSON string: process the resulting string.
                if (typeof parsed === "string") {
                    processValue(parsed, depth + 1);
                    return;
                }
            } catch {
                // Ordinary text, not JSON.
            }

            // Support legacy comma-separated tag values.
            trimmed.split(",").forEach((tag) => {
                const cleanTag = tag.trim();

                if (cleanTag) {
                    tags.push(cleanTag);
                }
            });

            return;
        }

        // Support object-based tag values.
        if (typeof item === "object") {
            processValue(
                item.name || item.label || item.value || "",
                depth + 1
            );
        }
    };

    processValue(value);

    // Remove duplicates while preserving original order.
    return [
        ...new Set(
            tags.map((tag) => tag.trim()).filter(Boolean)
        )
    ];
};

// --------------------------------------------------
// FILE UPLOAD HELPER
// --------------------------------------------------

const uploadFilesFromRequest = async (req) => {
    const uploadedAttachmentIds = [];

    const attachments = req.files?.attachments || [];

    if (attachments.length > 0) {
        const report = await uploadMultipleFiles(attachments);

        const uploaded = report?.uploaded || [];

        const ids = uploaded
            .filter((file) => file?._id)
            .map((file) => file._id);

        if (ids.length !== attachments.length) {
            throw new Error(
                "One or more attachments failed to upload"
            );
        }

        uploadedAttachmentIds.push(...ids);
    }

    let bannerId;

    const banner = req.files?.banner?.[0];

    if (banner) {
        const report = await uploadMultipleFiles([banner]);

        const uploaded = (report?.uploaded || [])
            .find((file) => file?._id);

        if (!uploaded) {
            throw new Error("Banner upload failed");
        }

        bannerId = uploaded._id;
    }

    return {
        uploadedAttachmentIds,
        bannerId,
    };
};

// --------------------------------------------------
// CREATE KNOWLEDGE BASE
// --------------------------------------------------

const create = async (req, res) => {
    try {
        const payload = { ...req.body };

        // Upload new files.
        const {
            uploadedAttachmentIds,
            bannerId,
        } = await uploadFilesFromRequest(req);

        // Category validation.
        const category = await resolveCategory(
            payload.category
        );

        payload.category = category._id;

        // Generate unique article code.
        payload.code = codeGenerator(
            `${category.name}${payload.title}`
        );

        if (await readByUniqueKeyFunction(payload.code)) {
            return res.status(409).json({
                success: false,
                message: "Knowledge Base entry already exists"
            });
        }

        // Normalize multipart values.
        payload.tags = normalizeArrayField(payload.tags);

        payload.featured = parseBoolean(
            payload.featured,
            false
        );

        payload.aiEnabled = parseBoolean(
            payload.aiEnabled,
            false
        );

        payload.status = payload.status || "Draft";

        // Only actual File document IDs are stored.
        payload.attachments = uploadedAttachmentIds;

        if (bannerId) {
            payload.banner = bannerId;
        }

        // Internal frontend metadata must never enter the model.
        delete payload.keepAttachmentIds;
        delete payload.removedAttachmentIds;

        payload.createdBy = req.user?._id || null;

        const created = await createFunction(payload);

        // Preserve existing AI asset synchronization.
        try {
            await syncKnowledgeBaseAssets(created._id);
        } catch (error) {
            console.error(
                "[KB] Asset synchronization failed after create:",
                error
            );
        }

        const data = await readByIdFunction(created._id);

        return res.status(201).json({
            success: true,
            message: "Knowledge Base created successfully",
            data,
        });

    } catch (error) {
        console.error("[KB] Create error:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// --------------------------------------------------
// BULK IMPORT
// --------------------------------------------------

const upload = async (req, res) => {
    try {
        const rows = Array.isArray(req.body?.knowledgeBases)
            ? req.body.knowledgeBases
            : [];

        const results = [];

        for (const row of rows) {
            const payload = { ...row };

            const category = await resolveCategory(
                payload.category
            );

            payload.category = category._id;

            const existing = payload.code
                ? await readByUniqueKeyFunction(
                    String(payload.code).trim()
                )
                : null;

            let saved;

            if (existing) {
                delete payload._id;
                delete payload.code;
                delete payload.title;
                delete payload.createdBy;

                payload.updatedBy = req.user?._id || null;

                saved = await updateFunction(
                    existing._id,
                    payload
                );
            } else {
                payload.code =
                    payload.code ||
                    codeGenerator(
                        `${category.name}${payload.title}`
                    );

                payload.createdBy = req.user?._id || null;

                saved = await createFunction(payload);
            }

            await syncKnowledgeBaseAssets(saved._id);

            results.push({
                code: saved.code,
                success: true,
                data: saved,
            });
        }

        return res.status(201).json({
            success: true,
            message: "Knowledge Base bulk import completed",
            data: results,
        });

    } catch (error) {
        console.error("[KB] Bulk import error:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// --------------------------------------------------
// READ ALL
// --------------------------------------------------

const read = async (_req, res) => {
    try {
        const data = await readFunction();

        return res.status(200).json({
            success: true,
            message: "All Knowledge Bases fetched successfully",
            data,
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// --------------------------------------------------
// READ BY ID
// --------------------------------------------------

const readById = async (req, res) => {
    try {
        const id = mapValidObjectId(req.params.id);

        const data = await readByIdFunction(id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Knowledge Base entry not found",
            });
        }

        return res.status(200).json({
            success: true,
            data,
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// --------------------------------------------------
// READ BY UNIQUE KEY
// --------------------------------------------------

const readByUniqueKey = async (req, res) => {
    try {
        const data = await readByUniqueKeyFunction(
            String(req.params.key || "").trim()
        );

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Knowledge Base entry not found",
            });
        }

        return res.status(200).json({
            success: true,
            data,
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// --------------------------------------------------
// UPDATE KNOWLEDGE BASE
// --------------------------------------------------

const update = async (req, res) => {
    try {
        const id = mapValidObjectId(req.params.id);

        // Fetch existing article with populated attachments.
        const existing = await readByIdFunction(id);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Knowledge Base entry does not exist",
            });
        }

        const payload = { ...req.body };

        // --------------------------------------------------
        // 1. DETERMINE EXISTING ATTACHMENTS TO KEEP
        // --------------------------------------------------

        const existingAttachmentIds = (
            existing.attachments || []
        )
            .map((file) => {
                return String(file?._id || file);
            })
            .filter((fileId) =>
                mongoose.isValidObjectId(fileId)
            );

        const requestedKeepIds = parseIdArray(
            payload.keepAttachmentIds,
            "keepAttachmentIds"
        );

        /*
         * Backward compatibility:
         * If the frontend does not send keepAttachmentIds,
         * retain all current attachments.
         *
         * An explicitly supplied [] means remove all.
         */
        const keepAttachmentIds =
            requestedKeepIds === null
                ? existingAttachmentIds
                : requestedKeepIds;

        // A user can only retain files already attached
        // to this specific article.
        const existingIdSet = new Set(
            existingAttachmentIds.map(String)
        );

        const invalidIds = keepAttachmentIds.filter(
            (fileId) => !existingIdSet.has(String(fileId))
        );

        if (invalidIds.length > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "One or more attachment IDs do not belong to this article.",
                invalidAttachmentIds: invalidIds,
            });
        }

        // --------------------------------------------------
        // 2. UPLOAD NEW FILES
        // --------------------------------------------------

        const {
            uploadedAttachmentIds,
            bannerId,
        } = await uploadFilesFromRequest(req);

        // --------------------------------------------------
        // 3. BUILD FINAL ATTACHMENT ARRAY
        // --------------------------------------------------

        payload.attachments = [
            ...keepAttachmentIds,
            ...uploadedAttachmentIds,
        ];

        // Remove duplicate IDs.
        payload.attachments = [
            ...new Map(
                payload.attachments.map((fileId) => [
                    String(fileId),
                    fileId,
                ])
            ).values(),
        ];

        // --------------------------------------------------
        // 4. HANDLE BANNER
        // --------------------------------------------------

        if (bannerId) {
            payload.banner = bannerId;
        }

        // If no new banner is uploaded, existing banner
        // remains unchanged because banner is not overwritten.

        // --------------------------------------------------
        // 5. CATEGORY VALIDATION
        // --------------------------------------------------

        if (payload.category) {
            const currentCategoryId = String(
                existing.category?._id ||
                existing.category ||
                ""
            );

            const requestedCategoryId = String(
                payload.category?._id ||
                payload.category
            ).trim();

            if (
                requestedCategoryId === currentCategoryId
            ) {
                payload.category =
                    existing.category?._id ||
                    existing.category;
            } else {
                const category = await resolveCategory(
                    requestedCategoryId
                );

                payload.category = category._id;
            }
        }

        // --------------------------------------------------
        // 6. NORMALIZE MULTIPART VALUES
        // --------------------------------------------------

        if (payload.tags !== undefined) {
            payload.tags = normalizeArrayField(
                payload.tags
            );
        }

        if (payload.featured !== undefined) {
            payload.featured = parseBoolean(
                payload.featured
            );
        }

        if (payload.aiEnabled !== undefined) {
            payload.aiEnabled = parseBoolean(
                payload.aiEnabled
            );
        }

        // --------------------------------------------------
        // 7. REMOVE NON-MODEL FIELDS
        // --------------------------------------------------

        for (const key of [
            "_id",
            "code",
            "title",
            "createdBy",
            "keepAttachmentIds",
            "removedAttachmentIds",
        ]) {
            delete payload[key];
        }

        payload.updatedBy = req.user?._id || null;

        // --------------------------------------------------
        // 8. SAVE ARTICLE
        // --------------------------------------------------

        const updated = await updateFunction(
            id,
            payload
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Knowledge Base entry not found",
            });
        }

        // --------------------------------------------------
        // 9. SYNCHRONIZE AI KNOWLEDGE BASE ASSETS
        // --------------------------------------------------

        await syncKnowledgeBaseAssets(id);

        // Return populated updated article.
        const updatedData = await readByIdFunction(id);

        return res.status(200).json({
            success: true,
            message: "Knowledge Base updated successfully",
            data: updatedData,
        });

    } catch (error) {
        console.error("[KB] Update error:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// --------------------------------------------------
// DELETE KNOWLEDGE BASE
// --------------------------------------------------

const remove = async (req, res) => {
    try {
        const id = mapValidObjectId(req.params.id);

        const existing = await readByIdFunction(id);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Knowledge Base entry does not exist",
            });
        }

        await cleanupKnowledgeBaseIndex(id);

        const removed = await deleteFunction(id);

        return res.status(200).json({
            success: true,
            message: "Knowledge Base removed successfully",
            data: removed,
        });

    } catch (error) {
        console.error("[KB] Delete error:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// --------------------------------------------------
// REINDEX SINGLE ARTICLE
// --------------------------------------------------

const reindex = async (req, res) => {
    try {
        const id = mapValidObjectId(req.params.id);

        const kb = await readByIdFunction(id);

        if (!kb) {
            return res.status(404).json({
                success: false,
                message: "Knowledge Base entry not found",
            });
        }

        await queueKnowledgeBaseReindex(id);

        return res.status(202).json({
            success: true,
            message: "Knowledge Base reindex queued",
            data: { _id: id },
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// --------------------------------------------------
// REINDEX ALL
// --------------------------------------------------

const reindexAll = async (_req, res) => {
    try {
        const docs = await readIndexedFunction();

        for (const doc of docs) {
            await queueKnowledgeBaseReindex(doc._id);
        }

        return res.status(202).json({
            success: true,
            message: "Reindex jobs queued",
            data: {
                count: docs.length,
            },
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// --------------------------------------------------
// EXPORT CONTROLLER
// --------------------------------------------------

const KnowledgeBase = {
    create,
    upload,
    read,
    readById,
    readByUniqueKey,
    update,
    remove,
    reindex,
    reindexAll,
};

export default KnowledgeBase;
