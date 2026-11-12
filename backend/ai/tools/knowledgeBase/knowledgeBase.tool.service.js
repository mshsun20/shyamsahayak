
import KnowledgeBase from "../../../models/knowledgeBase.model.js";

import kbConfig from "../../../config/kbAI.config.js";

import {
    generateQueryEmbedding,
} from "../../../services/knowledgeBaseAI/embedding.service.js";

import {
    searchKnowledgeBaseVectors,
} from "../../../services/knowledgeBaseAI/vector.service.js";


/* ------------------------------------------------------------------
   Constants
------------------------------------------------------------------ */

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 20;


/* ------------------------------------------------------------------
   Normalize text
------------------------------------------------------------------ */

const normalizeText = (value) => {
    if (value === null || value === undefined) return "";

    return String(value)
        .trim()
        .replace(/\s+/g, " ");
};


/* ------------------------------------------------------------------
   Validate search input
------------------------------------------------------------------ */

const validateSearchInput = ({ query, limit }) => {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        throw new Error("Knowledge Base search query is required.");
    }

    if (normalizedQuery.length < 2) {
        throw new Error("Knowledge Base search query is too short.");
    }

    const safeLimit = Math.min(
        Math.max(Number(limit) || DEFAULT_LIMIT, 1),
        MAX_LIMIT
    );

    return {
        query: normalizedQuery,
        limit: safeLimit,
    };
};


/* ------------------------------------------------------------------
   Extract Knowledge Base ID from Qdrant payload

   The ingestion service MUST store knowledgeBaseId in every
   Qdrant point payload.
------------------------------------------------------------------ */

const getKnowledgeBaseId = (payload = {}) => {
    return (
        payload.knowledgeBaseId ||
        payload.knowledgeBase ||
        payload.kbId ||
        null
    );
};


/* ------------------------------------------------------------------
   Search Knowledge Base

   This is the main service called by knowledgeBase.tool.js.
------------------------------------------------------------------ */

export const searchKnowledgeBase = async ({
    query,
    category = "",
    limit = DEFAULT_LIMIT,
    userId,
}) => {

    /* --------------------------------------------------------------
       1. Validate authenticated user
    -------------------------------------------------------------- */

    if (!userId) {
        throw new Error(
            "Authenticated user context is required for Knowledge Base search."
        );
    }


    /* --------------------------------------------------------------
       2. Check Knowledge Base AI configuration
    -------------------------------------------------------------- */

    if (!kbConfig.enabled) {
        throw new Error("Knowledge Base AI is currently disabled.");
    }

    if (!kbConfig.voyage.apiKey) {
        throw new Error("Voyage AI API key is not configured.");
    }


    /* --------------------------------------------------------------
       3. Validate input
    -------------------------------------------------------------- */

    const validated = validateSearchInput({
        query,
        limit,
    });

    const normalizedCategory = normalizeText(category);


    /* --------------------------------------------------------------
       4. Generate query embedding
    -------------------------------------------------------------- */

    const queryVector = await generateQueryEmbedding(
        validated.query
    );

    if (
        !Array.isArray(queryVector) ||
        queryVector.length !== kbConfig.voyage.dimensions
    ) {
        throw new Error(
            "Invalid query embedding dimensions. Check VOYAGE_DIMENSIONS and Qdrant configuration."
        );
    }


    /* --------------------------------------------------------------
       5. Search Qdrant
    -------------------------------------------------------------- */

    const vectorResults = await searchKnowledgeBaseVectors({
        vector: queryVector,
        limit: validated.limit,
        category: normalizedCategory || undefined,
    });


    if (!Array.isArray(vectorResults) || vectorResults.length === 0) {
        return {
            success: true,
            found: false,
            query: validated.query,
            count: 0,
            matches: [],
            sources: [],
            message: "No relevant Knowledge Base information was found.",
        };
    }


    /* --------------------------------------------------------------
       6. Extract unique Knowledge Base IDs
    -------------------------------------------------------------- */

    const knowledgeBaseIds = [
        ...new Set(
            vectorResults
                .map((item) =>
                    getKnowledgeBaseId(item.payload || {})
                )
                .filter(Boolean)
                .map(String)
        ),
    ];


    if (!knowledgeBaseIds.length) {
        return {
            success: true,
            found: false,
            query: validated.query,
            count: 0,
            matches: [],
            sources: [],
            message: "No valid Knowledge Base references were found.",
        };
    }


    /* --------------------------------------------------------------
       7. Revalidate records in MongoDB

       Never trust Qdrant payload alone for authorization or
       publication status.
    -------------------------------------------------------------- */

    const knowledgeBases = await KnowledgeBase.find({
        _id: { $in: knowledgeBaseIds },

        status: "Published",

        aiEnabled: true,

        visibility: "All Users",
    })
        .select(
            "_id code title category shortDescription status aiEnabled visibility"
        )
        .lean();


    const knowledgeBaseMap = new Map(
        knowledgeBases.map((item) => [
            String(item._id),
            item,
        ])
    );


    /* --------------------------------------------------------------
       8. Build validated search matches
    -------------------------------------------------------------- */

    const matches = [];

    for (const result of vectorResults) {

        const payload = result.payload || {};

        const knowledgeBaseId = getKnowledgeBaseId(payload);

        if (!knowledgeBaseId) continue;

        const knowledgeBase = knowledgeBaseMap.get(
            String(knowledgeBaseId)
        );

        // Ignore deleted, unpublished, disabled, or inaccessible docs.
        if (!knowledgeBase) continue;

        const content = normalizeText(payload.content);

        if (!content) continue;

        matches.push({
            score: Number(result.score || 0),

            content,

            source: {
                knowledgeBaseId: String(knowledgeBase._id),

                code: knowledgeBase.code,

                title: knowledgeBase.title,

                category: knowledgeBase.category,

                chunkIndex:
                    Number(payload.chunkIndex ?? 0),

                assetId:
                    payload.assetId
                        ? String(payload.assetId)
                        : null,

                originalName:
                    payload.originalName || null,
            },
        });
    }


    /* --------------------------------------------------------------
       9. Return no-result response
    -------------------------------------------------------------- */

    if (!matches.length) {
        return {
            success: true,
            found: false,
            query: validated.query,
            count: 0,
            matches: [],
            sources: [],
            message:
                "No accessible Published and AI-enabled Knowledge Base information matched the query.",
        };
    }


    /* --------------------------------------------------------------
       10. Build unique source list
    -------------------------------------------------------------- */

    const sourceMap = new Map();

    for (const match of matches) {

        const sourceId = match.source.knowledgeBaseId;

        if (!sourceMap.has(sourceId)) {
            sourceMap.set(sourceId, {
                knowledgeBaseId: sourceId,
                code: match.source.code,
                title: match.source.title,
                category: match.source.category,
            });
        }
    }


    /* --------------------------------------------------------------
       11. Return result to Claude
    -------------------------------------------------------------- */

    return {
        success: true,

        found: true,

        query: validated.query,

        count: matches.length,

        matches,

        sources: Array.from(sourceMap.values()),

        message:
            "Relevant Knowledge Base information retrieved successfully.",
    };
};


export default {
    searchKnowledgeBase,
};
