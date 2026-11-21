import fs from 'node:fs/promises';
import path from 'node:path';
import kbConfig from '../../config/kbAI.config.js';
import { extractPptx } from '../extractors/pptx.extractor.js';
import { extractDocx } from '../extractors/docx.extractor.js';
import { extractXlsx } from '../extractors/xlsx.extractor.js';
import { extractPdf } from '../extractors/pdf.extractor.js';
import { extractPlainText } from '../extractors/plaintext.extractor.js';

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');
const EXTRACTORS = {
  '.pptx': extractPptx, '.docx': extractDocx, '.xlsx': extractXlsx, '.pdf': extractPdf,
  '.txt': extractPlainText, '.md': extractPlainText, '.csv': extractPlainText,
  '.html': extractPlainText, '.htm': extractPlainText,
};
export const SUPPORTED_KB_EXTENSIONS = Object.keys(EXTRACTORS);

export const extractOfficeFile = async ({ filePath, originalName }) => {
  if (!filePath) throw new Error('File path is required');
  const resolved = await fs.realpath(path.resolve(filePath));
  const root = await fs.realpath(UPLOAD_ROOT);
  if (!resolved.startsWith(`${root}${path.sep}`)) throw new Error('Refusing to read a file outside the uploads directory');
  const extension = path.extname(originalName || resolved).toLowerCase();
  const extractor = EXTRACTORS[extension];
  if (!extractor) throw new Error(`Unsupported file type ${extension || '(unknown)'}. Supported: ${SUPPORTED_KB_EXTENSIONS.join(', ')}`);
  const stat = await fs.stat(resolved);
  const maxBytes = kbConfig.files.maxSizeMB * 1024 * 1024;
  if (!stat.isFile() || stat.size <= 0) throw new Error('Uploaded document is empty or not a regular file');
  if (stat.size > maxBytes) throw new Error(`File exceeds configured ${kbConfig.files.maxSizeMB} MB limit`);
  const buffer = await fs.readFile(resolved);
  const result = await extractor(buffer, { maxCharacters: kbConfig.files.maxCharacters, maxPdfPages: kbConfig.files.maxPdfPages });
  if (!result.text && !result.needsOcr) throw new Error('No readable text was extracted');
  return { ...result, originalName: originalName || path.basename(resolved), extension };
};
