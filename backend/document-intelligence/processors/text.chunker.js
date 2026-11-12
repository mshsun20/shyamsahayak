
import kbConfig from "../../config/kbAI.config.js";

const estimateCharacters = (tokens) => tokens * 4;

export const createTextChunks = (text, metadata = {}) => {
    if (!text || typeof text !== "string") return [];

    const normalized = text
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    if (!normalized) return [];

    const maxCharacters = estimateCharacters(kbConfig.chunking.chunkSize);
    const overlapCharacters = estimateCharacters(kbConfig.chunking.overlap);

    const paragraphs = normalized
        .split(/\n\s*\n/)
        .map((item) => item.trim())
        .filter(Boolean);

    const chunks = [];
    let current = "";

    const pushChunk = () => {
        if (!current.trim()) return;

        chunks.push({
            content: current.trim(),
            metadata: {
                ...metadata,
                chunkIndex: chunks.length,
            },
        });
    };

    for (const paragraph of paragraphs) {
        if (paragraph.length > maxCharacters) {
            if (current) {
                pushChunk();
                current = "";
            }

            let start = 0;

            while (start < paragraph.length) {
                const end = Math.min(
                    start + maxCharacters,
                    paragraph.length
                );

                chunks.push({
                    content: paragraph.slice(start, end).trim(),
                    metadata: {
                        ...metadata,
                        chunkIndex: chunks.length,
                    },
                });

                if (end >= paragraph.length) break;

                start = Math.max(end - overlapCharacters, start + 1);
            }

            continue;
        }

        const combined = current ? `${current}\n\n${paragraph}` : paragraph;
        if (combined.length > maxCharacters && current) {
            pushChunk();
            const previous = current.slice(-overlapCharacters);
            current = `${previous}\n\n${paragraph}`;
        } else {
            current = combined;
        }
    }

    pushChunk();

    return chunks.filter((chunk) => chunk.content.trim().length >= 0);
};
