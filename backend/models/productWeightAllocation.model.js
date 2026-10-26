import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const ProductWeightAllocationSchema = new Schema({
    code: { type: String, required: true, trim: true, unique: true, index: true },
    product: { type: Types.ObjectId, ref: "Product", required: true, index: true },
    thickness: { type: Types.ObjectId, ref: "Thickness", required: true, index: true },
    metric: { type: Types.ObjectId, ref: "Metric", required: true, index: true },
    unitWeight: { type: Number, required: true, min: 0 },
    info: { type: String, trim: true, maxlength: 250, default: "" },
    status: { type: String, required: true, enum: ["Active", "Inactive"], default: "Active", index: true },
    createdBy: { type: Types.ObjectId, ref: "Account" },
    updatedBy: { type: Types.ObjectId, ref: "Account" },
}, { timestamps: true });

// one unit weight per product + thickness + metric combination
ProductWeightAllocationSchema.index({ product: 1, thickness: 1, metric: 1 }, { unique: true });

const ProductWeightAllocation = model("ProductWeightAllocation", ProductWeightAllocationSchema);

export default ProductWeightAllocation;
