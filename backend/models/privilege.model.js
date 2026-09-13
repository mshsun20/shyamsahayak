import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const PrivilegeSchema = new Schema({
    name: { type: String, required: true, trim: true },
    heirarchy: { type: Number, required: true },
    sameLevel: { type: Boolean, required: true, default: false },
    description: { type: String, required: true, trim: true },
    permissions: [{ type: Types.ObjectId, ref: "Permission" }],
    status: { type: String, required: true, enum: ["Active", "Inactive"], default: "Active" },
    createdBy: { type: Types.ObjectId, ref: "Account" },
    updatedBy: { type: Types.ObjectId, ref: "Account" },
}, { timestamps: true });

const Privilege = model("Privilege", PrivilegeSchema);

export default Privilege;