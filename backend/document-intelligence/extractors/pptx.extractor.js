import JSZip from 'jszip';
import { NS, parseXml, descendants, directChildren, firstDirect, textContent } from '../utils/xml.js';

const EMU_PER_INCH = 914400;
const attrNumber = (node, name) => {
  const n = Number(node?.getAttribute(name));
  return Number.isFinite(n) ? n : null;
};
const inch = (n) => n == null ? null : Number((n / EMU_PER_INCH).toFixed(3));

function shapeText(shape) {
  const body = firstDirect(shape, NS.p, 'txBody');
  if (!body) return '';
  const paragraphs = directChildren(body, NS.a, 'p').map((paragraph) => {
    let value = '';
    const walk = (node) => {
      for (const child of Array.from(node?.childNodes || [])) {
        if (child.nodeType !== 1) continue;
        if (child.namespaceURI === NS.a && child.localName === 't') value += child.textContent || '';
        else if (child.namespaceURI === NS.a && child.localName === 'br') value += ' ';
        else walk(child);
      }
    };
    walk(paragraph);
    return value.replace(/\s+/g, ' ').trim();
  }).filter(Boolean);
  return paragraphs.join(' ').trim();
}

function getShapeRecord(shape, slideNumber) {
  const nv = firstDirect(shape, NS.p, 'nvSpPr');
  const cNvPr = nv ? firstDirect(nv, NS.p, 'cNvPr') : null;
  const spPr = firstDirect(shape, NS.p, 'spPr');
  const xfrm = spPr ? firstDirect(spPr, NS.a, 'xfrm') : null;
  const off = xfrm ? firstDirect(xfrm, NS.a, 'off') : null;
  const ext = xfrm ? firstDirect(xfrm, NS.a, 'ext') : null;
  const text = shapeText(shape);
  if (!text) return null;
  const x = inch(attrNumber(off, 'x'));
  const y = inch(attrNumber(off, 'y'));
  const width = inch(attrNumber(ext, 'cx'));
  const height = inch(attrNumber(ext, 'cy'));
  return {
    text,
    slideNumber,
    shapeId: cNvPr?.getAttribute('id') || null,
    shapeName: cNvPr?.getAttribute('name') || null,
    geometry: { x, y, width, height, centerY: y == null || height == null ? null : Number((y + height / 2).toFixed(3)) },
  };
}

function groupIntoVisualRows(records) {
  const positioned = records.filter((r) => r.geometry.centerY != null && r.geometry.x != null);
  const unpositioned = records.filter((r) => !positioned.includes(r));
  positioned.sort((a, b) => a.geometry.centerY - b.geometry.centerY || a.geometry.x - b.geometry.x);
  const rows = [];
  for (const item of positioned) {
    // A small tolerance groups objects sharing a visual baseline; it does not merge text boxes.
    let row = rows.find((r) => Math.abs(r.centerY - item.geometry.centerY) <= 0.12);
    if (!row) {
      row = { centerY: item.geometry.centerY, cells: [] };
      rows.push(row);
    }
    row.cells.push(item);
    row.centerY = row.cells.reduce((sum, cell) => sum + cell.geometry.centerY, 0) / row.cells.length;
  }
  rows.sort((a, b) => a.centerY - b.centerY);
  return [
    ...rows.map((row) => row.cells.sort((a, b) => a.geometry.x - b.geometry.x)
      .map((cell) => cell.text).join(' | ')),
    ...unpositioned.map((r) => r.text),
  ];
}

async function getSlideFiles(zip) {
  const names = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name));
  return names.sort((a, b) => Number(a.match(/slide(\d+)/)[1]) - Number(b.match(/slide(\d+)/)[1]));
}

export async function extractPptx(buffer, { maxCharacters }) {
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = await getSlideFiles(zip);
  if (!slideFiles.length) throw new Error('PPTX contains no readable slides');
  const sections = [];
  let totalCharacters = 0;

  for (const fileName of slideFiles) {
    const slideNumber = Number(fileName.match(/slide(\d+)/)[1]);
    const xml = await zip.file(fileName).async('string');
    const doc = parseXml(xml, `PPTX slide ${slideNumber}`);
    const shapes = descendants(doc, NS.p, 'sp');
    const records = shapes.map((shape) => getShapeRecord(shape, slideNumber)).filter(Boolean);

    // Preserve table cells as native rows when a slide contains a DrawingML table.
    const tableRows = [];
    for (const table of descendants(doc, NS.a, 'tbl')) {
      for (const tr of descendants(table, NS.a, 'tr')) {
        const cells = directChildren(tr, NS.a, 'tc').map((tc) => {
          const paragraphs = descendants(tc, NS.a, 'p').map(textContent).filter(Boolean);
          return paragraphs.join(' ').trim();
        });
        if (cells.some(Boolean)) tableRows.push(cells.join(' | '));
      }
    }

    const lines = groupIntoVisualRows(records);
    const body = [...lines, ...tableRows].filter(Boolean).join('\n');
    if (body) {
      const content = `SLIDE ${slideNumber}\n${body}`;
      totalCharacters += content.length;
      sections.push({ content, metadata: { page: slideNumber, slideNumber, sectionType: 'slide' } });
    }
  }

  // Resolve notes through each slide relationship; notesSlideN is NOT guaranteed to
  // correspond to slideN (the uploaded deck itself has non-matching relationship IDs).
  for (const slideFile of slideFiles) {
    const slideNumber = Number(slideFile.match(/slide(\d+)/)[1]);
    const relsPath = slideFile.replace('slides/', 'slides/_rels/') + '.rels';
    const relsFile = zip.file(relsPath);
    if (!relsFile) continue;
    const relsXml = await relsFile.async('string');
    const match = relsXml.match(/<Relationship\b(?=[^>]*Type="[^"]*\/notesSlide")(?=[^>]*Target="([^"]+)")[^>]*\/?\s*>/i);
    if (!match) continue;
    const target = match[1].replace(/^\.\.\//, '');
    const notesPath = `ppt/${target}`;
    const notesFile = zip.file(notesPath);
    if (!notesFile) continue;
    const notesDoc = parseXml(await notesFile.async('string'), `PPTX notes for slide ${slideNumber}`);
    const noteShape = descendants(notesDoc, NS.p, 'sp').find((shape) => {
      const nv = firstDirect(shape, NS.p, 'nvSpPr');
      const ph = nv ? descendants(nv, NS.p, 'ph')[0] : null;
      return ph?.getAttribute('type') === 'body';
    });
    const note = noteShape ? shapeText(noteShape) : '';
    if (note) {
      const section = sections.find((s) => s.metadata.slideNumber === slideNumber);
      if (section) section.content += `\nSpeaker Notes: ${note}`;
    }
  }

  const text = sections.map((s) => s.content).join('\n\n').trim();
  if (!text) throw new Error('PPTX contains no extractable text. It may be image-only and require OCR.');
  if (text.length > maxCharacters) throw new Error(`Extracted PPTX exceeds ${maxCharacters} characters`);
  return { text, sections, method: 'pptx-xml-layout', characters: text.length, pages: slideFiles.length, needsOcr: false };
}
