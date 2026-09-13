import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const RoleSchema = new Schema({
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    level: { type: Number, required: true },
    permissions: [{ type: Types.ObjectId, ref: "Permission" }],
    status: { type: String, required: true, enum: ["Active", "Inactive"], default: "Active" },
    createdBy: { type: Types.ObjectId, ref: "Account" },
    updatedBy: { type: Types.ObjectId, ref: "Account" },
}, { timestamps: true });

const Role = model("Role", RoleSchema);

export default Role;