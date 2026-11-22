// import KnowledgeBase from "../../models/knowledgeBase.model.js";
// import KnowledgeBaseAsset from "../../models/knowledgeBaseAsset.model.js";
// import KnowledgeBaseJob from "../../models/knowledgeBaseJob.model.js";
// import File from "../../models/file.model.js";
// import kbConfig from "../../config/kbAI.config.js";
// import { createTextChunks } from "../../document-intelligence/processors/text.chunker.js";
// import { extractOfficeFile } from "../../document-intelligence/processors/office.extractor.js";
// import { generateDocumentEmbeddings } from "./embedding.service.js";
// import { upsertKnowledgeBaseVectors, deleteVectorsByAsset, deleteKnowledgeBaseVectors } from "./vector.service.js";


// /* ================================================================
//    VISIBILITY HELPERS
// ================================================================ */

// const PUBLIC_VISIBILITIES = new Set([
//   "All Users",
//   "Visible to all users",
// ]);

// const isPublicVisibility = (visibility) => {
//   return PUBLIC_VISIBILITIES.has(String(visibility || "").trim());
// };

// const isKnowledgeBaseIndexable = (kb) => {
//   return (
//     kb &&
//     kb.status === "Published" &&
//     kb.aiEnabled === true &&
//     isPublicVisibility(kb.visibility)
//   );
// };


// /* ================================================================
//    QUEUE ASSET FOR INDEXING

//    IMPORTANT:
//    Do not delete existing vectors here.

//    Existing indexed content should remain searchable while the
//    replacement indexing job is waiting or processing.
// ================================================================ */

// const enqueueAsset = async (asset, jobType = "INGEST") => {

//   await KnowledgeBaseJob.updateMany(
//     {
//       asset: asset._id,
//       status: "Pending",
//     },
//     {
//       $set: {
//         status: "Cancelled",
//         error: "Superseded by a newer indexing request",
//       },
//     }
//   );

//   await KnowledgeBaseJob.create({
//     asset: asset._id,
//     knowledgeBase: asset.knowledgeBase,
//     jobType,
//     status: "Pending",
//     attempts: 0,
//     maxAttempts: kbConfig.worker.maxAttempts,
//     nextRunAt: new Date(),
//   });

//   await KnowledgeBaseAsset.updateOne(
//     { _id: asset._id },
//     {
//       $set: {
//         indexingStatus: "Pending",
//         error: null,
//       },
//     }
//   );
// };


// /* ================================================================
//    REFRESH KNOWLEDGE BASE INDEX STATUS
// ================================================================ */

// export const refreshKnowledgeBaseIndexStatus = async (
//   knowledgeBaseId
// ) => {

//   const assets = await KnowledgeBaseAsset.find({
//     knowledgeBase: knowledgeBaseId,
//   }).select("indexingStatus").lean();

//   const kb = await KnowledgeBase.findById(knowledgeBaseId);

//   if (!kb) return;

//   let status = "Not Indexed";

//   if (assets.length) {

//     const indexed = assets.filter(
//       (asset) => asset.indexingStatus === "Indexed"
//     ).length;

//     const failed = assets.filter(
//       (asset) => asset.indexingStatus === "Failed"
//     ).length;

//     const pending = assets.some(
//       (asset) =>
//         ["Pending", "Processing"].includes(asset.indexingStatus)
//     );

//     if (pending) {
//       status = "Processing";
//     } else if (failed && indexed) {
//       status = "Partially Indexed";
//     } else if (failed) {
//       status = "Failed";
//     } else if (indexed === assets.length) {
//       status = "Indexed";
//     } else {
//       status = "Pending";
//     }
//   }

//   kb.indexingStatus = status;

//   kb.indexedAt =
//     status === "Indexed"
//       ? new Date()
//       : null;

//   await kb.save();
// };


// /* ================================================================
//    SYNC KNOWLEDGE BASE ASSETS

//    Responsibilities:
//    1. Synchronize article-content assets.
//    2. Synchronize file attachment assets.
//    3. Queue eligible assets.
//    4. Remove vectors belonging to deleted assets.
//    5. Remove vectors when a document is no longer eligible.
// ================================================================ */

// export const syncKnowledgeBaseAssets = async (
//   knowledgeBaseId,
//   { enqueue = true } = {}
// ) => {

//   const kb = await KnowledgeBase.findById(
//     knowledgeBaseId
//   ).lean();

//   if (!kb) {
//     throw new Error("Knowledge Base entry not found");
//   }

//   const shouldIndex = kbConfig.enabled && enqueue && isKnowledgeBaseIndexable(kb);
//   const wantedFileIds = (kb.attachments || []).map(String);
//   const existing = await KnowledgeBaseAsset.find({ knowledgeBase: kb._id });
//   const retained = new Set();


//   /* --------------------------------------------------------------
//      ARTICLE CONTENT ASSET
//   -------------------------------------------------------------- */

//   if (String(kb.content || "").trim()) {
//     let article = existing.find((asset) => asset.sourceType === "ARTICLE_CONTENT");

//     if (!article) {
//       article = await KnowledgeBaseAsset.create({
//         knowledgeBase: kb._id,
//         sourceType: "ARTICLE_CONTENT",
//         originalName: `${kb.code}-article.txt`,
//         mimeType: "text/plain",
//       });
//     }

//     article.originalName = `${kb.code}-article.txt`;
//     article.mimeType = "text/plain";
//     article.extractionStatus = "Completed";
//     article.extractedCharacters = kb.content.length;

//     await article.save();

//     retained.add(String(article._id));

//     if (shouldIndex) {
//       await enqueueAsset(article, "REINDEX");
//     }
//   }


//   /* --------------------------------------------------------------
//      ATTACHMENT ASSETS
//   -------------------------------------------------------------- */

//   const files = wantedFileIds.length ? await File.find({ _id: { $in: wantedFileIds } }).lean() : [];
//   if (files.length !== wantedFileIds.length) {
//     throw new Error("One or more Knowledge Base attachment file records do not exist");
//   }

//   for (const file of files) {
//     let asset = existing.find((item) => item.sourceType === "ATTACHMENT" && String(item.file) === String(file._id));

//     if (!asset) {
//       asset = await KnowledgeBaseAsset.create({
//         knowledgeBase: kb._id,
//         file: file._id,
//         sourceType: "ATTACHMENT",
//         originalName: file.originalname,
//         mimeType:
//           file.mimetype || "application/octet-stream",
//         fileHash: file.hash || null,
//       });
//     }

//     asset.originalName = file.originalname;
//     asset.mimeType = file.mimetype || "application/octet-stream";
//     asset.fileHash = file.hash || null;
//     await asset.save();
//     retained.add(String(asset._id));
//     if (shouldIndex) {
//       await enqueueAsset(asset, "REINDEX");
//     }
//   }


//   /* --------------------------------------------------------------
//      REMOVE STALE ASSETS

//      File records may be shared between Knowledge Base entries.
//      Therefore, never delete the original File record here.
//   -------------------------------------------------------------- */

//   for (const asset of existing) {
//     if (retained.has(String(asset._id))) {
//       continue;
//     }

//     await deleteVectorsByAsset(asset._id);

//     await KnowledgeBaseJob.deleteMany({
//       asset: asset._id,
//     });

//     await KnowledgeBaseAsset.deleteOne({
//       _id: asset._id,
//     });
//   }


//   /* --------------------------------------------------------------
//      HANDLE NON-INDEXABLE KNOWLEDGE BASE ENTRIES

//      This also removes existing vectors when a Knowledge Base
//      entry is unpublished, disabled for AI, or not public.
//   -------------------------------------------------------------- */

//   if (!shouldIndex) {

//     const retainedAssets = await KnowledgeBaseAsset.find({
//       knowledgeBase: kb._id,
//     })
//       .select("_id")
//       .lean();

//     for (const asset of retainedAssets) {

//       await deleteVectorsByAsset(asset._id);

//       await KnowledgeBaseJob.updateMany(
//         {
//           asset: asset._id,
//           status: {
//             $in: ["Pending", "Processing"],
//           },
//         },
//         {
//           $set: {
//             status: "Cancelled",
//             error:
//               "Document is not Published, AI-enabled, and publicly visible",
//           },
//         }
//       );

//       await KnowledgeBaseAsset.updateOne(
//         { _id: asset._id },
//         {
//           $set: {
//             indexingStatus: "Pending",
//             error: null,
//             chunkIds: [],
//             totalChunks: 0,
//           },
//         }
//       );
//     }

//     await KnowledgeBase.updateOne(
//       { _id: kb._id },
//       {
//         $set: {
//           indexingStatus: "Not Indexed",
//           indexedAt: null,
//         },
//       }
//     );

//   } else {

//     const count = await KnowledgeBaseAsset.countDocuments({
//       knowledgeBase: kb._id,
//     });

//     if (!count) {

//       await KnowledgeBase.updateOne(
//         { _id: kb._id },
//         {
//           $set: {
//             indexingStatus: "Not Indexed",
//             indexedAt: null,
//           },
//         }
//       );

//     } else {

//       await KnowledgeBase.updateOne(
//         { _id: kb._id },
//         {
//           $set: {
//             indexingStatus: "Pending",
//             indexedAt: null,
//           },
//         }
//       );
//     }
//   }

//   return KnowledgeBaseAsset.find({
//     knowledgeBase: kb._id,
//   }).lean();
// };


// /* ================================================================
//    QUEUE KNOWLEDGE BASE REINDEX
// ================================================================ */

// export const queueKnowledgeBaseReindex = async (
//   knowledgeBaseId
// ) => {

//   return syncKnowledgeBaseAssets(
//     knowledgeBaseId,
//     { enqueue: true }
//   );
// };


// /* ================================================================
//    PROCESS KNOWLEDGE BASE JOB

//    Complete indexing pipeline:

//    1. Load asset and Knowledge Base.
//    2. Validate publication, AI and visibility permissions.
//    3. Extract document content.
//    4. Preserve structured extraction output.
//    5. Generate structured text chunks.
//    6. Generate Gemini embeddings.
//    7. Insert new Qdrant vectors.
//    8. Delete previous vectors by their saved point IDs.
//    9. Update MongoDB indexing metadata.

//    Existing vectors are not deleted until new vectors have
//    been successfully inserted.
// ================================================================ */

// export const processKnowledgeBaseJob = async (job) => {

//   /* --------------------------------------------------------------
//      LOAD ASSET AND KNOWLEDGE BASE
//   -------------------------------------------------------------- */

//   const [asset, kb] = await Promise.all([

//     KnowledgeBaseAsset.findById(job.asset),

//     KnowledgeBase.findById(job.knowledgeBase),

//   ]);

//   if (!asset || !kb) {
//     throw new Error(
//       "Knowledge Base asset or parent record no longer exists"
//     );
//   }


//   /* --------------------------------------------------------------
//      VALIDATE INDEXING ELIGIBILITY
//   -------------------------------------------------------------- */

//   if (!isKnowledgeBaseIndexable(kb)) {

//     // This is an authorization/visibility change, not a normal
//     // reindex. Remove the asset's vectors so it cannot be retrieved.

//     await deleteVectorsByAsset(asset._id);

//     asset.indexingStatus = "Pending";
//     asset.chunkIds = [];
//     asset.totalChunks = 0;

//     await asset.save();

//     await refreshKnowledgeBaseIndexStatus(kb._id);

//     return {
//       skipped: true,
//       reason:
//         "Knowledge Base entry is not Published, AI-enabled, and publicly visible",
//     };
//   }


//   /* --------------------------------------------------------------
//      EXTRACT DOCUMENT CONTENT
//   -------------------------------------------------------------- */

//   let extracted;

//   if (asset.sourceType === "ARTICLE_CONTENT") {

//     const articleText = String(
//       kb.content || ""
//     ).trim();

//     extracted = {
//       text: articleText,
//       method: "mongodb:article-content",
//       characters: articleText.length,
//     };
//   } else {
//     const file = await File.findById(
//       asset.file
//     ).lean();

//     if (!file?.path) {
//       throw new Error("Attachment file metadata or path is missing");
//     }

//     extracted = await extractOfficeFile({
//       filePath: file.path,
//       originalName: file.originalname || asset.originalName,
//     });

//     console.log("\n========== KB EXTRACTION DEBUG ==========");
//     console.log("Asset:", asset.originalName);
//     console.log("Extraction Method:", extracted.method);
//     console.log("Extracted Characters:", extracted.characters);
//     console.log("Sections Count:", extracted.sections?.length || 0);
//     console.log("Salt Spray Content:", extracted.text.split("\n").filter((line) => /salt spray|1000 hours|1200 hours/i.test(line)));
//     console.log("========================================\n");
//   }


//   /* --------------------------------------------------------------
//      OCR VALIDATION
//   -------------------------------------------------------------- */

//   if (extracted.needsOcr) {

//     throw new Error(
//       `OCR_REQUIRED: ${extracted.warning ||
//       "Document requires OCR before indexing."
//       }`
//     );
//   }


//   /* --------------------------------------------------------------
//      EXTRACTION VALIDATION
//   -------------------------------------------------------------- */

//   if (!String(extracted.text || "").trim()) {

//     throw new Error(
//       "No readable document text was extracted"
//     );
//   }


//   /* --------------------------------------------------------------
//      STRUCTURED TEXT CHUNKING

//      IMPORTANT:

//      Pass the complete extraction object rather than only
//      extracted.text.

//      This allows the structured chunker to preserve available
//      slide, page, worksheet, table and source-location metadata.
//   -------------------------------------------------------------- */

//   const chunks = createTextChunks(
//     extracted,
//     {
//       knowledgeBaseId: String(kb._id),
//       assetId: String(asset._id),
//       sourceName: asset.originalName,
//     }
//   );

//   console.log("\n========== KB CHUNK DEBUG ==========");
//   console.log("Total Chunks:", chunks.length);
//   chunks.forEach((chunk, index) => {
//     if (/salt spray|1000 hours|1200 hours/i.test(chunk.content)) {
//       console.log(`Chunk ${index}:`);
//       console.log(chunk.content);
//     }
//   });
//   console.log("====================================\n");

//   if (!chunks.length) {

//     throw new Error(
//       "Document extraction produced no indexable chunks"
//     );
//   }


//   /* --------------------------------------------------------------
//      GENERATE GEMINI DOCUMENT EMBEDDINGS
//   -------------------------------------------------------------- */

//   const embeddings = await generateDocumentEmbeddings(
//     chunks.map((chunk) => chunk.content)
//   );

//   if (!Array.isArray(embeddings)) {

//     throw new Error(
//       "Embedding service returned an invalid response"
//     );
//   }

//   if (embeddings.length !== chunks.length) {

//     throw new Error(
//       `Embedding count mismatch: expected ${chunks.length}, received ${embeddings.length}`
//     );
//   }


//   /* --------------------------------------------------------------
//      SAVE PREVIOUS VECTOR IDS

//      These are the old Qdrant point IDs saved in MongoDB during
//      the previous successful indexing operation.
//   -------------------------------------------------------------- */

//   const previousPointIds = Array.isArray(asset.chunkIds)
//     ? asset.chunkIds.map(String).filter(Boolean)
//     : [];


//   /* --------------------------------------------------------------
//      INSERT NEW QDRANT VECTORS

//      Do this BEFORE deleting the previous point IDs.

//      The new points receive the same asset ID, so they remain
//      associated with the original Knowledge Base asset.
//   -------------------------------------------------------------- */

//   const pointIds = await upsertKnowledgeBaseVectors({

//     chunks,

//     embeddings,

//     metadata: {

//       knowledgeBaseId: String(kb._id),

//       assetId: String(asset._id),

//       code: kb.code,

//       title: kb.title,

//       category: kb.category,

//       status: kb.status,

//       aiEnabled: kb.aiEnabled,

//       visibility: kb.visibility,

//       originalName: asset.originalName,

//       extractionMethod: extracted.method,

//     },

//   });


//   /* --------------------------------------------------------------
//      VALIDATE QDRANT INSERTION RESULT
//   -------------------------------------------------------------- */

//   if (
//     !Array.isArray(pointIds) ||
//     pointIds.length !== chunks.length
//   ) {

//     throw new Error(
//       `Qdrant point count mismatch: expected ${chunks.length}, received ${Array.isArray(pointIds) ? pointIds.length : 0
//       }`
//     );
//   }


//   /* --------------------------------------------------------------
//      DELETE PREVIOUS VECTORS

//      Delete only the previous point IDs.

//      NEVER use deleteVectorsByAsset(asset._id) here, because that
//      would also delete the newly inserted vectors.
//   -------------------------------------------------------------- */

//   if (previousPointIds.length) {

//     await deleteKnowledgeBaseVectors(
//       previousPointIds
//     );
//   }


//   /* --------------------------------------------------------------
//      UPDATE ASSET INDEXING METADATA
//   -------------------------------------------------------------- */

//   asset.extractionStatus = "Completed";

//   asset.indexingStatus = "Indexed";

//   asset.extractionMethod = extracted.method;

//   asset.extractedCharacters =
//     extracted.characters ?? extracted.text.length;

//   asset.totalChunks = chunks.length;

//   asset.chunkIds = pointIds;

//   asset.lastIndexedAt = new Date();

//   asset.error = null;

//   await asset.save();


//   /* --------------------------------------------------------------
//      REFRESH PARENT KNOWLEDGE BASE STATUS
//   -------------------------------------------------------------- */

//   await refreshKnowledgeBaseIndexStatus(
//     kb._id
//   );


//   /* --------------------------------------------------------------
//      RETURN JOB RESULT
//   -------------------------------------------------------------- */

//   return {

//     success: true,

//     chunks: chunks.length,

//     vectors: pointIds.length,

//     extractionMethod: extracted.method,

//     extractedCharacters:
//       extracted.characters ?? extracted.text.length,

//   };
// };


// /* ================================================================
//    CLEANUP KNOWLEDGE BASE INDEX

//    Deletes all vectors and asset/job records belonging to the
//    specified Knowledge Base entry.

//    This is a deliberate full cleanup operation. Do not call it
//    during an ordinary reindex.
// ================================================================ */

// export const cleanupKnowledgeBaseIndex = async (
//   knowledgeBaseId
// ) => {

//   const assets = await KnowledgeBaseAsset.find({
//     knowledgeBase: knowledgeBaseId,
//   })
//     .select("_id")
//     .lean();

//   for (const asset of assets) {

//     await deleteVectorsByAsset(
//       asset._id
//     );
//   }

//   const assetIds = assets.map(
//     (asset) => asset._id
//   );

//   await KnowledgeBaseJob.deleteMany({
//     knowledgeBase: knowledgeBaseId,
//   });

//   await KnowledgeBaseAsset.deleteMany({
//     knowledgeBase: knowledgeBaseId,
//   });

//   return {
//     removedAssets: assetIds.length,
//   };
// };



import KnowledgeBase from "../../models/knowledgeBase.model.js";
import KnowledgeBaseAsset from "../../models/knowledgeBaseAsset.model.js";
import KnowledgeBaseJob from "../../models/knowledgeBaseJob.model.js";
import File from "../../models/file.model.js";
import kbConfig from "../../config/kbAI.config.js";
import { createTextChunks } from "../../document-intelligence/processors/text.chunker.js";
import { extractOfficeFile } from "../../document-intelligence/processors/office.extractor.js";
import { generateDocumentEmbeddings } from "./embedding.service.js";
import { upsertKnowledgeBaseVectors, deleteVectorsByAsset, deleteKnowledgeBaseVectors } from "./vector.service.js";


/* ================================================================
   VISIBILITY HELPERS
================================================================ */

const PUBLIC_VISIBILITIES = new Set([
  "All Users",
  "Visible to all users",
]);

const isPublicVisibility = (visibility) => {
  return PUBLIC_VISIBILITIES.has(String(visibility || "").trim());
};

const isKnowledgeBaseIndexable = (kb) => {
  return (
    kb &&
    kb.status === "Published" &&
    kb.aiEnabled === true &&
    isPublicVisibility(kb.visibility)
  );
};


/* ================================================================
   QUEUE ASSET FOR INDEXING

   IMPORTANT:
   Do not delete existing vectors here.

   Existing indexed content should remain searchable while the
   replacement indexing job is waiting or processing.
================================================================ */

const enqueueAsset = async (asset, jobType = "INGEST") => {

  await KnowledgeBaseJob.updateMany(
    {
      asset: asset._id,
      status: "Pending",
    },
    {
      $set: {
        status: "Cancelled",
        error: "Superseded by a newer indexing request",
      },
    }
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

  await KnowledgeBaseAsset.updateOne(
    { _id: asset._id },
    {
      $set: {
        indexingStatus: "Pending",
        error: null,
      },
    }
  );
};


/* ================================================================
   REFRESH KNOWLEDGE BASE INDEX STATUS
================================================================ */

export const refreshKnowledgeBaseIndexStatus = async (
  knowledgeBaseId
) => {

  const assets = await KnowledgeBaseAsset.find({
    knowledgeBase: knowledgeBaseId,
  }).select("indexingStatus").lean();

  const kb = await KnowledgeBase.findById(knowledgeBaseId);

  if (!kb) return;

  let status = "Not Indexed";

  if (assets.length) {

    const indexed = assets.filter(
      (asset) => asset.indexingStatus === "Indexed"
    ).length;

    const failed = assets.filter(
      (asset) => asset.indexingStatus === "Failed"
    ).length;

    const pending = assets.some(
      (asset) =>
        ["Pending", "Processing"].includes(asset.indexingStatus)
    );

    if (pending) {
      status = "Processing";
    } else if (failed && indexed) {
      status = "Partially Indexed";
    } else if (failed) {
      status = "Failed";
    } else if (indexed === assets.length) {
      status = "Indexed";
    } else {
      status = "Pending";
    }
  }

  kb.indexingStatus = status;

  kb.indexedAt =
    status === "Indexed"
      ? new Date()
      : null;

  await kb.save();
};


/* ================================================================
   SYNC KNOWLEDGE BASE ASSETS

   Responsibilities:
   1. Synchronize article-content assets.
   2. Synchronize file attachment assets.
   3. Queue eligible assets.
   4. Remove vectors belonging to deleted assets.
   5. Remove vectors when a document is no longer eligible.
================================================================ */

export const syncKnowledgeBaseAssets = async (
  knowledgeBaseId,
  { enqueue = true } = {}
) => {

  const kb = await KnowledgeBase.findById(
    knowledgeBaseId
  ).lean();

  if (!kb) {
    throw new Error("Knowledge Base entry not found");
  }

  const shouldIndex = kbConfig.enabled && enqueue && isKnowledgeBaseIndexable(kb);
  const wantedFileIds = (kb.attachments || []).map(String);
  const existing = await KnowledgeBaseAsset.find({ knowledgeBase: kb._id });
  const retained = new Set();


  /* --------------------------------------------------------------
     ARTICLE CONTENT ASSET
  -------------------------------------------------------------- */

  if (String(kb.content || "").trim()) {
    let article = existing.find((asset) => asset.sourceType === "ARTICLE_CONTENT");

    if (!article) {
      article = await KnowledgeBaseAsset.create({
        knowledgeBase: kb._id,
        sourceType: "ARTICLE_CONTENT",
        originalName: `${kb.code}-article.txt`,
        mimeType: "text/plain",
      });
    }

    article.originalName = `${kb.code}-article.txt`;
    article.mimeType = "text/plain";
    article.extractionStatus = "Completed";
    article.extractedCharacters = kb.content.length;

    await article.save();

    retained.add(String(article._id));

    if (shouldIndex) {
      await enqueueAsset(article, "REINDEX");
    }
  }


  /* --------------------------------------------------------------
     ATTACHMENT ASSETS
  -------------------------------------------------------------- */

  const files = wantedFileIds.length ? await File.find({ _id: { $in: wantedFileIds } }).lean() : [];
  if (files.length !== wantedFileIds.length) {
    throw new Error("One or more Knowledge Base attachment file records do not exist");
  }

  for (const file of files) {
    let asset = existing.find((item) => item.sourceType === "ATTACHMENT" && String(item.file) === String(file._id));

    if (!asset) {
      asset = await KnowledgeBaseAsset.create({
        knowledgeBase: kb._id,
        file: file._id,
        sourceType: "ATTACHMENT",
        originalName: file.originalname,
        mimeType:
          file.mimetype || "application/octet-stream",
        fileHash: file.hash || null,
      });
    }

    asset.originalName = file.originalname;
    asset.mimeType = file.mimetype || "application/octet-stream";
    asset.fileHash = file.hash || null;
    await asset.save();
    retained.add(String(asset._id));
    if (shouldIndex) {
      await enqueueAsset(asset, "REINDEX");
    }
  }


  /* --------------------------------------------------------------
     REMOVE STALE ASSETS

     File records may be shared between Knowledge Base entries.
     Therefore, never delete the original File record here.
  -------------------------------------------------------------- */

  for (const asset of existing) {
    if (retained.has(String(asset._id))) {
      continue;
    }

    await deleteVectorsByAsset(asset._id);

    await KnowledgeBaseJob.deleteMany({
      asset: asset._id,
    });

    await KnowledgeBaseAsset.deleteOne({
      _id: asset._id,
    });
  }


  /* --------------------------------------------------------------
     HANDLE NON-INDEXABLE KNOWLEDGE BASE ENTRIES

     This also removes existing vectors when a Knowledge Base
     entry is unpublished, disabled for AI, or not public.
  -------------------------------------------------------------- */

  if (!shouldIndex) {

    const retainedAssets = await KnowledgeBaseAsset.find({
      knowledgeBase: kb._id,
    })
      .select("_id")
      .lean();

    for (const asset of retainedAssets) {

      await deleteVectorsByAsset(asset._id);

      await KnowledgeBaseJob.updateMany(
        {
          asset: asset._id,
          status: {
            $in: ["Pending", "Processing"],
          },
        },
        {
          $set: {
            status: "Cancelled",
            error:
              "Document is not Published, AI-enabled, and publicly visible",
          },
        }
      );

      await KnowledgeBaseAsset.updateOne(
        { _id: asset._id },
        {
          $set: {
            indexingStatus: "Pending",
            error: null,
            chunkIds: [],
            totalChunks: 0,
          },
        }
      );
    }

    await KnowledgeBase.updateOne(
      { _id: kb._id },
      {
        $set: {
          indexingStatus: "Not Indexed",
          indexedAt: null,
        },
      }
    );

  } else {

    const count = await KnowledgeBaseAsset.countDocuments({
      knowledgeBase: kb._id,
    });

    if (!count) {

      await KnowledgeBase.updateOne(
        { _id: kb._id },
        {
          $set: {
            indexingStatus: "Not Indexed",
            indexedAt: null,
          },
        }
      );

    } else {

      await KnowledgeBase.updateOne(
        { _id: kb._id },
        {
          $set: {
            indexingStatus: "Pending",
            indexedAt: null,
          },
        }
      );
    }
  }

  return KnowledgeBaseAsset.find({
    knowledgeBase: kb._id,
  }).lean();
};


/* ================================================================
   QUEUE KNOWLEDGE BASE REINDEX
================================================================ */

export const queueKnowledgeBaseReindex = async (
  knowledgeBaseId
) => {

  return syncKnowledgeBaseAssets(
    knowledgeBaseId,
    { enqueue: true }
  );
};


/* ================================================================
   PROCESS KNOWLEDGE BASE JOB

   Complete indexing pipeline:

   1. Load asset and Knowledge Base.
   2. Validate publication, AI and visibility permissions.
   3. Extract document content.
   4. Preserve structured extraction output.
   5. Generate structured text chunks.
   6. Generate Gemini embeddings.
   7. Insert new Qdrant vectors.
   8. Delete previous vectors by their saved point IDs.
   9. Update MongoDB indexing metadata.

   Existing vectors are not deleted until new vectors have
   been successfully inserted.
================================================================ */

export const processKnowledgeBaseJob = async (job) => {

  /* --------------------------------------------------------------
     LOAD ASSET AND KNOWLEDGE BASE
  -------------------------------------------------------------- */

  const [asset, kb] = await Promise.all([

    KnowledgeBaseAsset.findById(job.asset),

    KnowledgeBase.findById(job.knowledgeBase).populate("category", "name"),

  ]);

  if (!asset || !kb) {
    throw new Error(
      "Knowledge Base asset or parent record no longer exists"
    );
  }


  /* --------------------------------------------------------------
     VALIDATE INDEXING ELIGIBILITY
  -------------------------------------------------------------- */

  if (!isKnowledgeBaseIndexable(kb)) {

    // This is an authorization/visibility change, not a normal
    // reindex. Remove the asset's vectors so it cannot be retrieved.

    await deleteVectorsByAsset(asset._id);

    asset.indexingStatus = "Pending";
    asset.chunkIds = [];
    asset.totalChunks = 0;

    await asset.save();

    await refreshKnowledgeBaseIndexStatus(kb._id);

    return {
      skipped: true,
      reason:
        "Knowledge Base entry is not Published, AI-enabled, and publicly visible",
    };
  }


  /* --------------------------------------------------------------
     EXTRACT DOCUMENT CONTENT
  -------------------------------------------------------------- */

  let extracted;

  if (asset.sourceType === "ARTICLE_CONTENT") {

    const articleText = String(
      kb.content || ""
    ).trim();

    extracted = {
      text: articleText,
      method: "mongodb:article-content",
      characters: articleText.length,
    };
  } else {
    const file = await File.findById(
      asset.file
    ).lean();

    if (!file?.path) {
      throw new Error("Attachment file metadata or path is missing");
    }

    extracted = await extractOfficeFile({
      filePath: file.path,
      originalName: file.originalname || asset.originalName,
    });

    console.log("\n========== KB EXTRACTION DEBUG ==========");
    console.log("Asset:", asset.originalName);
    console.log("Extraction Method:", extracted.method);
    console.log("Extracted Characters:", extracted.characters);
    console.log("Sections Count:", extracted.sections?.length || 0);
    console.log("Salt Spray Content:", extracted.text.split("\n").filter((line) => /salt spray|1000 hours|1200 hours/i.test(line)));
    console.log("========================================\n");
  }


  /* --------------------------------------------------------------
     OCR VALIDATION
  -------------------------------------------------------------- */

  if (extracted.needsOcr) {

    throw new Error(
      `OCR_REQUIRED: ${extracted.warning ||
      "Document requires OCR before indexing."
      }`
    );
  }


  /* --------------------------------------------------------------
     EXTRACTION VALIDATION
  -------------------------------------------------------------- */

  if (!String(extracted.text || "").trim()) {

    throw new Error(
      "No readable document text was extracted"
    );
  }


  /* --------------------------------------------------------------
     STRUCTURED TEXT CHUNKING

     IMPORTANT:

     Pass the complete extraction object rather than only
     extracted.text.

     This allows the structured chunker to preserve available
     slide, page, worksheet, table and source-location metadata.
  -------------------------------------------------------------- */

  const chunks = createTextChunks(
    extracted,
    {
      knowledgeBaseId: String(kb._id),
      assetId: String(asset._id),
      sourceName: asset.originalName,
    }
  );

  console.log("\n========== KB CHUNK DEBUG ==========");
  console.log("Total Chunks:", chunks.length);
  chunks.forEach((chunk, index) => {
    if (/salt spray|1000 hours|1200 hours/i.test(chunk.content)) {
      console.log(`Chunk ${index}:`);
      console.log(chunk.content);
    }
  });
  console.log("====================================\n");

  if (!chunks.length) {

    throw new Error(
      "Document extraction produced no indexable chunks"
    );
  }


  /* --------------------------------------------------------------
     GENERATE GEMINI DOCUMENT EMBEDDINGS
  -------------------------------------------------------------- */

  const embeddings = await generateDocumentEmbeddings(
    chunks.map((chunk) => chunk.content)
  );

  if (!Array.isArray(embeddings)) {

    throw new Error(
      "Embedding service returned an invalid response"
    );
  }

  if (embeddings.length !== chunks.length) {

    throw new Error(
      `Embedding count mismatch: expected ${chunks.length}, received ${embeddings.length}`
    );
  }


  /* --------------------------------------------------------------
     SAVE PREVIOUS VECTOR IDS

     These are the old Qdrant point IDs saved in MongoDB during
     the previous successful indexing operation.
  -------------------------------------------------------------- */

  const previousPointIds = Array.isArray(asset.chunkIds)
    ? asset.chunkIds.map(String).filter(Boolean)
    : [];


  /* --------------------------------------------------------------
     INSERT NEW QDRANT VECTORS

     Do this BEFORE deleting the previous point IDs.

     The new points receive the same asset ID, so they remain
     associated with the original Knowledge Base asset.
  -------------------------------------------------------------- */

  const pointIds = await upsertKnowledgeBaseVectors({

    chunks,

    embeddings,

    metadata: {

      knowledgeBaseId: String(kb._id),

      assetId: String(asset._id),

      code: kb.code,

      title: kb.title,

      // name is searchable/displayable; categoryId is the stable reference
      category: kb.category?.name || "",

      categoryId: kb.category?._id ? String(kb.category._id) : "",

      status: kb.status,

      aiEnabled: kb.aiEnabled,

      visibility: kb.visibility,

      originalName: asset.originalName,

      extractionMethod: extracted.method,

    },

  });


  /* --------------------------------------------------------------
     VALIDATE QDRANT INSERTION RESULT
  -------------------------------------------------------------- */

  if (
    !Array.isArray(pointIds) ||
    pointIds.length !== chunks.length
  ) {

    throw new Error(
      `Qdrant point count mismatch: expected ${chunks.length}, received ${Array.isArray(pointIds) ? pointIds.length : 0
      }`
    );
  }


  /* --------------------------------------------------------------
     DELETE PREVIOUS VECTORS

     Delete only the previous point IDs.

     NEVER use deleteVectorsByAsset(asset._id) here, because that
     would also delete the newly inserted vectors.
  -------------------------------------------------------------- */

  if (previousPointIds.length) {

    await deleteKnowledgeBaseVectors(
      previousPointIds
    );
  }


  /* --------------------------------------------------------------
     UPDATE ASSET INDEXING METADATA
  -------------------------------------------------------------- */

  asset.extractionStatus = "Completed";

  asset.indexingStatus = "Indexed";

  asset.extractionMethod = extracted.method;

  asset.extractedCharacters =
    extracted.characters ?? extracted.text.length;

  asset.totalChunks = chunks.length;

  asset.chunkIds = pointIds;

  asset.lastIndexedAt = new Date();

  asset.error = null;

  await asset.save();


  /* --------------------------------------------------------------
     REFRESH PARENT KNOWLEDGE BASE STATUS
  -------------------------------------------------------------- */

  await refreshKnowledgeBaseIndexStatus(
    kb._id
  );


  /* --------------------------------------------------------------
     RETURN JOB RESULT
  -------------------------------------------------------------- */

  return {

    success: true,

    chunks: chunks.length,

    vectors: pointIds.length,

    extractionMethod: extracted.method,

    extractedCharacters:
      extracted.characters ?? extracted.text.length,

  };
};


/* ================================================================
   CLEANUP KNOWLEDGE BASE INDEX

   Deletes all vectors and asset/job records belonging to the
   specified Knowledge Base entry.

   This is a deliberate full cleanup operation. Do not call it
   during an ordinary reindex.
================================================================ */

export const cleanupKnowledgeBaseIndex = async (
  knowledgeBaseId
) => {

  const assets = await KnowledgeBaseAsset.find({
    knowledgeBase: knowledgeBaseId,
  })
    .select("_id")
    .lean();

  for (const asset of assets) {

    await deleteVectorsByAsset(
      asset._id
    );
  }

  const assetIds = assets.map(
    (asset) => asset._id
  );

  await KnowledgeBaseJob.deleteMany({
    knowledgeBase: knowledgeBaseId,
  });

  await KnowledgeBaseAsset.deleteMany({
    knowledgeBase: knowledgeBaseId,
  });

  return {
    removedAssets: assetIds.length,
  };
};