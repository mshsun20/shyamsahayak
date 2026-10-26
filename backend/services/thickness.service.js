import Thickness from "../models/thickness.model.js";
import { auditUserFields } from "../utils/codeGenerator.util.js";

const populateAudit = [
    { path: "createdBy", select: auditUserFields },
    { path: "updatedBy", select: auditUserFields },
];

export const createFunction = async (payload) => {
    return Thickness.create(payload);
}

export const readFunction = async (filter = {}) => {
    return Thickness.find(filter).sort({ value: 1, unit: 1 }).populate(populateAudit).lean();
}

export const readByIdFunction = async (id) => {
    return Thickness.findById(id).populate(populateAudit).lean();
}

export const readByUniqueKeyFunction = async (uniqueKey) => {
    return Thickness.findOne({ code: uniqueKey }).populate(populateAudit).lean();
}

// used to block duplicate value + unit (excludeId skips the record being edited)
export const readByValueUnitFunction = async (value, unit, excludeId = null) => {
    const filter = { value, unit };
    if (excludeId) filter._id = { $ne: excludeId };
    return Thickness.findOne(filter).lean();
}

export const updateFunction = async (id, payload) => {
    return Thickness.findByIdAndUpdate(id, payload, { returnDocument: "after", runValidators: true });
}

export const deleteFunction = async (id) => {
    return Thickness.findByIdAndDelete(id);
}
