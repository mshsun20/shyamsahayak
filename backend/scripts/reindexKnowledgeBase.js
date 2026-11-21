
import "../config/env.js";

import mongoose from "mongoose";

import connectDB from "../config/dbcon.js";

import {
  initializeKnowledgeBaseModels,
} from "../services/knowledgeBaseAI/modelInitializer.service.js";

import {
  initializeKnowledgeBaseCollection,
} from "../config/qdrant.js";

import {
  validateKnowledgeBaseAIConfig,
} from "../config/kbAI.config.js";

import KnowledgeBase from "../models/knowledgeBase.model.js";

import {
  queueKnowledgeBaseReindex,
} from "../services/knowledgeBaseAI/ingestion.service.js";


const PUBLIC_VISIBILITY_VALUES = [
  "Visible to all users",
  "All Users",
];


try {
  validateKnowledgeBaseAIConfig();

  await connectDB();

  await initializeKnowledgeBaseModels();

  await initializeKnowledgeBaseCollection();

  /*
   * Optional command-line KnowledgeBase ID.
   *
   * Without an ID, all eligible documents are queued.
   */
  const targetId = process.argv[2]?.trim();

  const filter = {
    status: "Published",
    aiEnabled: true,
    visibility: {
      $in: PUBLIC_VISIBILITY_VALUES,
    },
  };

  if (targetId) {
    if (!mongoose.isValidObjectId(targetId)) {
      throw new Error(
        "Invalid Knowledge Base MongoDB ID."
      );
    }

    filter._id = targetId;
  }

  const docs = await KnowledgeBase.find(filter)
    .select("_id code title visibility")
    .lean();

  if (targetId && docs.length === 0) {
    throw new Error(
      "The requested Knowledge Base record is not eligible for indexing. Check its ID, Published status, AI setting, and visibility."
    );
  }

  console.log(
    `[KB REINDEX] Found ${docs.length} eligible documents.`
  );

  let queued = 0;

  for (const doc of docs) {
    console.log(
      `[KB REINDEX] Queuing ${doc.code} — ${doc.title}`
    );

    await queueKnowledgeBaseReindex(doc._id);

    queued += 1;
  }

  console.log("--------------------------------------------");
  console.log(`[KB REINDEX] Successfully queued ${queued} documents.`);
  console.log("The running Knowledge Base worker will process the jobs.");
  console.log("--------------------------------------------");
} catch (error) {
  console.error("[KB REINDEX] Failed:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
