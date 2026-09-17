import fs from 'node:fs/promises';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const sourcePath = 'C:/Users/Owner/.codex/attachments/2f430194-7ee6-46eb-9232-59a2134f77f0/pasted-text.txt';
const outputDir = 'outputs/01a0a1d7-8117-7313-9f91-5df2677e5708';
const outputPath = `${outputDir}/formatted-multi-country-youtube-channels.xlsx`;
const previewPath = 'tmp/four-column-youtube-list/preview.png';

const markdown = await fs.readFile(sourcePath, 'utf8');
const rowPattern = /^\|\s*(\d+)\s*\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|\s*([\d,]+)\s*\|\s*(.*?)\s*\|\s*\[Evidence\]\(([^)]+)\)\s*\|$/;
const records = markdown
  .split(/\r?\n/)
  .map((line) => line.match(rowPattern))
  .filter(Boolean)
  .map((match) => ({
    channel: match[2],
    channelUrl: match[3],
    subscribers: Number(match[4].replaceAll(',', '')),
    coverage: match[5],
    evidenceUrl: match[6],
  }));

if (records.length !== 25) {
  throw new Error(`Expected 25 channel records, found ${records.length}`);
}

const workbook = Workbook.create();
const sheet = workbook.worksheets.add('YouTube channels');
sheet.showGridLines = false;
sheet.tabColor = '#1F4E78';

sheet.getRange('A2').values = [['Multi-country YouTube channels']];
sheet.getRange('A2').format.font = { name: 'Arial', size: 16, bold: true, color: '#1F2937' };
sheet.getRange('A3').values = [['25 channels arranged into four columns']];
sheet.getRange('A3').format.font = { name: 'Arial', size: 10, italic: true, color: '#5B6573' };
sheet.getRange('A3:D3').format.borders = { bottom: { style: 'thin', color: '#9FB3C8' } };

const headers = [['Channel and YouTube URL', 'Subscribers', 'Countries covered', 'Evidence source']];
sheet.getRange('A5:D5').values = headers;

const data = records.map((record) => [
  `${record.channel}\n${record.channelUrl}`,
  record.subscribers,
  record.coverage,
  record.evidenceUrl,
]);
sheet.getRange('A6:D30').values = data;

const table = sheet.tables.add('A5:D30', true, 'YouTubeChannelsTable');
table.style = 'TableStyleMedium2';
table.showFilterButton = true;

sheet.getRange('A5:D5').format = {
  fill: '#245A86',
  font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' },
  horizontalAlignment: 'center',
  verticalAlignment: 'center',
  wrapText: true,
  borders: {
    insideVertical: { style: 'thin', color: '#FFFFFF' },
    bottom: { style: 'medium', color: '#163A5C' },
  },
};
sheet.getRange('A5:D5').format.rowHeight = 30;

sheet.getRange('A6:D30').format = {
  font: { name: 'Arial', size: 10, color: '#1F2937' },
  verticalAlignment: 'center',
  wrapText: true,
  borders: { bottom: { style: 'thin', color: '#D9E2EC' } },
};
sheet.getRange('B6:B30').format.numberFormat = '#,##0';
sheet.getRange('B6:B30').format.horizontalAlignment = 'right';
sheet.getRange('D6:D30').format.font = { name: 'Arial', size: 10, color: '#0563C1', underline: true };

sheet.getRange('A:A').format.columnWidth = 46;
sheet.getRange('B:B').format.columnWidth = 14;
sheet.getRange('C:C').format.columnWidth = 72;
sheet.getRange('D:D').format.columnWidth = 54;
sheet.getRange('A6:D30').format.rowHeight = 45;
sheet.freezePanes.freezeRows(5);

sheet.getRange('A32').values = [['Note']];
sheet.getRange('A32').format.font = { name: 'Arial', size: 10, bold: true, color: '#1F4E78' };
sheet.getRange('A33').values = [['Subscriber counts and coverage descriptions are preserved from the supplied list.']];
sheet.getRange('A33:D33').format.font = { name: 'Arial', size: 10, italic: true, color: '#5B6573' };

workbook.recalculate();

const inspect = await workbook.inspect({
  kind: 'table',
  range: 'YouTube channels!A2:D33',
  include: 'values,formulas',
  tableMaxRows: 35,
  tableMaxCols: 6,
  maxChars: 16000,
});
console.log(inspect.ndjson);

const errors = await workbook.inspect({
  kind: 'match',
  searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',
  options: { useRegex: true, maxResults: 100 },
  summary: 'final formula error scan',
});
console.log(errors.ndjson);

const preview = await workbook.render({
  sheetName: 'YouTube channels',
  range: 'A1:D33',
  scale: 1,
  format: 'png',
});
await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));

await fs.mkdir(outputDir, { recursive: true });
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);

console.log(JSON.stringify({ outputPath, previewPath, rows: records.length, columns: 4 }));
