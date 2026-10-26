import Metric from "../models/metric.model.js";
import { auditUserFields } from "../utils/codeGenerator.util.js";

const populateAudit = [
    { path: "createdBy", select: auditUserFields },
    { path: "updatedBy", select: auditUserFields },
];

// case-insensitive comparison, matching the unique index on value
const caseInsensitive = { locale: "en", strength: 2 };

export const createFunction = async (payload) => {
    return Metric.create(payload);
}

export const readFunction = async (filter = {}) => {
    return Metric.find(filter).sort({ createdAt: 1 }).populate(populateAudit).lean();
}

export const readByIdFunction = async (id) => {
    return Metric.findById(id).populate(populateAudit).lean();
}

export const readByUniqueKeyFunction = async (uniqueKey) => {
    return Metric.findOne({ code: uniqueKey }).populate(populateAudit).lean();
}

// used to block duplicate values (excludeId skips the record being edited)
export const readByValueFunction = async (value, excludeId = null) => {
    const filter = { value };
    if (excludeId) filter._id = { $ne: excludeId };
    return Metric.findOne(filter).collation(caseInsensitive).lean();
}

export const updateFunction = async (id, payload) => {
    return Metric.findByIdAndUpdate(id, payload, { returnDocument: "after", runValidators: true });
}

export const deleteFunction = async (id) => {
    return Metric.findByIdAndDelete(id);
}
