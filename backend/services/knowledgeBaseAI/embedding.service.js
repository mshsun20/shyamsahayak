// import kbConfig from "../../config/kbAI.config.js";

// const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";

// const requestEmbeddings = async (texts = [], inputType = "document") => {
//   if (!Array.isArray(texts) || !texts.length) {
//     throw new Error("Embedding input must contain at least one text.");
//   }

//   if (!process.env.VOYAGE_API_KEY) {
//     throw new Error("VOYAGE_API_KEY is not configured.");
//   }

//   const response = await fetch(VOYAGE_API_URL, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       model: kbConfig.voyage.model,
//       input: texts,
//       input_type: inputType,
//       output_dimension: kbConfig.voyage.dimensions,
//     }),
//   });

//   const responseText = await response.text();

//   let result;

//   try {
//     result = JSON.parse(responseText);
//   } catch {
//     result = { message: responseText };
//   }

//   if (!response.ok) {
//     const message =
//       result?.detail ||
//       result?.message ||
//       result?.error?.message ||
//       responseText;

//     if (response.status === 429) {
//       throw new Error(
//         `[VOYAGE_RATE_LIMIT] Voyage AI rate limit reached. ` +
//         `Please wait before retrying. Details: ${message}`
//       );
//     }

//     if (response.status === 401 || response.status === 403) {
//       throw new Error(
//         `[VOYAGE_AUTH_ERROR] Voyage API authentication failed: ${message}`
//       );
//     }

//     throw new Error(
//       `[VOYAGE_API_ERROR] HTTP ${response.status}: ${message}`
//     );
//   }

//   if (!Array.isArray(result?.data)) {
//     throw new Error("Voyage AI returned an invalid embedding response.");
//   }

//   const embeddings = result.data
//     .sort((a, b) => a.index - b.index)
//     .map((item) => item.embedding);

//   if (embeddings.length !== texts.length) {
//     throw new Error("Voyage AI returned an unexpected embedding count.");
//   }

//   for (const embedding of embeddings) {
//     if (
//       !Array.isArray(embedding) ||
//       embedding.length !== kbConfig.voyage.dimensions
//     ) {
//       throw new Error(
//         "Voyage AI embedding dimensions do not match Qdrant configuration."
//       );
//     }
//   }

//   return embeddings;
// };

// /* Generate document embeddings */
// export const generateDocumentEmbeddings = async (texts = []) => {
//   return requestEmbeddings(texts, "document");
// };

// /* Generate query embedding */
// export const generateQueryEmbedding = async (text) => {
//   if (!text?.trim()) {
//     throw new Error("Query text cannot be empty.");
//   }

//   const [embedding] = await requestEmbeddings(
//     [text.trim()],
//     "query"
//   );

//   return embedding;
// };






import kbConfig from "../../config/kbAI.config.js";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const getEndpoint = (method) => {
  return `${GEMINI_BASE_URL}/${kbConfig.embedding.model}:${method}`;
};

/* --------------------------------------------------------------
  Normalize Gemini embeddings

  gemini-embedding-001 requires manual normalization when
  output dimensions are smaller than 3072.
-------------------------------------------------------------- */

const normalizeVector = (values = []) => {
  if (!Array.isArray(values) || !values.length) {
    throw new Error("Gemini returned an empty embedding.");
  }

  const magnitude = Math.sqrt(
    values.reduce((sum, value) => sum + value * value, 0)
  );

  if (!Number.isFinite(magnitude) || magnitude === 0) {
    throw new Error("Gemini returned an invalid embedding vector.");
  }

  return values.map((value) => value / magnitude);
};

/* --------------------------------------------------------------
   Validate and prepare texts
-------------------------------------------------------------- */

const validateTexts = (texts = []) => {
  if (!Array.isArray(texts)) {
    throw new Error("Embedding input must be an array.");
  }

  return texts.map((text, index) => {
    const value = String(text ?? "").trim();

    if (!value) {
      throw new Error(
        `Embedding input at index ${index} is empty.`
      );
    }

    return value;
  });
};

/* --------------------------------------------------------------
  Gemini API request with retry handling
-------------------------------------------------------------- */

const requestEmbeddings = async (
  texts,
  taskType = "RETRIEVAL_DOCUMENT"
) => {
  if (!kbConfig.enabled) {
    throw new Error("Knowledge Base AI is disabled.");
  }

  if (!kbConfig.embedding.apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const validTexts = validateTexts(texts);

  if (!validTexts.length) return [];

  const requests = validTexts.map((text) => ({
    model: `models/${kbConfig.embedding.model}`,

    content: {
      parts: [{ text }],
    },

    taskType,

    outputDimensionality:
      kbConfig.embedding.dimensions,
  }));

  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(
        getEndpoint("batchEmbedContents"),
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            "x-goog-api-key":
              kbConfig.embedding.apiKey,
          },

          body: JSON.stringify({ requests }),

          signal: AbortSignal.timeout(60000),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const apiMessage =
          result?.error?.message ||
          result?.message ||
          `HTTP ${response.status}`;

        if (response.status === 429) {
          throw new Error(
            `[GEMINI_RATE_LIMIT] ${apiMessage}`
          );
        }

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          throw new Error(
            `[GEMINI_AUTH_ERROR] ${apiMessage}`
          );
        }

        if (response.status >= 500) {
          throw new Error(
            `[GEMINI_SERVER_ERROR] ${apiMessage}`
          );
        }

        throw new Error(
          `[GEMINI_API_ERROR] ${apiMessage}`
        );
      }

      if (
        !Array.isArray(result.embeddings) ||
        result.embeddings.length !== validTexts.length
      ) {
        throw new Error(
          "Gemini returned an unexpected number of embeddings."
        );
      }

      return result.embeddings.map((item, index) => {
        const vector = normalizeVector(item.values || []);

        if (
          vector.length !==
          kbConfig.embedding.dimensions
        ) {
          throw new Error(
            `Gemini dimension mismatch at index ${index}. Expected ${kbConfig.embedding.dimensions}, received ${vector.length}.`
          );
        }

        return vector;
      });
    } catch (error) {
      lastError = error;

      const message = String(error?.message || "");

      const retryable =
        message.includes("[GEMINI_RATE_LIMIT]") ||
        message.includes("[GEMINI_SERVER_ERROR]") ||
        error?.name === "TimeoutError" ||
        error?.name === "TypeError";

      if (!retryable || attempt === 3) {
        throw error;
      }

      const delay = Math.min(
        30000,
        2000 * (2 ** (attempt - 1))
      );

      console.warn(
        `[GEMINI] Retry ${attempt}/3 after ${delay}ms:`,
        message
      );

      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );
    }
  }

  throw lastError || new Error("Gemini embedding request failed.");
};

/* --------------------------------------------------------------
   Generate document embeddings

   Used during Knowledge Base ingestion and re-indexing.
-------------------------------------------------------------- */

export const generateDocumentEmbeddings = async (texts = []) => {
  const validTexts = validateTexts(texts);

  if (!validTexts.length) return [];

  const batchSize = kbConfig.embedding.batchSize;

  const embeddings = [];

  for (let i = 0; i < validTexts.length; i += batchSize) {
    const batch = validTexts.slice(i, i + batchSize);

    const batchEmbeddings = await requestEmbeddings(
      batch,
      "RETRIEVAL_DOCUMENT"
    );

    embeddings.push(...batchEmbeddings);
  }

  if (embeddings.length !== validTexts.length) {
    throw new Error(
      "Document embedding count does not match input count."
    );
  }

  return embeddings;
};

/* --------------------------------------------------------------
   Generate query embedding

   Used when Claude calls search_knowledge_base.
-------------------------------------------------------------- */

export const generateQueryEmbedding = async (query) => {
  const text = String(query || "").trim();

  if (!text) {
    throw new Error("Search query is required.");
  }

  const embeddings = await requestEmbeddings(
    [text],
    "RETRIEVAL_QUERY"
  );

  return embeddings[0];
};

export default {
  generateDocumentEmbeddings,
  generateQueryEmbedding,
};
