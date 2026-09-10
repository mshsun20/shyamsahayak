import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const TerritorySchema = new Schema({
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, required: true, enum: ["Active", "Inactive"], default: "Active" },
    createdBy: { type: Types.ObjectId, ref: "Account" },
    updatedBy: { type: Types.ObjectId, ref: "Account" },
}, { timestamps: true });

const Territory = model("Territory", TerritorySchema);

export default Territory;