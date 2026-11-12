import mongoose from "mongoose";
const { Schema, model, Types } = mongoose

const KnowledgeBaseSchema = new Schema({
    code: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum:["Products", "Installation", "Warranty", "Videos"], trim: true },
    shortDescription: { type: String, trim: true },
    content: { type: String, trim: true },
    author: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    featured: { type: Boolean, required: true, default: false },
    attachments: [{ type: Types.ObjectId, ref: "File" }],
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    visibility: { type: String, required: true, default: "All Users" },
    banner: { type: Types.ObjectId, ref: "File" },
    status: { type: String, required: true, enum: ["Draft", "Published", "Archived"], default: "Draft" },
    aiEnabled: { type: Boolean, required: true, default: false },
    indexingStatus: { type: String, enum: ["Not Indexed", "Pending", "Processing", "Indexed", "Partially Indexed", "Failed"], default: "Not Indexed", index: true },
    indexedAt: { type: Date, default: null },
    createdBy: { type: Types.ObjectId, ref: "Account" },
    updatedBy: { type: Types.ObjectId, ref: "Account" }
}, { timestamps: true })

const KnowledgeBase = model("KnowledgeBase", KnowledgeBaseSchema);
export default KnowledgeBase;