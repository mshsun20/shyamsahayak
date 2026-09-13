import Territory from "../../models/location/territory.model.js";

export const createFunction = async (payload) => {
    const details = await Territory.create(payload);
    return details;
}

export const readFunction = async () => {
    return Territory.find().populate("createdBy updatedBy").lean();
}

export const readByIdFunction = async (id) => {
    return Territory.findById(id).populate("createdBy updatedBy");
}

export const readByUniqueKeyFunction = async (uniqueKey) => {
    return Territory.findOne({ code: uniqueKey }).populate("createdBy updatedBy");
}

export const updateFunction = async (id, payload) => {
    const updatedDetails = await Territory.findByIdAndUpdate(id, payload, { returnDocument: "after" });
    return updatedDetails;
}

export const deleteFunction = async (id) => {
    const removalDetails = await Territory.findByIdAndDelete(id);
    return removalDetails;
}