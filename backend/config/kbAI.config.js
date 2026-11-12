const config = {
    enabled: process.env.KB_AI_ENABLED === "true",

    voyage: {
        apiKey: process.env.VOYAGE_API_KEY,
        model: process.env.VOYAGE_MODEL || "voyage-4-lite",
        dimensions: Number(process.env.VOYAGE_DIMENSIONS || 1024),
        batchSize: Number(process.env.KB_EMBEDDING_BATCH_SIZE || 32),
    },

    qdrant: {
        url: process.env.QDRANT_URL || "http://127.0.0.1:6333",
        apiKey: process.env.QDRANT_API_KEY || undefined,
        collection: process.env.QDRANT_COLLECTION || "shyam_sahayak_knowledge_base",
    },

    chunking: {
        chunkSize: Number(process.env.KB_CHUNK_SIZE || 800),
        overlap: Number(process.env.KB_CHUNK_OVERLAP || 120),
    },

    retrieval: {
        limit: Number(process.env.KB_RETRIEVAL_LIMIT || 10),
    },

    worker: {
        enabled: process.env.KB_WORKER_ENABLED === "true",
        interval: Number(process.env.KB_WORKER_INTERVAL_MS || 5000),
        concurrency: Number(process.env.KB_WORKER_CONCURRENCY || 2),
        maxAttempts: Number(process.env.KB_JOB_MAX_ATTEMPTS || 3),
        lockTimeout: Number(process.env.KB_JOB_LOCK_TIMEOUT_MS || 600000),
    },

    files: {
        maxSizeMB: Number(process.env.KB_MAX_FILE_SIZE_MB || 25),
        maxPdfPages: Number(process.env.KB_MAX_PDF_PAGES || 100),
        maxCharacters: Number(process.env.KB_MAX_EXTRACTED_CHARACTERS || 2000000),
    },

    claude: {
        maxOutputTokens: Number(process.env.KB_CLAUDE_MAX_OUTPUT_TOKENS || 8000),
    },
};

export const validateKnowledgeBaseAIConfig = () => {
    if (!config.enabled) return;

    const missing = [];

    if (!config.voyage.apiKey) {
        missing.push("VOYAGE_API_KEY");
    }

    if (!config.qdrant.url) {
        missing.push("QDRANT_URL");
    }

    if (config.voyage.dimensions <= 0) {
        missing.push("VOYAGE_DIMENSIONS");
    }

    if (config.chunking.overlap >= config.chunking.chunkSize) {
        missing.push("KB_CHUNK_OVERLAP must be smaller than KB_CHUNK_SIZE");
    }

    if (missing.length) {
        throw new Error(`Knowledge Base AI configuration invalid: ${missing.join(", ")}`);
    }
};

export default config;
