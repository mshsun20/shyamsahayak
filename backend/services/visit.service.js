import Visit from "../models/visit.model.js";
import { auditUserFields } from "../utils/codeGenerator.util.js";

const populateAudit = [
    { path: "createdBy", select: auditUserFields },
    { path: "updatedBy", select: auditUserFields },
];

export const createFunction = async (payload) => {
    return Visit.create(payload);
}

export const readFunction = async (filter = {}) => {
    return Visit.find(filter).sort({ visitDate: -1, createdAt: -1 }).populate(populateAudit).lean();
}

export const readByIdFunction = async (id) => {
    return Visit.findById(id).populate(populateAudit).lean();
}

export const readByUniqueKeyFunction = async (uniqueKey) => {
    return Visit.findOne({ code: uniqueKey }).populate(populateAudit).lean();
}

export const updateFunction = async (id, payload) => {
    return Visit.findByIdAndUpdate(id, payload, { returnDocument: "after", runValidators: true });
}

export const deleteFunction = async (id) => {
    return Visit.findByIdAndDelete(id);
}
