
import { randomUUID } from "crypto";

import qdrantClient from "../../config/qdrant.js";
import kbConfig from "../../config/kbAI.config.js";

const COLLECTION = kbConfig.qdrant.collection;

export const upsertKnowledgeBaseVectors = async ({
    chunks,
    embeddings,
    metadata,
}) => {
    if (chunks.length !== embeddings.length) {
        throw new Error("Chunk and embedding count mismatch");
    }

    if (!chunks.length) return [];

    const points = chunks.map((chunk, index) => ({
        id: randomUUID(),
        vector: embeddings[index],
        payload: {
            ...metadata,
            content: chunk.content,
            chunkIndex: chunk.metadata.chunkIndex,
            indexedAt: new Date().toISOString(),
        },
    }));

    await qdrantClient.upsert(COLLECTION, {
        wait: true,
        points,
    });

    return points.map((point) => point.id);
};

export const searchKnowledgeBaseVectors = async ({
    vector,
    limit = 10,
    category,
}) => {
    const must = [
        {
            key: "status",
            match: { value: "Published" },
        },
        {
            key: "aiEnabled",
            match: { value: true },
        },
    ];

    if (category) {
        must.push({
            key: "category",
            match: { value: category },
        });
    }

    return qdrantClient.search(COLLECTION, {
        vector,
        limit,
        with_payload: true,
        score_threshold: 0.25,
        filter: { must },
    });
};

export const deleteKnowledgeBaseVectors = async (pointIds = []) => {
    if (!pointIds.length) return;

    await qdrantClient.delete(COLLECTION, {
        wait: true,
        points: pointIds,
    });
};
