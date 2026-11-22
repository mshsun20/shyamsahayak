import KnowledgeBase from "../models/knowledgeBase.model.js";

// Category fields exposed to clients (name + the display theme used by admin and mobile)
const CATEGORY_POPULATE = { path: "category", select: "code name description icon bg iconBg arrow border status" };

export const createFunction = async (payload) => {
    const details = await KnowledgeBase.create(payload);
    return details;
}

export const readFunction = async () => {
    return KnowledgeBase.find().sort({ updatedAt: -1 }).populate("attachments banner").populate(CATEGORY_POPULATE)
    .populate({ path: "createdBy", select: "-password -passwordBackup" })
    .populate({ path: "updatedBy", select: "-password -passwordBackup" })
    .lean();
}

export const readByIdFunction = async (id) => {
    return KnowledgeBase.findById(id).populate("attachments banner").populate(CATEGORY_POPULATE)
    .populate({ path: "createdBy", select: "-password -passwordBackup" })
    .populate({ path: "updatedBy", select: "-password -passwordBackup" })
    .lean();
}

export const readByUniqueKeyFunction = async (uniqueKey) => {
    return KnowledgeBase.findOne({ code: uniqueKey }).populate("attachments banner").populate(CATEGORY_POPULATE)
    .populate({ path: "createdBy", select: "-password -passwordBackup" })
    .populate({ path: "updatedBy", select: "-password -passwordBackup" })
    .lean();
}

export const updateFunction = async (id, payload) => {
    const updatedDetails = await KnowledgeBase.findByIdAndUpdate(id, payload, { returnDocument: "after" });
    return updatedDetails;
}

export const deleteFunction = async (id) => {
    const removalDetails = await KnowledgeBase.findByIdAndDelete(id);
    return removalDetails;
}