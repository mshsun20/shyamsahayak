
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const KnowledgeBaseAssetSchema = new Schema({
    knowledgeBase: { type: Schema.Types.ObjectId, ref: "KnowledgeBase", required: true, index: true },
    file: { type: Schema.Types.ObjectId, ref: "File", default: null },
    sourceType: { type: String, enum: ["ARTICLE_CONTENT", "ATTACHMENT"], required: true },
    originalName: { type: String, required: true, trim: true },
    mimeType: { type: String, default: "text/plain" },
    fileHash: { type: String, default: null },
    extractionStatus: { type: String, enum: ["Pending", "Processing", "Completed", "Failed"], default: "Pending" },
    indexingStatus: { type: String, enum: ["Pending", "Processing", "Indexed", "Failed"], default: "Pending" },
    extractionMethod: { type: String, default: null },
    extractedCharacters: { type: Number, default: 0 },
    totalChunks: { type: Number, default: 0 },
    chunkIds: [{ type: String }],
    lastIndexedAt: { type: Date, default: null },
    error: { type: String, default: null },
}, { timestamps: true });

KnowledgeBaseAssetSchema.index({ knowledgeBase: 1, sourceType: 1 });
KnowledgeBaseAssetSchema.index({ file: 1 });
KnowledgeBaseAssetSchema.index({ indexingStatus: 1 });

const KnowledgeBaseAsset = model("KnowledgeBaseAsset", KnowledgeBaseAssetSchema);
export default KnowledgeBaseAsset;