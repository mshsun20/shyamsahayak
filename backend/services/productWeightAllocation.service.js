import ProductWeightAllocation from "../models/productWeightAllocation.model.js";
import { auditUserFields } from "../utils/codeGenerator.util.js";

const populateAll = [
    { path: "product", select: "code name category unit status" },
    { path: "thickness", select: "code value unit status" },
    { path: "metric", select: "code value details status" },
    { path: "createdBy", select: auditUserFields },
    { path: "updatedBy", select: auditUserFields },
];

export const createFunction = async (payload) => {
    return ProductWeightAllocation.create(payload);
}

export const readFunction = async (filter = {}) => {
    return ProductWeightAllocation.find(filter).sort({ createdAt: 1 }).populate(populateAll).lean();
}

export const readByIdFunction = async (id) => {
    return ProductWeightAllocation.findById(id).populate(populateAll).lean();
}

export const readByUniqueKeyFunction = async (uniqueKey) => {
    return ProductWeightAllocation.findOne({ code: uniqueKey }).populate(populateAll).lean();
}

// used to block duplicate product + thickness + metric (excludeId skips the record being edited)
export const readByCombinationFunction = async ({ product, thickness, metric }, excludeId = null) => {
    const filter = { product, thickness, metric };
    if (excludeId) filter._id = { $ne: excludeId };
    return ProductWeightAllocation.findOne(filter).lean();
}

// how many allocations use a given master record (used to block deleting a thickness / metric in use)
export const countByReferenceFunction = async (field, id) => {
    return ProductWeightAllocation.countDocuments({ [field]: id });
}

export const updateFunction = async (id, payload) => {
    return ProductWeightAllocation.findByIdAndUpdate(id, payload, { returnDocument: "after", runValidators: true });
}

export const deleteFunction = async (id) => {
    return ProductWeightAllocation.findByIdAndDelete(id);
}
