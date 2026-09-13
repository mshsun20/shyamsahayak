import Account from "../models/account.model.js";

export const createFunction = async (payload) => {
    const details = await Account.create(payload);
    return details;
}

export const readFunction = async () => {
    return Account.find()
    .select("-password -passwordBackup")
    .populate([
        {
            path: "role",
            populate: {
                path: "permissions",
                select: "code name module action status",
            },
        },
        {
            path: "privilege",
            populate: {
                path: "permissions",
                select: "code name module action status",
            },
        },
        {
            path: "permissions",
            select: "code name module action status",
        },
    ])
    .populate({ path: "reportingDetails.reportingManager", select: "-password -passwordBackup" })
    .populate({ path: "createdBy", select: "-password -passwordBackup" })
    .populate({ path: "updatedBy", select: "-password -passwordBackup" })
    .lean();
}

export const readByIdFunction = async (id) => {
    return Account.findById(id)
    // .select("-password -passwordBackup")
    .populate([
        {
            path: "role",
            populate: {
                path: "permissions",
                select: "code name module action status",
            },
        },
        {
            path: "privilege",
            populate: {
                path: "permissions",
                select: "code name module action status",
            },
        },
        {
            path: "permissions",
            select: "code name module action status",
        },
    ])
    .populate({ path: "reportingDetails.reportingManager", select: "-password -passwordBackup" })
    .populate({ path: "createdBy", select: "-password -passwordBackup" })
    .populate({ path: "updatedBy", select: "-password -passwordBackup" })
    .lean();
}

export const readByUniqueKeyFunction = async (uniqueKey) => {
    return Account.findOne({ userId: uniqueKey })
    .select("-password -passwordBackup")
    .populate([
        {
            path: "role",
            populate: {
                path: "permissions",
                select: "code name module action status",
            },
        },
        {
            path: "privilege",
            populate: {
                path: "permissions",
                select: "code name module action status",
            },
        },
        {
            path: "permissions",
            select: "code name module action status",
        },
    ])
    .populate({ path: "reportingDetails.reportingManager", select: "-password -passwordBackup" })
    .populate({ path: "createdBy", select: "-password -passwordBackup" })
    .populate({ path: "updatedBy", select: "-password -passwordBackup" })
    .lean();
}

export const updateFunction = async (id, payload) => {
    const updatedDetails = await Account.findByIdAndUpdate(id, payload, { returnDocument: "after" });
    return updatedDetails;
}

export const deleteFunction = async (id) => {
    const removalDetails = await Account.findByIdAndDelete(id);
    return removalDetails;
}