export async function extractPlainText(buffer, extension, { maxCharacters }) {
  let text = buffer.toString('utf8').replace(/^\uFEFF/, '').replace(/\u0000/g, '');
  if (extension === '.csv') {
    // Keep records and delimiters intact; do not flatten CSV into a single sentence.
    text = text.split(/\r?\n/).map((line, i) => `ROW ${i + 1}: ${line}`).join('\n');
  }
  if (extension === '.html' || extension === '.htm') {
    text = text.replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<\/(p|div|tr|h[1-6]|li|br|td|th)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  }
  text = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  if (!text) throw new Error('File contains no readable text');
  if (text.length > maxCharacters) throw new Error(`Extracted text exceeds ${maxCharacters} characters`);
  const sections = text.split(/\n\s*\n/).map((content) => content.trim()).filter(Boolean)
    .map((content, index) => ({ content, metadata: { sectionType: 'text-block', blockIndex: index } }));
  return { text, sections, method: `utf8:${extension.slice(1)}`, characters: text.length, needsOcr: false };
}
