import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const LocationSchema = new Schema({
    code: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    fabricator: { type: Types.ObjectId, ref: "Account", required: true },
    dgo: { type: Types.ObjectId, ref: "Account" },
    tm: { type: Types.ObjectId, ref: "Account" },
    dealer: { type: Types.ObjectId, ref: "Account" },
    distributor: { type: Types.ObjectId, ref: "Account" },
    status: { type: String, required: true, enum: ["Active", "Inactive"], default: "Active" },
    createdBy: { type: Types.ObjectId, ref: "Account" },
    updatedBy: { type: Types.ObjectId, ref: "Account" },
}, { timestamps: true });

const Location = model("Location", LocationSchema);

export default Location;