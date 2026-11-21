import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

function pageLines(items) {
  const positioned = items.filter((item) => item.str && item.str.trim()).map((item) => ({
    text: item.str.trim(),
    x: Number(item.transform?.[4] || 0),
    y: Number(item.transform?.[5] || 0),
    width: Number(item.width || 0),
  }));
  positioned.sort((a, b) => b.y - a.y || a.x - b.x);
  const lines = [];
  for (const item of positioned) {
    let line = lines.find((candidate) => Math.abs(candidate.y - item.y) <= 2.5);
    if (!line) { line = { y: item.y, items: [] }; lines.push(line); }
    line.items.push(item);
    line.y = line.items.reduce((sum, part) => sum + part.y, 0) / line.items.length;
  }
  return lines.sort((a, b) => b.y - a.y).map((line) =>
    line.items.sort((a, b) => a.x - b.x).map((item) => item.text).join(' | '));
}

export async function extractPdf(buffer, { maxCharacters, maxPdfPages }) {
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer), useSystemFonts: true });
  const pdf = await loadingTask.promise;
  if (pdf.numPages > maxPdfPages) throw new Error(`PDF has ${pdf.numPages} pages; configured maximum is ${maxPdfPages}`);
  const sections = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const lines = pageLines(content.items || []);
    const pageText = lines.join('\n').trim();
    if (pageText) sections.push({ content: `PAGE ${pageNumber}\n${pageText}`, metadata: { sectionType: 'page', page: pageNumber } });
  }
  const text = sections.map((s) => s.content).join('\n\n').trim();
  if (!text) {
    return { text: '', sections: [], method: 'pdfjs-positioned-text', characters: 0, pages: pdf.numPages, needsOcr: true, warning: 'No embedded text found. This PDF is likely scanned/image-only and requires OCR.' };
  }
  if (text.length > maxCharacters) throw new Error(`Extracted PDF exceeds ${maxCharacters} characters`);
  return { text, sections, method: 'pdfjs-positioned-text', characters: text.length, pages: pdf.numPages, needsOcr: false };
}
