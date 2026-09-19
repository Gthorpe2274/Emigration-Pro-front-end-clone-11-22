import assert from 'node:assert/strict';
import test from 'node:test';

import { buildStandaloneReportHtml } from '../src/react-app/report-gen/utils/htmlDownloader.ts';

test('standalone report preserves its cover as the first report page', () => {
  const reportContent = '<h1>Relocation Analysis Report</h1>';

  const html = buildStandaloneReportHtml(
    reportContent,
    'Emigration_Pro_Report_Test.html',
    'data:image/jpeg;base64,cover',
  );
  const bodyStart = html.indexOf('<body');
  const coverStart = html.indexOf('<section data-report-cover-page', bodyStart);
  const headerStart = html.indexOf('class="report-header', bodyStart);
  const contentStart = html.indexOf('Relocation Analysis Report', bodyStart);

  assert.ok(coverStart > bodyStart);
  assert.ok(coverStart < headerStart);
  assert.ok(headerStart < contentStart);
  assert.match(html, /data-report-cover src="data:image\/jpeg;base64,cover"/);
  assert.match(html, /\[data-report-cover-page\][^{]*\{[^}]*break-after:\s*page/s);
  assert.match(html, /\[data-report-cover\][^{]*\{[^}]*object-fit:\s*contain/s);
  assert.match(html, /@page\s*\{[^}]*size:\s*A4[^}]*margin:\s*0/s);
});
