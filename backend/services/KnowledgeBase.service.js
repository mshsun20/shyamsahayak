import KnowledgeBase from "../models/knowledgeBase.model.js";

export const createFunction = async (payload) => {
    const details = await KnowledgeBase.create(payload);
    return details;
}

export const readFunction = async () => {
    return KnowledgeBase.find().populate("attachments banner")
    .populate({ path: "createdBy", select: "-password -passwordBackup" })
    .populate({ path: "updatedBy", select: "-password -passwordBackup" })
    .lean();
}

export const readByIdFunction = async (id) => {
    return KnowledgeBase.findById(id).populate("attachments banner")
    .populate({ path: "createdBy", select: "-password -passwordBackup" })
    .populate({ path: "updatedBy", select: "-password -passwordBackup" })
    .lean();
}

export const readByUniqueKeyFunction = async (uniqueKey) => {
    return KnowledgeBase.findOne({ code: uniqueKey }).populate("attachments banner")
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