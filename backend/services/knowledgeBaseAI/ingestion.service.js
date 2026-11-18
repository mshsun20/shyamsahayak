import path from "path";
import KnowledgeBase from "../../models/knowledgeBase.model.js";
import KnowledgeBaseAsset from "../../models/knowledgeBaseAsset.model.js";
import KnowledgeBaseJob from "../../models/knowledgeBaseJob.model.js";
import File from "../../models/file.model.js";
import kbConfig from "../../config/kbAI.config.js";
import { createTextChunks } from "../../document-intelligence/processors/text.chunker.js";
import { extractOfficeFile } from "../../document-intelligence/processors/office.extractor.js";
import { generateDocumentEmbeddings } from "./embedding.service.js";
import { upsertKnowledgeBaseVectors, deleteVectorsByAsset } from "./vector.service.js";

const enqueueAsset = async (asset, jobType = "INGEST") => {
  // Prevent stale document versions from remaining searchable while a reindex is pending.
  await deleteVectorsByAsset(asset._id);
  await KnowledgeBaseJob.updateMany(
    { asset: asset._id, status: "Pending" },
    { $set: { status: "Cancelled", error: "Superseded by a newer indexing request" } }
  );
  await KnowledgeBaseJob.create({
    asset: asset._id,
    knowledgeBase: asset.knowledgeBase,
    jobType,
    status: "Pending",
    attempts: 0,
    maxAttempts: kbConfig.worker.maxAttempts,
    nextRunAt: new Date(),
  });
  await KnowledgeBaseAsset.updateOne({ _id: asset._id }, { $set: { indexingStatus: "Pending", error: null } });
};

export const refreshKnowledgeBaseIndexStatus = async (knowledgeBaseId) => {
  const assets = await KnowledgeBaseAsset.find({ knowledgeBase: knowledgeBaseId }).select("indexingStatus").lean();
  const kb = await KnowledgeBase.findById(knowledgeBaseId);
  if (!kb) return;
  let status = "Not Indexed";
  if (assets.length) {
    const indexed = assets.filter((a) => a.indexingStatus === "Indexed").length;
    const failed = assets.filter((a) => a.indexingStatus === "Failed").length;
    const pending = assets.some((a) => ["Pending", "Processing"].includes(a.indexingStatus));
    status = pending ? "Processing" : failed && indexed ? "Partially Indexed" : failed ? "Failed" : indexed === assets.length ? "Indexed" : "Pending";
  }
  kb.indexingStatus = status;
  kb.indexedAt = status === "Indexed" ? new Date() : null;
  await kb.save();
};

export const syncKnowledgeBaseAssets = async (knowledgeBaseId, { enqueue = true } = {}) => {
  const kb = await KnowledgeBase.findById(knowledgeBaseId).lean();
  if (!kb) throw new Error("Knowledge Base entry not found");
  const shouldIndex = kbConfig.enabled && enqueue && kb.status === "Published" && kb.aiEnabled === true;
  const wantedFileIds = (kb.attachments || []).map(String);
  const existing = await KnowledgeBaseAsset.find({ knowledgeBase: kb._id });
  const retained = new Set();

  // Keep one article-content asset when body text exists.
  if (String(kb.content || "").trim()) {
    let article = existing.find((a) => a.sourceType === "ARTICLE_CONTENT");
    if (!article) article = await KnowledgeBaseAsset.create({ knowledgeBase: kb._id, sourceType: "ARTICLE_CONTENT", originalName: `${kb.code}-article.txt`, mimeType: "text/plain" });
    article.originalName = `${kb.code}-article.txt`;
    article.mimeType = "text/plain";
    article.extractionStatus = "Completed";
    article.extractedCharacters = kb.content.length;
    await article.save();
    retained.add(String(article._id));
    if (shouldIndex) await enqueueAsset(article, "REINDEX");
  }

  const files = wantedFileIds.length ? await File.find({ _id: { $in: wantedFileIds } }).lean() : [];
  if (files.length !== wantedFileIds.length) throw new Error("One or more Knowledge Base attachment file records do not exist");
  for (const file of files) {
    let asset = existing.find((a) => a.sourceType === "ATTACHMENT" && String(a.file) === String(file._id));
    if (!asset) asset = await KnowledgeBaseAsset.create({ knowledgeBase: kb._id, file: file._id, sourceType: "ATTACHMENT", originalName: file.originalname, mimeType: file.mimetype || "application/octet-stream", fileHash: file.hash || null });
    asset.originalName = file.originalname;
    asset.mimeType = file.mimetype || "application/octet-stream";
    asset.fileHash = file.hash || null;
    await asset.save();
    retained.add(String(asset._id));
    if (shouldIndex) await enqueueAsset(asset, "REINDEX");
  }

  // Remove stale asset records and their vectors; File records may be shared, so never delete them here.
  for (const asset of existing) {
    if (retained.has(String(asset._id))) continue;
    await deleteVectorsByAsset(asset._id);
    await KnowledgeBaseJob.deleteMany({ asset: asset._id });
    await KnowledgeBaseAsset.deleteOne({ _id: asset._id });
  }

  if (!shouldIndex) {
    const retainedAssets = await KnowledgeBaseAsset.find({ knowledgeBase: kb._id }).select("_id").lean();
    for (const asset of retainedAssets) {
      await deleteVectorsByAsset(asset._id);
      await KnowledgeBaseJob.updateMany({ asset: asset._id, status: { $in: ["Pending", "Processing"] } }, { $set: { status: "Cancelled", error: "Document is not Published and AI-enabled" } });
      await KnowledgeBaseAsset.updateOne({ _id: asset._id }, { $set: { indexingStatus: "Pending", error: null } });
    }
    await KnowledgeBase.updateOne({ _id: kb._id }, { $set: { indexingStatus: "Not Indexed", indexedAt: null } });
  } else {
    const count = await KnowledgeBaseAsset.countDocuments({ knowledgeBase: kb._id });
    if (!count) await KnowledgeBase.updateOne({ _id: kb._id }, { $set: { indexingStatus: "Not Indexed" } });
    else await KnowledgeBase.updateOne({ _id: kb._id }, { $set: { indexingStatus: "Pending", indexedAt: null } });
  }
  return KnowledgeBaseAsset.find({ knowledgeBase: kb._id }).lean();
};

export const queueKnowledgeBaseReindex = async (knowledgeBaseId) => syncKnowledgeBaseAssets(knowledgeBaseId, { enqueue: true });

export const processKnowledgeBaseJob = async (job) => {
  const [asset, kb] = await Promise.all([
    KnowledgeBaseAsset.findById(job.asset),
    KnowledgeBase.findById(job.knowledgeBase),
  ]);
  if (!asset || !kb) throw new Error("Knowledge Base asset or parent record no longer exists");
  if (kb.status !== "Published" || !kb.aiEnabled || kb.visibility !== "All Users") {
    await deleteVectorsByAsset(asset._id);
    asset.indexingStatus = "Pending";
    await asset.save();
    return { skipped: true };
  }

  let extracted;
  if (asset.sourceType === "ARTICLE_CONTENT") {
    extracted = { text: String(kb.content || "").trim(), method: "mongodb:article-content", characters: String(kb.content || "").length };
  } else {
    const file = await File.findById(asset.file).lean();
    if (!file?.path) throw new Error("Attachment file metadata or path is missing");
    extracted = await extractOfficeFile({ filePath: file.path, originalName: file.originalname || asset.originalName });
  }
  if (!extracted.text) throw new Error("No text available for indexing");

  const chunks = createTextChunks(extracted.text, { knowledgeBaseId: String(kb._id), assetId: String(asset._id), sourceName: asset.originalName });
  if (!chunks.length) throw new Error("Text extraction produced no indexable chunks");
  const embeddings = await generateDocumentEmbeddings(chunks.map((chunk) => chunk.content));

  // Replace this asset's old vectors only after successful extraction and embedding.
  await deleteVectorsByAsset(asset._id);
  const pointIds = await upsertKnowledgeBaseVectors({
    chunks,
    embeddings,
    metadata: {
      knowledgeBaseId: String(kb._id),
      assetId: String(asset._id),
      code: kb.code,
      title: kb.title,
      category: kb.category,
      status: kb.status,
      aiEnabled: kb.aiEnabled,
      visibility: kb.visibility,
      originalName: asset.originalName,
    },
  });

  asset.extractionStatus = "Completed";
  asset.indexingStatus = "Indexed";
  asset.extractionMethod = extracted.method;
  asset.extractedCharacters = extracted.characters;
  asset.totalChunks = chunks.length;
  asset.chunkIds = pointIds;
  asset.lastIndexedAt = new Date();
  asset.error = null;
  await asset.save();
  await refreshKnowledgeBaseIndexStatus(kb._id);
  return { chunks: chunks.length, vectors: pointIds.length };
};

export const cleanupKnowledgeBaseIndex = async (knowledgeBaseId) => {
  const assets = await KnowledgeBaseAsset.find({ knowledgeBase: knowledgeBaseId }).select("_id").lean();
  for (const asset of assets) await deleteVectorsByAsset(asset._id);
  const assetIds = assets.map((asset) => asset._id);
  await KnowledgeBaseJob.deleteMany({ knowledgeBase: knowledgeBaseId });
  await KnowledgeBaseAsset.deleteMany({ knowledgeBase: knowledgeBaseId });
  return { removedAssets: assetIds.length };
};
