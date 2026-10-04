import mongoose from "mongoose";
const { Schema, model, Types } = mongoose

const SchemeSchema = new Schema({
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    applicableOn: { type: Types.ObjectId, ref: "Product", required: true },
    description: { type: String, trim: true },
    validFrom: { type: Date, required: true },
    validTo: { type: Date },
    validity: { type: String, trim: true },
    noExpiry: { type: Boolean, required: true, default: false },
    benefitType: { type: String, trim: true },
    benefitValue: { type: String, trim: true },
    maxDiscountValue: { type: String, trim: true },
    minPurchase: { type: String, trim: true },
    applicableProduct: { type: Types.ObjectId, ref: "Product" },
    priority: { type: String, trim: true },
    banner: { type: Types.ObjectId, ref: "File" },
    metaDescription: { type: String, trim: true },
    status: { type: String, required: true, enum: ["Draft", "Upcoming", "Active", "Inactive", "Expired"], default: "Draft" },
    createdBy: { type: Types.ObjectId, ref: "Account" },
    updatedBy: { type: Types.ObjectId, ref: "Account" }
}, { timestamps: true })

const Scheme = model("Scheme", SchemeSchema);
export default Scheme;