import "../config/env.js";
import kbConfig from "../config/kbAI.config.js";

import {
    generateDocumentEmbeddings,
    generateQueryEmbedding,
} from "../services/knowledgeBaseAI/embedding.service.js";

try {
    console.log("Testing Gemini document embedding...");

    const documents = [
        "AZ 70 roofing sheet has a salt spray test rating.",
        "AZ 150 roofing sheet has a higher corrosion resistance rating.",
    ];

    const documentVectors =
        await generateDocumentEmbeddings(documents);

    console.log(
        "Document vector count:",
        documentVectors.length
    );

    console.log(
        "Document vector dimensions:",
        documentVectors[0]?.length
    );

    console.log("Testing Gemini query embedding...");

    const queryVector = await generateQueryEmbedding(
        "What is the AZ 70 salt spray test rating?"
    );

    console.log(
        "Query vector dimensions:",
        queryVector.length
    );

    console.log(
        "Configured dimensions:",
        kbConfig.embedding.dimensions
    );

    if (
        queryVector.length !==
        kbConfig.embedding.dimensions
    ) {
        throw new Error("Query vector dimension mismatch.");
    }

    if (
        documentVectors[0].length !== queryVector.length
    ) {
        throw new Error(
            "Document and query embedding dimensions do not match."
        );
    }

    console.log("GEMINI EMBEDDING TEST PASSED.");
} catch (error) {
    console.error("GEMINI EMBEDDING TEST FAILED:");
    console.error(error);

    process.exitCode = 1;
}
