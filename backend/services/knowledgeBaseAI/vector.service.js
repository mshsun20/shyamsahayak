// import { randomUUID } from "crypto";
// import qdrantClient from "../../config/qdrant.js";
// import kbConfig from "../../config/kbAI.config.js";

// const COLLECTION = kbConfig.qdrant.collection;

// /* ------------------------------------------------------------------
//    UPSERT KNOWLEDGE BASE VECTORS
// ------------------------------------------------------------------ */
// export const upsertKnowledgeBaseVectors = async ({
//   chunks = [],
//   embeddings = [],
//   metadata = {},
// }) => {
//   if (chunks.length !== embeddings.length) {
//     throw new Error("Chunk and embedding count mismatch");
//   }

//   if (!chunks.length) return [];

//   const points = chunks.map((chunk, index) => ({
//     id: randomUUID(),
//     vector: embeddings[index],
//     payload: {
//       ...metadata,
//       content: chunk.content,
//       chunkIndex: chunk.metadata?.chunkIndex ?? index,
//       indexedAt: new Date().toISOString(),
//     },
//   }));

//   await qdrantClient.upsert(COLLECTION, {
//     wait: true,
//     points,
//   });

//   return points.map((point) => point.id);
// };

// /* ------------------------------------------------------------------
//    SEARCH KNOWLEDGE BASE VECTORS

//    Supports:
//    - New Qdrant REST SDK: query()
//    - Older Qdrant REST SDK: search()

//    Always returns an array of points.
// ------------------------------------------------------------------ */
// export const searchKnowledgeBaseVectors = async ({
//   vector,
//   limit = 10,
//   category,
// }) => {
//   if (!Array.isArray(vector) || !vector.length) {
//     throw new Error("A valid query vector is required");
//   }

//   const must = [
//     {
//       key: "status",
//       match: { value: "Published" },
//     },
//     {
//       key: "aiEnabled",
//       match: { value: true },
//     },
//     {
//       key: "visibility",
//       match: { value: "All Users" },
//     },
//   ];

//   if (category) {
//     must.push({
//       key: "category",
//       match: { value: category },
//     });
//   }

//   const filter = { must };

//   const searchOptions = {
//     limit: Math.max(1, Math.min(20, Number(limit) || 10)),
//     with_payload: true,
//     score_threshold: 0.25,
//     filter,
//   };

//   let response;

//   // New Qdrant REST API (v1.19+)
//   if (typeof qdrantClient.query === "function") {
//     response = await qdrantClient.query(COLLECTION, {
//       query: vector,
//       ...searchOptions,
//     });

//     // New query() API returns { points: [...] }
//     return response?.points ?? [];
//   }

//   // Legacy Qdrant REST API
//   if (typeof qdrantClient.search === "function") {
//     response = await qdrantClient.search(COLLECTION, {
//       vector,
//       ...searchOptions,
//     });

//     return Array.isArray(response) ? response : [];
//   }

//   throw new Error(
//     "Unsupported Qdrant client API. Expected query() or search(). " +
//     "Check the installed @qdrant/js-client-rest version."
//   );
// };

// /* ------------------------------------------------------------------
//    DELETE VECTORS BY ASSET
// ------------------------------------------------------------------ */
// export const deleteVectorsByAsset = async (assetId) => {
//   if (!assetId) return;

//   await qdrantClient.delete(COLLECTION, {
//     wait: true,
//     filter: {
//       must: [
//         {
//           key: "assetId",
//           match: { value: String(assetId) },
//         },
//       ],
//     },
//   });
// };

// /* ------------------------------------------------------------------
//    DELETE KNOWLEDGE BASE VECTORS BY POINT IDS
// ------------------------------------------------------------------ */
// export const deleteKnowledgeBaseVectors = async (pointIds = []) => {
//   if (!pointIds.length) return;

//   await qdrantClient.delete(COLLECTION, {
//     wait: true,
//     points: pointIds,
//   });
// };




import { randomUUID } from "crypto";
import qdrantClient from "../../config/qdrant.js";
import kbConfig from "../../config/kbAI.config.js";

const COLLECTION = kbConfig.qdrant.collection;

/* --------------------------------------------------------------
   Insert document vectors
-------------------------------------------------------------- */

export const upsertKnowledgeBaseVectors = async ({
  chunks = [],
  embeddings = [],
  metadata = {},
}) => {
  if (chunks.length !== embeddings.length) {
    throw new Error("Chunk and embedding count mismatch.");
  }

  if (!chunks.length) return [];

  const points = chunks.map((chunk, index) => {
    const vector = embeddings[index];

    if (
      !Array.isArray(vector) ||
      vector.length !== kbConfig.embedding.dimensions
    ) {
      throw new Error(`Invalid embedding dimensions at chunk ${index}.`);
    }

    return {
      id: randomUUID(),
      vector,
      payload: {
        ...metadata,
        content: chunk.content,
        chunkIndex: chunk.metadata?.chunkIndex ?? index,
        indexedAt: new Date().toISOString(),
      },
    };
  });

  await qdrantClient.upsert(COLLECTION, {
    wait: true,
    points,
  });

  return points.map((point) => point.id);
};

/* --------------------------------------------------------------
   Search vectors using Gemini query embeddings
-------------------------------------------------------------- */

export const searchKnowledgeBaseVectors = async ({
  vector,
  limit = 10,
  category,
}) => {
  if (
    !Array.isArray(vector) ||
    vector.length !== kbConfig.embedding.dimensions
  ) {
    throw new Error(`Invalid search vector. Expected ${kbConfig.embedding.dimensions} dimensions.`);
  }

  const must = [
    {
      key: "status",
      match: { value: "Published" },
    },
    {
      key: "aiEnabled",
      match: { value: true },
    },
    {
      key: "visibility",
      match: { value: "All Users" },
    },
  ];

  if (category) {
    must.push({
      key: "category",
      match: { value: category },
    });
  }

  const response = await qdrantClient.query(COLLECTION, {
    query: vector,
    limit,
    with_payload: true,
    score_threshold: 0.25,
    filter: { must },
  });

  return response?.points || [];
};

/* --------------------------------------------------------------
   Delete vectors belonging to an asset
-------------------------------------------------------------- */

export const deleteVectorsByAsset = async (assetId) => {
  if (!assetId) return;

  await qdrantClient.delete(COLLECTION, {
    wait: true,
    filter: {
      must: [
        {
          key: "assetId",
          match: {
            value: String(assetId),
          },
        },
      ],
    },
  });
};

/* --------------------------------------------------------------
   Delete vectors by explicit point IDs
-------------------------------------------------------------- */

export const deleteKnowledgeBaseVectors = async (pointIds = []) => {
  if (!pointIds.length) return;

  await qdrantClient.delete(COLLECTION, {
    wait: true,
    points: pointIds,
  });
};

export default {
  upsertKnowledgeBaseVectors,
  searchKnowledgeBaseVectors,
  deleteVectorsByAsset,
  deleteKnowledgeBaseVectors,
};
