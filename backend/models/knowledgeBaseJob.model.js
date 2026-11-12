
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const KnowledgeBaseJobSchema = new Schema({
    asset: { type: Schema.Types.ObjectId, ref: "KnowledgeBaseAsset", required: true, index: true },
    knowledgeBase: { type: Schema.Types.ObjectId, ref: "KnowledgeBase", required: true, index: true },
    jobType: { type: String, enum: ["INGEST", "REINDEX", "DELETE"], default: "INGEST" },
    status: { type: String, enum: ["Pending", "Processing", "Completed", "Failed"], default: "Pending", index: true },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    nextRunAt: { type: Date, default: Date.now, index: true },
    lockedAt: { type: Date, default: null },
    lockedBy: { type: String, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    error: { type: String, default: null },
}, { timestamps: true });

KnowledgeBaseJobSchema.index({ status: 1, nextRunAt: 1, createdAt: 1 });

const KnowledgeBaseJob = model("KnowledgeBaseJob", KnowledgeBaseJobSchema);
export default KnowledgeBaseJob;