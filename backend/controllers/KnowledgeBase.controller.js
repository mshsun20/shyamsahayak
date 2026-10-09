import {
    createFunction,
    readFunction,
    readByIdFunction,
    readByUniqueKeyFunction,
    updateFunction,
    deleteFunction
} from "../services/KnowledgeBase.service.js";
import {
    uploadMultipleFiles,
} from "../services/file.service.js";
import { mapValidObjectId } from "../utils/objectValidation.util.js";
import { asciiGenerator } from "../utils/asciiGenrator.js";

// Reusable functions
const codeGenerator = (text) => {
    const code = String(text || "").trim().toLowerCase();
    return `KB-${asciiGenerator(code)}}`;
}


// Handler functions
const create = async (req, res) => {
    try {
        const knowledgeBasePayload = req.body;
        const user = req.user || null;
        const allFiles = req.files?.attachments || [];
        if (allFiles.length > 0) {
            const attachmentUploadReport = await uploadMultipleFiles(allFiles)
            console.log(attachmentUploadReport);
            knowledgeBasePayload.attachments = attachmentUploadReport?.uploaded?.map((f) => f._id) || [];
        }
        const bannerFile = req.files?.banner?.[0] || null;
        if (bannerFile) {
            const bannerUploadReport = await uploadMultipleFiles([bannerFile])
            console.log(bannerUploadReport);
            knowledgeBasePayload.banner = bannerUploadReport?.uploaded?._id || null;
        }
        // const attachmentUploadReport = allFiles.length ? await uploadMultipleFiles(allFiles) : null;
        // const bannerUploadReport = bannerFile ? await uploadMultipleFiles([bannerFile]) : null;
        // console.log(attachmentUploadReport);
        // console.log(bannerUploadReport);

        const kbCode = codeGenerator(`${knowledgeBasePayload.category}${knowledgeBasePayload.title}`);
        const existingKnowledgeBase = await readByUniqueKeyFunction(String(kbCode).trim());
        if (existingKnowledgeBase) return res.status(409).json({ success: false, message: "Knowledge Base entry already exists" });
        
        Object.assign(knowledgeBasePayload, {
            code: kbCode,
            // attachments: attachmentUploadReport?.uploaded?.map((f) => f._id) || [],
            // banner: bannerUploadReport?.uploaded?._id || null,
            status: knowledgeBasePayload.status || "Draft",
            createdBy: user?._id || null,
        })
        const knowledgeBase = await createFunction(knowledgeBasePayload);
        if (!knowledgeBase) return res.status(401).json({ success: false, message: "Knowledge Base creation failed" });
        return res.status(201).json({
            success: true,
            message: "Knowledge Base created succesfully",
            data: knowledgeBase
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
const upload = async (req, res) => {
    try {
        const knowledgeBaseDataSheet = req.body?.knowledgeBases || [];
        const user = req.user || null;
        knowledgeBaseDataSheet?.forEach(async (knowledgeBase, i) => {
            // const tags = String(knowledgeBase.tags || "").split(",").map((t) => String(t || "").trim()).filter((t) => t.length > 0);
            const existingKnowledgeBase = await readByUniqueKeyFunction(String(knowledgeBase.code).trim());
            if (existingKnowledgeBase) {
                Object.assign(knowledgeBase, {
                    // tags: tags,
                    status: knowledgeBase.status || "Draft",
                    updatedBy: user?._id || null,
                })
                const { code, title, category, ...newPayload } = knowledgeBase;
                const updatedUpload = await updateFunction(existingKnowledgeBase?._id, newPayload);
                // console.log(updatedUpload);
                knowledgeBaseDataSheet[i].uploadReport = updatedUpload;
            }
            else {
                Object.assign(knowledgeBase, {
                    tags: tags,
                    status: knowledgeBase.status || "Draft",
                    createdBy: user?._id || null,
                })
                const newUpload = await createFunction(knowledgeBase);
                knowledgeBaseDataSheet[i].uploadReport = newUpload;
            }
        });
        if (knowledgeBaseDataSheet?.length > 0) {
            return res.status(201).json({
                success: true,
                message: "Knowledge Base bulk imported done",
                data: knowledgeBaseDataSheet
            })
        }
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
const read = async (req, res) => {
    try {
        const knowledgeBases = await readFunction();
        res.status(200).json({
            success: true,
            message: "All Knowledge Bases fetched successfully",
            data: knowledgeBases
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
const readById = async (req, res) => {
    try {
        const id = mapValidObjectId(req.params.id);
        const knowledgeBaseDetails = await readByIdFunction(id);
        res.status(200).json({
            success: true,
            message: "Knowledge Base details fetched successfully",
            data: knowledgeBaseDetails
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
const readByUniqueKey = async (req, res) => {
    try {
        const uniqueKey = String(req.params.key || "").trim();
        const knowledgeBaseDetails = await readByUniqueKeyFunction(uniqueKey);
        res.status(200).json({
            success: true,
            message: "Knowledge Base details fetched successfully",
            data: knowledgeBaseDetails
        });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
const update = async (req, res) => {
    try {
        const id = mapValidObjectId(req.params.id);
        const knowledgeBasePayload = req.body;
        const user = req.user || null;
        const allFiles = req.files?.attachments || [];
        if (allFiles.length > 0) {
            const attachmentUploadReport = await uploadMultipleFiles(allFiles)
            console.log(attachmentUploadReport);
            knowledgeBasePayload.attachments = attachmentUploadReport?.uploaded?.map((f) => f._id) || [];
        }
        const bannerFile = req.files?.banner?.[0] || null;
        if (bannerFile !== null) {
            const bannerUploadReport = await uploadMultipleFiles([bannerFile])
            console.log(bannerUploadReport);
            knowledgeBasePayload.banner = bannerUploadReport?.uploaded?._id || null;
        }

        const existingKnowledgeBase = await readByIdFunction(id);
        if (!existingKnowledgeBase) return res.status(404).json({ success: false, message: "Knowledge Base doesn't exist" });

        const items = ["_id", "code", "title", "category"]
        for (const key of items) {
            delete knowledgeBasePayload[key]
        }
        Object.assign(knowledgeBasePayload, {
            // attachments: attachmentUploadReport?.uploaded?.map((f) => f._id) || [],
            // banner: bannerUploadReport?.uploaded?._id || null,
            status: knowledgeBasePayload.status || "Draft",
            createdBy: user?._id || null,
        })
        const updatedKnowledgeBase = await updateFunction(id, knowledgeBasePayload);
        if (!updatedKnowledgeBase) return res.status(401).json({ success: false, message: "Knowledge Base update failed" });
        return res.status(201).json({
            success: true,
            message: "Knowledge Base details updated successfully",
            data: updatedKnowledgeBase
        })
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
const remove = async (req, res) => {
    try {
        const id = mapValidObjectId(req.params.id);
        const existingKnowledgeBase = await readByIdFunction(id);
        if (!existingKnowledgeBase) return res.status(404).json({ success: false, message: "Knowledge Base doesn't exist" });

        const removalDetails = await deleteFunction(id);
        if (!removalDetails) return res.status(400).json({ success: false, message: "Knowledge Base removal failed" });
        return res.status(200).json({
            success: true,
            message: "Knowledge Base removed successfully",
            data: removalDetails
        })
    } catch (error) {
        console.error(error.message);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

const KnowledgeBase = { create, upload, read, readById, readByUniqueKey, update, remove }

export default KnowledgeBase;