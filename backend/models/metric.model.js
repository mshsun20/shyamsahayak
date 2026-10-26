import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const MetricSchema = new Schema({
    code: { type: String, required: true, trim: true, unique: true, index: true },
    value: { type: String, required: true, trim: true },
    details: { type: String, trim: true, maxlength: 250, default: "" },
    status: { type: String, required: true, enum: ["Active", "Inactive"], default: "Active", index: true },
    createdBy: { type: Types.ObjectId, ref: "Account" },
    updatedBy: { type: Types.ObjectId, ref: "Account" },
}, { timestamps: true });

// metric value is unique regardless of letter case ("RMT" == "rmt")
MetricSchema.index({ value: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

const Metric = model("Metric", MetricSchema);

export default Metric;
