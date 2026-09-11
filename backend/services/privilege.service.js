import Privilege from "../models/privilege.model.js";

export const createFunction = async (payload) => {
    const details = await Privilege.create(payload);
    return details;
}

export const readFunction = async () => {
    return Privilege.find().populate("createdBy updatedBy").lean();
}

export const readByIdFunction = async (id) => {
    return Privilege.findById(id).populate("createdBy updatedBy");
}

export const readByUniqueKeyFunction = async (uniqueKey) => {
    return Privilege.findOne({ name: uniqueKey }).populate("createdBy updatedBy");
}

export const updateFunction = async (id, payload) => {
    const updatedDetails = await Privilege.findByIdAndUpdate(id, payload, { returnDocument: "after" });
    return updatedDetails;
}

export const removeFunction = async (id) => {
    const removalDetails = await Privilege.findByIdAndDelete(id);
    return removalDetails;
}