import "../config/env.js";
import mongoose from "mongoose";
import connectDB from "../config/dbcon.js";
import { initializeKnowledgeBaseModels } from "../services/knowledgeBaseAI/modelInitializer.service.js";
import { initializeKnowledgeBaseCollection } from "../config/qdrant.js";
import { validateKnowledgeBaseAIConfig } from "../config/kbAI.config.js";
import KnowledgeBase from "../models/knowledgeBase.model.js";
import { queueKnowledgeBaseReindex } from "../services/knowledgeBaseAI/ingestion.service.js";

try {
  validateKnowledgeBaseAIConfig();
  await connectDB();
  await initializeKnowledgeBaseModels();
  await initializeKnowledgeBaseCollection();
  const docs = await KnowledgeBase.find({ status: "Published", aiEnabled: true }).select("_id code title").lean();
  let queued = 0;
  for (const doc of docs) {
    await queueKnowledgeBaseReindex(doc._id);
    queued += 1;
    console.log(`[KB REINDEX] Queued ${doc.code} — ${doc.title}`);
  }
  console.log(`[KB REINDEX] Queued ${queued} published and AI-enabled documents.`);
} catch (error) {
  console.error("[KB REINDEX] Failed:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
