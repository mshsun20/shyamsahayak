import Account from "../models/account.model.js";

export const createFunction = async (payload) => {
    const details = await Account.create(payload);
    return details;
}

export const readFunction = async () => {
    return Account.find().populate("role createdBy updatedBy").lean();
}

export const readByIdFunction = async (id) => {
    return Account.findById(id).populate("role createdBy updatedBy");
}

export const readByUniqueKeyFunction = async (uniqueKey) => {
    return Account.findOne({ username: uniqueKey }).populate("role createdBy updatedBy");
}

export const updateFunction = async (id, payload) => {
    const updatedDetails = await Account.findByIdAndUpdate(id, payload, { returnDocument: "after" });
    return updatedDetails;
}

export const removeFunction = async (id) => {
    const removalDetails = await Account.findByIdAndDelete(id);
    return removalDetails;
}