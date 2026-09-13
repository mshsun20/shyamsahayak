import District from "../../models/location/district.model.js";

export const createFunction = async (payload) => {
    const details = await District.create(payload);
    return details;
}

export const readFunction = async () => {
    return District.find().populate("createdBy updatedBy").lean();
}

export const readByIdFunction = async (id) => {
    return District.findById(id).populate("createdBy updatedBy");
}

export const readByUniqueKeyFunction = async (uniqueKey) => {
    return District.findOne({ code: uniqueKey }).populate("createdBy updatedBy");
}

export const updateFunction = async (id, payload) => {
    const updatedDetails = await District.findByIdAndUpdate(id, payload, { returnDocument: "after" });
    return updatedDetails;
}

export const deleteFunction = async (id) => {
    const removalDetails = await District.findByIdAndDelete(id);
    return removalDetails;
}