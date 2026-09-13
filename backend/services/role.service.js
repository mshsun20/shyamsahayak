import Role from "../models/role.model.js";

export const createFunction = async (payload) => {
    const details = await Role.create(payload);
    return details;
}

export const readFunction = async () => {
    return Role.find().populate([
        {
            path: "permissions",
            select: "code name module action status",
        },
        "createdBy",
        "updatedBy",
    ]).lean();
}

export const readByIdFunction = async (id) => {
    return Role.findById(id).populate([
        {
            path: "permissions",
            select: "code name module action status",
        },
        "createdBy",
        "updatedBy",
    ]).lean();
}

export const readByUniqueKeyFunction = async (uniqueKey) => {
    return Role.findOne({ code: uniqueKey }).populate([
        {
            path: "permissions",
            select: "code name module action status",
        },
        "createdBy",
        "updatedBy",
    ]).lean();
}

export const updateFunction = async (id, payload) => {
    const updatedDetails = await Role.findByIdAndUpdate(id, payload, { returnDocument: "after" });
    return updatedDetails;
}

export const deleteFunction = async (id) => {
    const removalDetails = await Role.findByIdAndDelete(id);
    return removalDetails;
}