// import KnowledgeBase from "../../models/knowledgeBase.model.js";
// import KnowledgeBaseAsset from "../../models/knowledgeBaseAsset.model.js";
// import KnowledgeBaseCategory from "../../models/knowledgeBaseCategory.model.js";
// import KnowledgeBaseJob from "../../models/knowledgeBaseJob.model.js";

// export const initializeKnowledgeBaseModels = async () => {
//   // Model.init() creates the collections and ensures declared indexes.
//   await Promise.all([
//     KnowledgeBase.init(),
//     KnowledgeBaseAsset.init(),
//     KnowledgeBaseCategory.init(),
//     KnowledgeBaseJob.init(),
//   ]);

//   // Migrate legacy category strings already used by KnowledgeBase records.
//   const legacyNames = await KnowledgeBase.distinct("category", { category: { $type: "string", $ne: "" } });
//   for (const rawName of legacyNames) {
//     const name = String(rawName).trim();
//     if (!name) continue;
//     const code = name.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40) || "GENERAL";
//     await KnowledgeBaseCategory.updateOne(
//       { name },
//       { $setOnInsert: { name, code, status: "Active", description: "Migrated from existing Knowledge Base records" } },
//       { upsert: true }
//     );
//   }
//   console.log("[KB] MongoDB collections and indexes initialized");
// };


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

  // Migrate legacy category *names* (strings) stored on KnowledgeBase records to ObjectId references.
  // The native collection is used so the ObjectId schema does not try to cast the old strings.
  // Safe to run on every start: once migrated there are no string values left.
  const legacyNames = await KnowledgeBase.collection.distinct("category", { category: { $type: "string" } });
  for (const rawName of legacyNames) {
    const name = String(rawName).trim();
    if (!name) continue;
    const code = name.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40) || "GENERAL";
    const category = await KnowledgeBaseCategory.findOneAndUpdate(
      { name },
      { $setOnInsert: { name, code, status: "Active", description: "Migrated from existing Knowledge Base records" } },
      { upsert: true, returnDocument: "after" }
    );
    const result = await KnowledgeBase.collection.updateMany(
      { category: rawName },
      { $set: { category: category._id } }
    );
    console.log(`[KB] Migrated ${result.modifiedCount} article(s) from category "${name}" to its master reference`);
  }
  console.log("[KB] MongoDB collections and indexes initialized");
};
