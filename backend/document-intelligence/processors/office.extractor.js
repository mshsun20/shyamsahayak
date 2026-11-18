import fs from "fs/promises";
import path from "path";
import { OfficeParser } from "officeparser";
import kbConfig from "../../config/kbAI.config.js";

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");
const SUPPORTED = new Set([".pptx", ".docx", ".pdf", ".xlsx"]);

export const extractOfficeFile = async ({ filePath, originalName }) => {
  const resolved = path.resolve(filePath || "");
  if (!resolved.startsWith(`${UPLOAD_ROOT}${path.sep}`) && resolved !== UPLOAD_ROOT) {
    throw new Error("Refusing to read a file outside the uploads directory");
  }
  const ext = path.extname(originalName || resolved).toLowerCase();
  if (!SUPPORTED.has(ext)) throw new Error(`Unsupported Knowledge Base file type: ${ext || "unknown"}`);
  const buffer = await fs.readFile(resolved);
  if (!buffer.length) throw new Error("Uploaded document is empty");
  const ast = await OfficeParser.parseOffice(buffer);
  const { value } = await ast.to("text", {
    includeImages: false,
    textConfig: { preserveLayout: true, renderNotes: true },
  });
  const text = String(value || "").replace(/\u0000/g, "").trim();
  if (!text) throw new Error("No readable text was extracted from the document");
  if (text.length > kbConfig.files.maxCharacters) {
    throw new Error(`Extracted document exceeds ${kbConfig.files.maxCharacters} characters`);
  }
  return { text, method: `officeparser:${ext.slice(1)}`, characters: text.length };
};
