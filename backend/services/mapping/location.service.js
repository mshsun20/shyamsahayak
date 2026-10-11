import Location from "../../models/mapping/location.model.js";

export const createFunction = async (payload) => {
    const details = await Location.create(payload);
    return details;
}

export const readFunction = async (filter={}, { page=1, limit=0 }={}) => {
    const skip = (page - 1) * limit;

    const [locations, total] = await Promise.all([
        Location.find(filter)
        .populate({ path: "fabricators", select: "-password -passwordBackup" })
        .populate({ path: "dgos", select: "-password -passwordBackup" })
        .populate({ path: "tms", select: "-password -passwordBackup" })
        .populate({ path: "dealers", select: "-password -passwordBackup" })
        .populate({ path: "distributors", select: "-password -passwordBackup" })
        .populate({ path: "createdBy", select: "-password -passwordBackup" })
        .populate({ path: "updatedBy", select: "-password -passwordBackup" })
        .skip(skip)
        .limit(limit)
        .lean(),
        Location.countDocuments(filter),
    ]);

    return { locations, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export const readByIdFunction = async (id) => {
    return Location.findById(id)
    .populate({ path: "fabricators", select: "-password -passwordBackup" })
    .populate({ path: "dgos", select: "-password -passwordBackup" })
    .populate({ path: "tms", select: "-password -passwordBackup" })
    .populate({ path: "dealers", select: "-password -passwordBackup" })
    .populate({ path: "distributors", select: "-password -passwordBackup" })
    .populate({ path: "createdBy", select: "-password -passwordBackup" })
    .populate({ path: "updatedBy", select: "-password -passwordBackup" })
    .lean();
}

export const readByUniqueKeyFunction = async (uniqueKey) => {
    return Location.findOne({ code: uniqueKey })
    .populate({ path: "fabricators", select: "-password -passwordBackup" })
    .populate({ path: "dgos", select: "-password -passwordBackup" })
    .populate({ path: "tms", select: "-password -passwordBackup" })
    .populate({ path: "dealers", select: "-password -passwordBackup" })
    .populate({ path: "distributors", select: "-password -passwordBackup" })
    .populate({ path: "createdBy", select: "-password -passwordBackup" })
    .populate({ path: "updatedBy", select: "-password -passwordBackup" })
    .lean();
}

export const updateFunction = async (id, payload) => {
    const updatedDetails = await Location.findByIdAndUpdate(id, payload, { returnDocument: "after" });
    return updatedDetails;
}

export const deleteFunction = async (id) => {
    const removalDetails = await Location.findByIdAndDelete(id);
    return removalDetails;
}