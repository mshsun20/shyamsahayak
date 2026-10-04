import Scheme from "../models/scheme.model.js";

export const createFunction = async (payload) => {
    const details = await Scheme.create(payload);
    return details;
}

export const readFunction = async () => {
    return Scheme.find().populate("banner")
    .populate({ path: "createdBy", select: "-password -passwordBackup" })
    .populate({ path: "updatedBy", select: "-password -passwordBackup" })
    .lean();
}

export const readByIdFunction = async (id) => {
    return Scheme.findById(id).populate("banner")
    .populate({ path: "createdBy", select: "-password -passwordBackup" })
    .populate({ path: "updatedBy", select: "-password -passwordBackup" })
    .lean();
}

export const readByUniqueKeyFunction = async (uniqueKey) => {
    return Scheme.findOne({ code: uniqueKey }).populate("banner")
    .populate({ path: "createdBy", select: "-password -passwordBackup" })
    .populate({ path: "updatedBy", select: "-password -passwordBackup" })
    .lean();
}

export const updateFunction = async (id, payload) => {
    const updatedDetails = await Scheme.findByIdAndUpdate(id, payload, { returnDocument: "after" });
    return updatedDetails;
}

export const deleteFunction = async (id) => {
    const removalDetails = await Scheme.findByIdAndDelete(id);
    return removalDetails;
}