import mongoose from "mongoose";
const { Schema, model, Types } = mongoose

const ProductSchema = new Schema({
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    unit: { type: String, required: true, trim: true },
    shortDescription: { type: String, trim: true },
    description: { type: String, trim: true },
    image: { type: Types.ObjectId, ref: "File" },
    price: { type: String, required: true, trim: true },
    priceUnit: { type: String, required: true, trim: true },
    gstRate: { type: String, required: true, trim: true },
    tags: { type: String, trim: true },
    priority: { type: String, trim: true },
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    status: { type: String, required: true, enum: ["Active", "Inactive"], default: "Active" },
    createdBy: { type: Types.ObjectId, ref: "Account" },
    updatedBy: { type: Types.ObjectId, ref: "Account" }
}, { timestamps: true })

const Product = model("Product", ProductSchema);
export default Product;