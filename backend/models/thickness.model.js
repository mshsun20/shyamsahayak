import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const ThicknessSchema = new Schema({
    code: { type: String, required: true, trim: true, unique: true, index: true },
    value: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
    details: { type: String, trim: true, maxlength: 250, default: "" },
    status: { type: String, required: true, enum: ["Active", "Inactive"], default: "Active", index: true },
    createdBy: { type: Types.ObjectId, ref: "Account" },
    updatedBy: { type: Types.ObjectId, ref: "Account" },
}, { timestamps: true });

// the same value + unit can only be defined once
ThicknessSchema.index({ value: 1, unit: 1 }, { unique: true });

const Thickness = model("Thickness", ThicknessSchema);

export default Thickness;
