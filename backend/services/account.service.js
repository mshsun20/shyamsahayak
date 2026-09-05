import Account from "../models/account.model.js";

export const createFunction = async (payload, user) => {
    const accountPayload = req.body;
    Object.assign(accountPayload, {
        createdBy: user?._id,
        status: "Active"
    })
    const account = await Account.create();
    return account;
}

export const readFunction = async () => {
    return Account.find().lean();
}

export const readByIdFunction = async () => {}

export const updateFunction = async () => {}

export const removeFunction = async () => {}