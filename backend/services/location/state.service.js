import State from "../../models/location/state.model.js";

export const createFunction = async (payload) => {
    const details = await State.create(payload);
    return details;
}

export const readFunction = async () => {
    return State.find().populate("createdBy updatedBy").lean();
}

export const readByIdFunction = async (id) => {
    return State.findById(id).populate("createdBy updatedBy");
}

export const readByUniqueKeyFunction = async (uniqueKey) => {
    return State.findOne({ code: uniqueKey }).populate("createdBy updatedBy");
}

export const updateFunction = async (id, payload) => {
    const updatedDetails = await State.findByIdAndUpdate(id, payload, { returnDocument: "after" });
    return updatedDetails;
}

export const removeFunction = async (id) => {
    const removalDetails = await State.findByIdAndDelete(id);
    return removalDetails;
}