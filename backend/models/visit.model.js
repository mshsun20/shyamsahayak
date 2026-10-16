import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const VisitSchema = new Schema({
    code: { type: String, required: true, trim: true, unique: true, index: true },
    visitType: { type: String, required: true, trim: true },
    visitName: { type: String, trim: true },
    visitDate: [{ type: Date, required: true, trim: true }],
    partyName: { type: String, required: true, trim: true },
    partyContact: { type: String, trim: true },
    employeeCode: { type: String, required: true, trim: true },
    employeeName: { type: String, trim: true },
    employeePhone: { type: String, trim: true },
    employeeDesignation: { type: String, trim: true },
    newVisit: { type: Boolean, required: true, default: 1 },
    occurrence: { type: Number, required: true, default: 1 },
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    pinCode: { type: String, trim: true },
}, { timestamps: true });

const Visit = model("Visit", VisitSchema)

export default Visit;