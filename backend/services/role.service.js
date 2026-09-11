import Role from "../models/role.model.js";

export const createFunction = async (payload) => {
    const details = await Role.create(payload);
    return details;
}

export const readFunction = async () => {
    return Role.find().populate("createdBy updatedBy").lean();
}

export const readByIdFunction = async (id) => {
    return Role.findById(id).populate("createdBy updatedBy");
}

export const readByUniqueKeyFunction = async (uniqueKey) => {
    return Role.findOne({ code: uniqueKey }).populate("createdBy updatedBy");
}

export const updateFunction = async (id, payload) => {
    const updatedDetails = await Role.findByIdAndUpdate(id, payload, { returnDocument: "after" });
    return updatedDetails;
}

export const removeFunction = async (id) => {
    const removalDetails = await Role.findByIdAndDelete(id);
    return removalDetails;
}