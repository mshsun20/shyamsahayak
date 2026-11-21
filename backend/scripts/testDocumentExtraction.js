import '../config/env.js';
import path from 'node:path';
import { extractOfficeFile } from '../document-intelligence/processors/office.extractor.js';
import { createTextChunks } from '../document-intelligence/processors/text.chunker.js';

const input = process.argv[2];
if (!input) {
    console.error('Usage: node scripts/testDocumentExtraction.js "uploads/your-file.pptx"');
    process.exit(1);
}
const filePath = path.resolve(process.cwd(), input);
const originalName = path.basename(input);

try {
    const extracted = await extractOfficeFile({ filePath, originalName });
    console.log('\n========== EXTRACTION SUMMARY ==========');
    console.log({ method: extracted.method, extension: extracted.extension, characters: extracted.characters, pages: extracted.pages, worksheets: extracted.worksheets, needsOcr: extracted.needsOcr, warning: extracted.warning });
    console.log('\n========== SLIDE / PAGE / SHEET SECTIONS ==========');
    for (const section of extracted.sections || []) {
        console.log(`\n--- ${JSON.stringify(section.metadata)} ---\n${section.content}`);
    }
    const chunks = createTextChunks(extracted, { sourceName: originalName });
    console.log('\n========== CHUNK SUMMARY ==========');
    console.log({ count: chunks.length, emptyChunks: chunks.filter((x) => !x.content.trim()).length, maxLength: Math.max(0, ...chunks.map((x) => x.content.length)) });
    for (const chunk of chunks) {
        console.log(`\n--- CHUNK ${chunk.metadata.chunkIndex} ${JSON.stringify(chunk.metadata)} ---\n${chunk.content}`);
    }
    if (extracted.needsOcr) process.exitCode = 2;
} catch (error) {
    console.error('[DOCUMENT EXTRACTION FAILED]', error?.stack || error);
    process.exitCode = 1;
}
