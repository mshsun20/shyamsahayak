import kbConfig from "../../config/kbAI.config.js";

const VOYAGE_ENDPOINT = "https://api.voyageai.com/v1/embeddings";

const requestEmbeddings = async (texts, inputType) => {
    if (!kbConfig.enabled) {
        throw new Error("Knowledge Base AI is disabled");
    }

    if (!Array.isArray(texts) || texts.length === 0) {
        throw new Error("Embedding texts are required");
    }

    const response = await fetch(VOYAGE_ENDPOINT, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${kbConfig.voyage.apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            input: texts,
            model: kbConfig.voyage.model,
            input_type: inputType,
        }),
        signal: AbortSignal.timeout(60000),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result?.detail || result?.message || `Voyage API error: ${response.status}`);
    }

    if (!Array.isArray(result.data)) throw new Error("Invalid Voyage embedding response");

    return result.data.sort((a, b) => a.index - b.index).map((item) => item.embedding);
};

export const generateDocumentEmbeddings = async (texts = []) => {
    const batchSize = kbConfig.voyage.batchSize;
    const embeddings = [];

    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const result = await requestEmbeddings(batch, "document");
        embeddings.push(...result);
    }

    return embeddings;
};

export const generateQueryEmbedding = async (query) => {
    const embeddings = await requestEmbeddings([query], "query");
    return embeddings[0];
};
