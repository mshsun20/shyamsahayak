
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const KnowledgeBaseCategorySchema = new Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    icon: { type: String, trim: true },
    bg: { type: String, trim: true },
    iconBg: { type: String, trim: true },
    arrow: { type: String, trim: true },
    border: { type: String, trim: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active", index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Account", default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Account", default: null },
}, { timestamps: true });

const KnowledgeBaseCategory = model("KnowledgeBaseCategory", KnowledgeBaseCategorySchema);
export default KnowledgeBaseCategory;