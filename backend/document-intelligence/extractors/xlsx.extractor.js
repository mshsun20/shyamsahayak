import ExcelJS from 'exceljs';

function valueToText(value) {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    if ('text' in value && value.text != null) return String(value.text);
    if ('result' in value && value.result != null) return String(value.result);
    if (Array.isArray(value.richText)) return value.richText.map((x) => x.text || '').join('');
    if ('hyperlink' in value) return String(value.text || value.hyperlink);
    return JSON.stringify(value);
  }
  return String(value);
}

export async function extractXlsx(buffer, { maxCharacters }) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sections = [];
  let total = 0;
  workbook.eachSheet((sheet) => {
    const rows = [];
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      const cells = [];
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const value = valueToText(cell.value).replace(/\s+/g, ' ').trim();
        if (value) cells.push(`${cell.address || `C${colNumber}`}: ${value}`);
      });
      if (cells.length) rows.push(`Row ${rowNumber}: ${cells.join(' | ')}`);
    });
    if (rows.length) {
      const content = `WORKSHEET: ${sheet.name}\n${rows.join('\n')}`;
      total += content.length;
      sections.push({ content, metadata: { sectionType: 'worksheet', sheetName: sheet.name } });
    }
  });
  const text = sections.map((s) => s.content).join('\n\n').trim();
  if (!text) throw new Error('XLSX contains no extractable cell values');
  if (total > maxCharacters) throw new Error(`Extracted XLSX exceeds ${maxCharacters} characters`);
  return { text, sections, method: 'exceljs-cell-structured', characters: text.length, worksheets: sections.length, needsOcr: false };
}
