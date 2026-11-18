// import { QdrantClient } from "@qdrant/js-client-rest";
// import kbConfig from "./kbAI.config.js";

// const qdrantClient = new QdrantClient({
//     url: kbConfig.qdrant.url,
//     ...(kbConfig.qdrant.apiKey ? { apiKey: kbConfig.qdrant.apiKey } : {}),
// });

// const COLLECTION = kbConfig.qdrant.collection;

// /*
//  * Every field used in a Qdrant filter should have
//  * an index with the corresponding payload data type.
//  */
// const REQUIRED_PAYLOAD_INDEXES = [
//     { field_name: "status", field_schema: "keyword" },
//     { field_name: "aiEnabled", field_schema: "bool" },
//     { field_name: "visibility", field_schema: "keyword" },
//     { field_name: "category", field_schema: "keyword" },
//     { field_name: "assetId", field_schema: "keyword" },
// ];

// /* ---------------------------------------------------------
//    CHECK WHETHER COLLECTION EXISTS
// --------------------------------------------------------- */
// const collectionExists = async (collectionName) => {
//     try {
//         await qdrantClient.getCollection(collectionName);
//         return true;
//     } catch (error) {
//         const status =
//             error.status ??
//             error.statusCode ??
//             error.response?.status;

//         if (Number(status) === 404) {
//             return false;
//         }

//         throw error;
//     }
// };

// /* ---------------------------------------------------------
//    ENSURE PAYLOAD INDEXES
// --------------------------------------------------------- */
// export const initializeKnowledgeBasePayloadIndexes = async () => {
//     const collectionInfo = await qdrantClient.getCollection(COLLECTION);

//     const payloadSchema =
//         collectionInfo.payload_schema ??
//         collectionInfo.result?.payload_schema ??
//         {};

//     for (const index of REQUIRED_PAYLOAD_INDEXES) {
//         const existingIndex = payloadSchema[index.field_name];

//         if (existingIndex) {
//             const existingType =
//                 existingIndex.data_type ??
//                 existingIndex.field_schema;

//             if (
//                 existingType &&
//                 existingType !== index.field_schema
//             ) {
//                 throw new Error(
//                     `[QDRANT] Payload index type mismatch for "${index.field_name}". ` +
//                     `Expected "${index.field_schema}", found "${existingType}".`
//                 );
//             }

//             console.log(
//                 `[QDRANT] Payload index already exists: ${index.field_name}`
//             );

//             continue;
//         }

//         await qdrantClient.createPayloadIndex(COLLECTION, {
//             field_name: index.field_name,
//             field_schema: index.field_schema,
//             wait: true,
//         });

//         console.log(
//             `[QDRANT] Payload index created: ${index.field_name} (${index.field_schema})`
//         );
//     }

//     console.log("[QDRANT] Payload indexes initialized successfully.");
// };

// /* ---------------------------------------------------------
//    INITIALIZE COLLECTION
// --------------------------------------------------------- */
// export const initializeKnowledgeBaseCollection = async () => {
//     if (!kbConfig.enabled) {
//         console.log("[QDRANT] Knowledge Base AI is disabled.");
//         return;
//     }

//     const exists = await collectionExists(COLLECTION);

//     if (!exists) {
//         await qdrantClient.createCollection(COLLECTION, {
//             vectors: {
//                 size: kbConfig.voyage.dimensions,
//                 distance: "Cosine",
//             },
//         });

//         console.log(`[QDRANT] Collection created: ${COLLECTION}`);
//     } else {
//         console.log(`[QDRANT] Collection exists: ${COLLECTION}`);
//     }

//     // Important: also runs for existing collections.
//     await initializeKnowledgeBasePayloadIndexes();
// };

// export default qdrantClient;





import { QdrantClient } from "@qdrant/js-client-rest";

import kbConfig from "./kbAI.config.js";

const qdrantClient = new QdrantClient({
    url: kbConfig.qdrant.url,

    ...(kbConfig.qdrant.apiKey
        ? { apiKey: kbConfig.qdrant.apiKey }
        : {}),
});

const COLLECTION = kbConfig.qdrant.collection;

console.log("========== QDRANT CONFIG ==========");
console.log("Collection:", COLLECTION);
console.log("Embedding Provider:", kbConfig.embedding.provider);
console.log("Embedding Model:", kbConfig.embedding.model);
console.log("Embedding Dimensions:", kbConfig.embedding.dimensions);
console.log("===================================");

const REQUIRED_PAYLOAD_INDEXES = [
    { field_name: "status", field_schema: "keyword" },
    { field_name: "aiEnabled", field_schema: "bool" },
    { field_name: "visibility", field_schema: "keyword" },
    { field_name: "category", field_schema: "keyword" },
    { field_name: "assetId", field_schema: "keyword" },
    { field_name: "knowledgeBaseId", field_schema: "keyword" },
];

const collectionExists = async () => {
    try {
        await qdrantClient.getCollection(COLLECTION);
        return true;
    } catch (error) {
        if (
            error?.status === 404 ||
            error?.statusCode === 404
        ) {
            return false;
        }

        throw error;
    }
};

const ensurePayloadIndexes = async () => {
    const collection = await qdrantClient.getCollection(COLLECTION);
    const existingSchema = collection?.payload_schema || {};

    for (const index of REQUIRED_PAYLOAD_INDEXES) {
        const existingIndex = existingSchema[index.field_name];

        if (existingIndex) continue;

        await qdrantClient.createPayloadIndex(COLLECTION, {
            field_name: index.field_name,
            field_schema: index.field_schema,
            wait: true,
        });

        console.log(`[QDRANT] Payload index created: ${index.field_name}`);
    }
};

export const initializeKnowledgeBaseCollection = async () => {
    if (!kbConfig.enabled) {
        console.log("[QDRANT] Knowledge Base AI disabled.");
        return;
    }

    const exists = await collectionExists();

    if (!exists) {
        await qdrantClient.createCollection(COLLECTION, {
            vectors: {
                size: kbConfig.embedding.dimensions,
                distance: "Cosine",
            },
        });

        console.log(`[QDRANT] Gemini collection created: ${COLLECTION}`);
    } else {
        const collection = await qdrantClient.getCollection(COLLECTION);
        const existingSize = collection?.config?.params?.vectors?.size;

        if (existingSize && existingSize !== kbConfig.embedding.dimensions) {
            throw new Error(`Qdrant dimension mismatch. Existing: ${existingSize}, configured: ${kbConfig.embedding.dimensions}. Use a separate collection for the new embedding model.`);
        }

        console.log(`[QDRANT] Collection exists: ${COLLECTION}`);
    }

    await ensurePayloadIndexes();

    console.log("[QDRANT] Payload indexes verified.");
};

export default qdrantClient;
