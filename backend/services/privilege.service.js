import Privilege from "../models/privilege.model.js";

export const createFunction = async (payload) => {
    const details = await Privilege.create(payload);
    return details;
}

export const readFunction = async () => {
    return Privilege.find().populate([
        {
            path: "permissions",
            select: "code name module action status",
        },
        "createdBy",
        "updatedBy",
    ]).lean();
}

export const readByIdFunction = async (id) => {
    return Privilege.findById(id).populate([
        {
            path: "permissions",
            select: "code name module action status",
        },
        "createdBy",
        "updatedBy",
    ]).lean();
}

export const readByUniqueKeyFunction = async (uniqueKey) => {
    return Privilege.findOne({ name: uniqueKey }).populate([
        {
            path: "permissions",
            select: "code name module action status",
        },
        "createdBy",
        "updatedBy",
    ]).lean();
}

export const updateFunction = async (id, payload) => {
    const updatedDetails = await Privilege.findByIdAndUpdate(id, payload, { returnDocument: "after" });
    return updatedDetails;
}

export const deleteFunction = async (id) => {
    const removalDetails = await Privilege.findByIdAndDelete(id);
    return removalDetails;
}