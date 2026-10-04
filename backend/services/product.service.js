import Product from "../models/product.model.js";

export const createFunction = async (payload) => {
    const details = await Product.create(payload);
    return details;
}

export const readFunction = async () => {
    return Product.find().populate("image")
    .populate({ path: "createdBy", select: "-password -passwordBackup" })
    .populate({ path: "updatedBy", select: "-password -passwordBackup" })
    .lean();
}

export const readByIdFunction = async (id) => {
    return Product.findById(id).populate("image")
    .populate({ path: "createdBy", select: "-password -passwordBackup" })
    .populate({ path: "updatedBy", select: "-password -passwordBackup" })
    .lean();
}

export const readByUniqueKeyFunction = async (uniqueKey) => {
    return Product.findOne({ code: uniqueKey }).populate("image")
    .populate({ path: "createdBy", select: "-password -passwordBackup" })
    .populate({ path: "updatedBy", select: "-password -passwordBackup" })
    .lean();
}

export const updateFunction = async (id, payload) => {
    const updatedDetails = await Product.findByIdAndUpdate(id, payload, { returnDocument: "after" });
    return updatedDetails;
}

export const deleteFunction = async (id) => {
    const removalDetails = await Product.findByIdAndDelete(id);
    return removalDetails;
}