import kbConfig from '../../config/kbAI.config.js';

const toCharacters = (tokens) => Math.max(256, Math.floor(Number(tokens) * 4));
const clean = (value) => String(value || '').replace(/\u0000/g, '').replace(/\r\n/g, '\n').trim();

function splitOversizedUnit(text, maxCharacters, overlapCharacters) {
    const output = [];
    const lines = text.split('\n');
    let current = '';
    for (const line of lines) {
        const candidate = current ? `${current}\n${line}` : line;
        if (candidate.length <= maxCharacters) { current = candidate; continue; }
        if (current) output.push(current);
        if (line.length <= maxCharacters) { current = line; continue; }
        let start = 0;
        while (start < line.length) {
            let end = Math.min(start + maxCharacters, line.length);
            if (end < line.length) {
                const boundary = line.lastIndexOf(' ', end);
                if (boundary > start + maxCharacters * 0.6) end = boundary;
            }
            output.push(line.slice(start, end).trim());
            if (end >= line.length) break;
            start = Math.max(start + 1, end - overlapCharacters);
        }
        current = '';
    }
    if (current) output.push(current);
    return output.filter(Boolean);
}

const sectionKey = (metadata = {}) => {
    if (metadata.slideNumber != null) return `slide:${metadata.slideNumber}`;
    if (metadata.page != null) return `page:${metadata.page}`;
    if (metadata.sheetName) return `sheet:${metadata.sheetName}`;
    return metadata.sectionType || 'text';
};

// Accepts plain text or the structured { text, sections } returned by extractOfficeFile().
export const createTextChunks = (input, baseMetadata = {}) => {
    const maxCharacters = toCharacters(kbConfig.chunking.chunkSize);
    const overlapCharacters = Math.min(Math.floor(Number(kbConfig.chunking.overlap) * 4), Math.floor(maxCharacters / 4));
    const sourceSections = typeof input === 'string'
        ? input.split(/\n\s*\n/).map((content) => ({ content, metadata: {} }))
        : Array.isArray(input?.sections) && input.sections.length
            ? input.sections
            : [{ content: input?.text || '', metadata: {} }];

    const chunks = [];
    let current = '';
    let currentMetadata = {};
    let currentKey = null;
    const flush = () => {
        if (!current.trim()) return;
        chunks.push({ content: current.trim(), metadata: { ...baseMetadata, ...currentMetadata, chunkIndex: chunks.length } });
        current = ''; currentMetadata = {}; currentKey = null;
    };

    for (const raw of sourceSections) {
        const unit = { content: clean(raw.content), metadata: { ...(raw.metadata || {}) } };
        if (!unit.content) continue;
        const key = sectionKey(unit.metadata);
        const isAtomic = ['table', 'slide', 'page', 'worksheet'].includes(unit.metadata.sectionType);

        if (isAtomic || (current && currentKey !== key)) flush();
        if (unit.content.length > maxCharacters) {
            flush();
            for (const part of splitOversizedUnit(unit.content, maxCharacters, overlapCharacters)) {
                chunks.push({ content: part, metadata: { ...baseMetadata, ...unit.metadata, chunkIndex: chunks.length, continuedSection: true } });
            }
            continue;
        }

        const candidate = current ? `${current}\n\n${unit.content}` : unit.content;
        if (candidate.length > maxCharacters && current) flush();
        current = current ? `${current}\n\n${unit.content}` : unit.content;
        currentMetadata = { ...currentMetadata, ...unit.metadata };
        currentKey = key;
        if (isAtomic) flush();
    }
    flush();
    return chunks.filter((chunk) => chunk.content.trim().length > 0);
};
