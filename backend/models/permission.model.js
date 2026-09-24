import mongoose from "mongoose";

const { Schema, model } = mongoose;

const PermissionSchema = new Schema({
    code: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    module: { type: String, required: true, trim: true, lowercase: true },
    action: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active", index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Account", default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Account", default: null },
}, { timestamps: true });

const Permission = model("Permission", PermissionSchema);

export default Permission;