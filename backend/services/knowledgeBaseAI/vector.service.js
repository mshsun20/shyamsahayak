
// import { randomUUID } from "crypto";

// import qdrantClient from "../../config/qdrant.js";
// import kbConfig from "../../config/kbAI.config.js";

// const COLLECTION = kbConfig.qdrant.collection;


// /* --------------------------------------------------------------
//    UPSERT KNOWLEDGE BASE VECTORS
// -------------------------------------------------------------- */

// export const upsertKnowledgeBaseVectors = async ({
//   chunks = [],
//   embeddings = [],
//   metadata = {},
// }) => {
//   if (chunks.length !== embeddings.length) {
//     throw new Error(
//       "Chunk and embedding count mismatch."
//     );
//   }

//   if (!chunks.length) return [];

//   const points = chunks.map((chunk, index) => {
//     const vector = embeddings[index];

//     if (
//       !Array.isArray(vector) ||
//       vector.length !== kbConfig.embedding.dimensions
//     ) {
//       throw new Error(
//         `Invalid embedding dimensions at chunk ${index}.`
//       );
//     }

//     return {
//       id: randomUUID(),

//       vector,

//       payload: {
//         ...metadata,

//         content: chunk.content,

//         chunkIndex:
//           chunk.metadata?.chunkIndex ?? index,

//         indexedAt: new Date().toISOString(),
//       },
//     };
//   });

//   await qdrantClient.upsert(COLLECTION, {
//     wait: true,
//     points,
//   });

//   return points.map((point) => point.id);
// };


// /* --------------------------------------------------------------
//    SEARCH KNOWLEDGE BASE VECTORS
// -------------------------------------------------------------- */

// export const searchKnowledgeBaseVectors = async ({
//   vector,
//   limit = 10,
//   category,
// }) => {
//   if (
//     !Array.isArray(vector) ||
//     vector.length !== kbConfig.embedding.dimensions
//   ) {
//     throw new Error(
//       `Invalid search vector. Expected ${kbConfig.embedding.dimensions} dimensions.`
//     );
//   }

//   const must = [
//     {
//       key: "status",
//       match: {
//         value: "Published",
//       },
//     },
//     {
//       key: "aiEnabled",
//       match: {
//         value: true,
//       },
//     },
//   ];

//   /*
//    * Support the old and new public visibility values.
//    */
//   const should = [
//     {
//       key: "visibility",
//       match: {
//         value: "Visible to all users",
//       },
//     },
//     {
//       key: "visibility",
//       match: {
//         value: "All Users",
//       },
//     },
//   ];

//   if (category) {
//     must.push({
//       key: "category",
//       match: {
//         value: category,
//       },
//     });
//   }

//   const response = await qdrantClient.query(
//     COLLECTION,
//     {
//       query: vector,

//       limit: Math.max(
//         1,
//         Math.min(20, Number(limit) || 10)
//       ),

//       with_payload: true,

//       /*
//        * No score threshold during initial recall testing.
//        */
//       filter: {
//         must,
//         should,
//       },
//     }
//   );

//   return response?.points || [];
// };


// /* --------------------------------------------------------------
//    DELETE VECTORS BY ASSET
// -------------------------------------------------------------- */

// export const deleteVectorsByAsset = async (assetId) => {
//   if (!assetId) return;

//   await qdrantClient.delete(COLLECTION, {
//     wait: true,

//     filter: {
//       must: [
//         {
//           key: "assetId",
//           match: {
//             value: String(assetId),
//           },
//         },
//       ],
//     },
//   });
// };


// /* --------------------------------------------------------------
//    DELETE VECTORS BY POINT IDS
// -------------------------------------------------------------- */

// export const deleteKnowledgeBaseVectors = async (
//   pointIds = []
// ) => {
//   if (!pointIds.length) return;

//   await qdrantClient.delete(COLLECTION, {
//     wait: true,
//     points: pointIds,
//   });
// };


// export default {
//   upsertKnowledgeBaseVectors,
//   searchKnowledgeBaseVectors,
//   deleteVectorsByAsset,
//   deleteKnowledgeBaseVectors,
// };





import { randomUUID } from 'node:crypto';
import qdrantClient from '../../config/qdrant.js';
import kbConfig from '../../config/kbAI.config.js';

const COLLECTION = kbConfig.qdrant.collection;

export const upsertKnowledgeBaseVectors = async ({ chunks = [], embeddings = [], metadata = {} }) => {
  if (chunks.length !== embeddings.length) throw new Error('Chunk and embedding count mismatch');
  if (!chunks.length) return [];
  const points = chunks.map((chunk, index) => {
    const vector = embeddings[index];
    if (!Array.isArray(vector) || vector.length !== kbConfig.embedding.dimensions || vector.some((v) => !Number.isFinite(v))) {
      throw new Error(`Invalid embedding vector at chunk ${index}; expected ${kbConfig.embedding.dimensions} finite values`);
    }
    return {
      id: randomUUID(), vector,
      payload: {
        ...metadata,
        content: chunk.content,
        chunkIndex: chunk.metadata?.chunkIndex ?? index,
        sourceLocation: chunk.metadata || {},
        indexedAt: new Date().toISOString(),
      },
    };
  });
  await qdrantClient.upsert(COLLECTION, { wait: true, points });
  return points.map((point) => point.id);
};

export const searchKnowledgeBaseVectors = async ({ vector, limit = 10, category }) => {
  if (!Array.isArray(vector) || vector.length !== kbConfig.embedding.dimensions) {
    throw new Error(`Invalid search vector. Expected ${kbConfig.embedding.dimensions} dimensions`);
  }
  const must = [
    { key: 'status', match: { value: 'Published' } },
    { key: 'aiEnabled', match: { value: true } },
  ];
  const should = [
    { key: 'visibility', match: { value: 'All Users' } },
    { key: 'visibility', match: { value: 'Visible to all users' } },
  ];
  if (category) must.push({ key: 'category', match: { value: category } });
  const response = await qdrantClient.query(COLLECTION, {
    query: vector,
    limit: Math.max(1, Math.min(30, Number(limit) || 10)),
    with_payload: true,
    filter: { must, should },
  });
  return response?.points || [];
};

export const deleteVectorsByAsset = async (assetId) => {
  if (!assetId) return;
  await qdrantClient.delete(COLLECTION, {
    wait: true,
    filter: { must: [{ key: 'assetId', match: { value: String(assetId) } }] },
  });
};

export const deleteKnowledgeBaseVectors = async (pointIds = []) => {
  const ids = [...new Set(pointIds.map(String).filter(Boolean))];
  if (!ids.length) return { deleted: 0 };

  await qdrantClient.delete(kbConfig.qdrant.collection, { points: ids, wait: true });
  return { deleted: ids.length };
};

export default { upsertKnowledgeBaseVectors, searchKnowledgeBaseVectors, deleteVectorsByAsset, deleteKnowledgeBaseVectors };
