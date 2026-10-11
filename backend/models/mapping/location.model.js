import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const LocationSchema = new Schema({
    code: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    fabricators: [{ type: Types.ObjectId, ref: "Account", required: true }],
    dgos: [{ type: Types.ObjectId, ref: "Account" }],
    tms: [{ type: Types.ObjectId, ref: "Account" }],
    dealers: [{ type: Types.ObjectId, ref: "Account" }],
    distributors: [{ type: Types.ObjectId, ref: "Account" }],
    status: { type: String, required: true, enum: ["Active", "Inactive"], default: "Active" },
    createdBy: { type: Types.ObjectId, ref: "Account" },
    updatedBy: { type: Types.ObjectId, ref: "Account" },
}, { timestamps: true });

const Location = model("Location", LocationSchema);

export default Location;