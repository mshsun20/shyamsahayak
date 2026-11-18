import "../config/env.js";
import mongoose from "mongoose";
import connectDB from "../config/dbcon.js";
import { initializeKnowledgeBaseModels } from "../services/knowledgeBaseAI/modelInitializer.service.js";
import KnowledgeBase from "../models/knowledgeBase.model.js";
import KnowledgeBaseAsset from "../models/knowledgeBaseAsset.model.js";
import KnowledgeBaseCategory from "../models/knowledgeBaseCategory.model.js";
import KnowledgeBaseJob from "../models/knowledgeBaseJob.model.js";

try {
  await connectDB();
  await initializeKnowledgeBaseModels();
  const [kb, assets, categories, pending, failed, indexed] = await Promise.all([
    KnowledgeBase.countDocuments(),
    KnowledgeBaseAsset.countDocuments(),
    KnowledgeBaseCategory.countDocuments(),
    KnowledgeBaseJob.countDocuments({ status: "Pending" }),
    KnowledgeBaseJob.countDocuments({ status: "Failed" }),
    KnowledgeBaseAsset.countDocuments({ indexingStatus: "Indexed" }),
  ]);
  console.table({ knowledgeBases: kb, assets, categories, pendingJobs: pending, failedJobs: failed, indexedAssets: indexed });
} catch (error) {
  console.error("[KB VERIFY] Failed:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
