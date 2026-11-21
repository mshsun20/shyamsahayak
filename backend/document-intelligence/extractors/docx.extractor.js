import JSZip from 'jszip';
import { NS, parseXml, directChildren, firstDirect, descendants, textContent } from '../utils/xml.js';

function paragraphText(p) {
  let out = '';
  const walk = (node) => {
    for (const child of Array.from(node?.childNodes || [])) {
      if (child.nodeType !== 1) continue;
      if (child.namespaceURI === NS.w && child.localName === 't') out += child.textContent || '';
      else if (child.namespaceURI === NS.w && ['tab', 'br', 'cr'].includes(child.localName)) out += ' ';
      else walk(child);
    }
  };
  walk(p);
  return out.replace(/\s+/g, ' ').trim();
}

function tableRows(table) {
  return directChildren(table, NS.w, 'tr').map((tr) => {
    const cells = directChildren(tr, NS.w, 'tc').map((tc) =>
      directChildren(tc, NS.w, 'p').map(paragraphText).filter(Boolean).join(' '));
    return cells.some(Boolean) ? cells.join(' | ') : '';
  }).filter(Boolean);
}

export async function extractDocx(buffer, { maxCharacters }) {
  const zip = await JSZip.loadAsync(buffer);
  const documentFile = zip.file('word/document.xml');
  if (!documentFile) throw new Error('DOCX is missing word/document.xml');
  const doc = parseXml(await documentFile.async('string'), 'DOCX document');
  const body = descendants(doc, NS.w, 'body')[0];
  if (!body) throw new Error('DOCX document body is missing');
  const sections = [];
  for (const child of Array.from(body.childNodes || [])) {
    if (child.nodeType !== 1 || child.namespaceURI !== NS.w) continue;
    if (child.localName === 'p') {
      const value = paragraphText(child);
      if (value) sections.push({ content: value, metadata: { sectionType: 'paragraph' } });
    } else if (child.localName === 'tbl') {
      const rows = tableRows(child);
      if (rows.length) sections.push({ content: `TABLE\n${rows.join('\n')}`, metadata: { sectionType: 'table' } });
    }
  }
  const text = sections.map((s) => s.content).join('\n\n').trim();
  if (!text) throw new Error('DOCX contains no extractable text');
  if (text.length > maxCharacters) throw new Error(`Extracted DOCX exceeds ${maxCharacters} characters`);
  return { text, sections, method: 'docx-xml-structured', characters: text.length, needsOcr: false };
}
