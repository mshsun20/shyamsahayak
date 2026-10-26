import Counter from "../models/counter.model.js";

// Atomically generates the next sequential code for a module, e.g. generateCode("metric", "MET") -> "MET001"
export const generateCode = async (key, prefix, padLength = 3) => {
    const counter = await Counter.findOneAndUpdate(
        { _id: key },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" }
    );
    return `${prefix}${String(counter.seq).padStart(padLength, "0")}`;
};

// Fields of Account that are safe to expose when populating createdBy / updatedBy
export const auditUserFields = "fullName username userId email";
