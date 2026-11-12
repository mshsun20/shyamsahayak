import { QdrantClient } from "@qdrant/js-client-rest";
import kbConfig from "./kbAI.config.js";

const qdrantClient = new QdrantClient({
    url: kbConfig.qdrant.url,
    ...(kbConfig.qdrant.apiKey ? { apiKey: kbConfig.qdrant.apiKey } : {}),
});

export const initializeKnowledgeBaseCollection = async () => {
    if (!kbConfig.enabled) return;
    const collectionName = kbConfig.qdrant.collection;

    try {
        await qdrantClient.getCollection(collectionName);
        console.log(`[QDRANT] Collection exists: ${collectionName}`);
        return;
    } catch (error) {
        if (error.status !== 404) throw error;
    }

    await qdrantClient.createCollection(collectionName, {
        vectors: {
            size: kbConfig.voyage.dimensions,
            distance: "Cosine",
        },
    });

    console.log(`[QDRANT] Collection created: ${collectionName}`);
};

export default qdrantClient;
