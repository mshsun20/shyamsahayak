import KnowledgeBase from "../../models/knowledgeBase.model.js";
import KnowledgeBaseAsset from "../../models/knowledgeBaseAsset.model.js";
import KnowledgeBaseCategory from "../../models/knowledgeBaseCategory.model.js";
import KnowledgeBaseJob from "../../models/knowledgeBaseJob.model.js";

export const initializeKnowledgeBaseModels = async () => {
  // Model.init() creates the collections and ensures declared indexes.
  await Promise.all([
    KnowledgeBase.init(),
    KnowledgeBaseAsset.init(),
    KnowledgeBaseCategory.init(),
    KnowledgeBaseJob.init(),
  ]);

  // Migrate legacy category strings already used by KnowledgeBase records.
  const legacyNames = await KnowledgeBase.distinct("category", { category: { $type: "string", $ne: "" } });
  for (const rawName of legacyNames) {
    const name = String(rawName).trim();
    if (!name) continue;
    const code = name.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40) || "GENERAL";
    await KnowledgeBaseCategory.updateOne(
      { name },
      { $setOnInsert: { name, code, status: "Active", description: "Migrated from existing Knowledge Base records" } },
      { upsert: true }
    );
  }
  console.log("[KB] MongoDB collections and indexes initialized");
};
