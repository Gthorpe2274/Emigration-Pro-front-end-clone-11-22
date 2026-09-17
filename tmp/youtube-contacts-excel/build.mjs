import fs from 'node:fs/promises';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const outputDir = 'outputs/01a0a1d7-8117-7313-9f91-5df2677e5708';
const outputPath = `${outputDir}/youtube-channel-contacts.xlsx`;
const previewPath = 'tmp/youtube-contacts-excel/preview.png';
const checkedDate = new Date('2026-09-14T12:00:00Z');

const contacts = [
  {
    channel: 'The 50 50 Lifestyle Travel Couple',
    subscribers: 1060,
    countries: 'Mexico, Costa Rica, and other global destinations',
    email: 'the5050travels@gmail.com',
    website: 'https://www.tiktok.com/@5050travels',
    youtube: 'https://youtube.com/@5050travels',
    source: 'https://tikbuddy.com/tiktok/5050travels'
  },
  {
    channel: 'The Achilov Twins Travel Show',
    subscribers: 1100,
    countries: 'Recent coverage across 11 countries',
    email: 'theachilovs@gmail.com',
    website: 'https://linktr.ee/achilovs',
    youtube: 'https://youtube.com/@theachilovtwinstravelshow',
    source: 'https://www.youtube.com/@theachilovtwinstravelshow/about'
  },
  {
    channel: 'Revolving Compass',
    subscribers: 1260,
    countries: 'Malaysia, Sri Lanka, and other destinations',
    email: 'revolvingcompass.blog@gmail.com',
    website: 'https://revolvingcompass.com/',
    youtube: 'https://youtube.com/@revolvingcompassvlog',
    source: 'https://revolvingcompass.com/about-me/contact-us/'
  },
  {
    channel: 'Swati & Sam',
    subscribers: 1280,
    countries: 'Germany, Switzerland, Austria, and other destinations',
    email: 'thetalesofatraveler@gmail.com',
    website: 'https://thetalesofatraveler.com/',
    youtube: 'https://youtube.com/@swati_n_sam',
    source: 'https://thetalesofatraveler.com/citizenm-la-defense-paris-review/'
  },
  {
    channel: 'The Jetsetting Family',
    subscribers: 1470,
    countries: 'Recent coverage across 10 countries',
    email: 'hello@thejetsettingfamily.com',
    website: 'https://www.thejetsettingfamily.com/',
    youtube: 'https://youtube.com/@thejetsettingfamily',
    source: 'https://www.thejetsettingfamily.com/work-with-us/'
  },
  {
    channel: 'Alex & Tina — TheDailyPackers',
    subscribers: 1560,
    countries: 'France, Austria, and broader international coverage',
    email: 'hello@thedailypackers.com',
    website: 'https://thedailypackers.com/',
    youtube: 'https://youtube.com/@thedailypackers',
    source: 'https://thedailypackers.com/work-with-us/'
  }
];

const workbook = Workbook.create();
const sheet = workbook.worksheets.add('Channel contacts');
sheet.showGridLines = false;
sheet.tabColor = '#1F4E78';

sheet.getRange('A2').values = [['Multi-country YouTube channel contacts']];
sheet.getRange('A2:H2').format.font = { name: 'Arial', size: 15, bold: true, color: '#1F2937' };
sheet.getRange('A3').values = [['Publicly posted contact details checked September 14, 2026']];
sheet.getRange('A3:H3').format.font = { name: 'Arial', size: 10, italic: true, color: '#5B6573' };
sheet.getRange('A4:H4').format.borders = { bottom: { style: 'medium', color: '#1F4E78' } };

const headers = [['Channel', 'Subscribers', 'Countries covered', 'Public email', 'Associated website/profile', 'YouTube channel', 'Contact source', 'Checked date']];
sheet.getRange('A5:H5').values = headers;
sheet.getRange('A5:H5').format = {
  fill: '#1F4E78',
  font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' },
  horizontalAlignment: 'center',
  verticalAlignment: 'center',
  wrapText: true,
  borders: {
    insideVertical: { style: 'thin', color: '#FFFFFF' },
    bottom: { style: 'medium', color: '#163A5C' }
  }
};
sheet.getRange('A5:H5').format.rowHeight = 30;

const values = contacts.map((contact) => [
  contact.channel,
  contact.subscribers,
  contact.countries,
  null,
  null,
  null,
  null,
  checkedDate
]);
sheet.getRange('A6:H11').values = values;
sheet.getRange('D6:D11').values = contacts.map((contact) => [contact.email]);
sheet.getRange('E6:E11').values = contacts.map((contact) => [contact.website]);
sheet.getRange('F6:F11').values = contacts.map((contact) => [contact.youtube]);
sheet.getRange('G6:G11').values = contacts.map((contact) => [contact.source]);

sheet.getRange('A6:H11').format = {
  font: { name: 'Arial', size: 10, color: '#1F2937' },
  verticalAlignment: 'center',
  borders: { bottom: { style: 'thin', color: '#D9E2EC' } }
};
sheet.getRange('C6:C11').format.wrapText = true;
sheet.getRange('G6:G11').format.wrapText = true;
sheet.getRange('D6:G11').format.font = { name: 'Arial', size: 10, color: '#0563C1', underline: true };
sheet.getRange('B6:B11').format.numberFormat = '#,##0';
sheet.getRange('B6:B11').format.horizontalAlignment = 'right';
sheet.getRange('H6:H11').format.numberFormat = 'mm/dd/yyyy';
sheet.getRange('H6:H11').format.horizontalAlignment = 'center';

for (const row of [7, 9, 11]) {
  sheet.getRange(`A${row}:H${row}`).format.fill = '#F4F7FA';
}

sheet.getRange('A13').values = [['Notes']];
sheet.getRange('A13').format.font = { name: 'Arial', size: 10, bold: true, color: '#1F4E78' };
sheet.getRange('A14').values = [['Emails are included only when publicly posted by the creator. Verify contact details before outreach because they may change.']];
sheet.getRange('A14:H14').format.font = { name: 'Arial', size: 10, italic: true, color: '#5B6573' };

sheet.getRange('A:A').format.columnWidth = 34;
sheet.getRange('B:B').format.columnWidth = 13;
sheet.getRange('C:C').format.columnWidth = 43;
sheet.getRange('D:D').format.columnWidth = 32;
sheet.getRange('E:E').format.columnWidth = 38;
sheet.getRange('F:F').format.columnWidth = 40;
sheet.getRange('G:G').format.columnWidth = 38;
sheet.getRange('H:H').format.columnWidth = 15;
sheet.getRange('A6:H11').format.rowHeight = 42;
sheet.freezePanes.freezeRows(5);

workbook.recalculate();

const inspect = await workbook.inspect({
  kind: 'table',
  range: 'Channel contacts!A2:H14',
  include: 'values,formulas',
  tableMaxRows: 20,
  tableMaxCols: 10,
  maxChars: 9000
});
console.log(inspect.ndjson);

const errors = await workbook.inspect({
  kind: 'match',
  searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',
  options: { useRegex: true, maxResults: 100 },
  summary: 'final formula error scan'
});
console.log(errors.ndjson);

const preview = await workbook.render({
  sheetName: 'Channel contacts',
  range: 'A1:H14',
  scale: 1,
  format: 'png'
});
await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));

await fs.mkdir(outputDir, { recursive: true });
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(JSON.stringify({ outputPath, previewPath, rows: contacts.length }));
