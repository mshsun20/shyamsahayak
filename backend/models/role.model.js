import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const RoleSchema = new Schema({
    name: { type: String, required: true, trim: true },
    heirarchy: { type: Number, required: true },
    sameLevel: { type: Boolean, required: true, default: false },
    description: { type: String, required: true, trim: true },
    status: { type: String, required: true, enum: ["Active", "Inactive"], default: "Active" },
    createdBy: { type: Types.ObjectId, ref: "Account" },
    updatedBy: { type: Types.ObjectId, ref: "Account" },
}, { timestamps: true });

const Role = model("Role", RoleSchema);

export default Role;