import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const appSource = readFileSync(new URL('../src/react-app/App.tsx', import.meta.url), 'utf8');
const navigationSource = readFileSync(
  new URL('../src/react-app/components/Navigation.tsx', import.meta.url),
  'utf8',
);
const footerSource = readFileSync(
  new URL('../src/react-app/components/Footer.tsx', import.meta.url),
  'utf8',
);

const publicPages = [
  { path: '/sample-report', url: 'https://emigrationpro.com/sample-report', component: 'SampleReport', label: 'Sample Report' },
  { path: '/about', url: 'https://emigrationpro.com/about', component: 'AboutUs', label: 'About Us' },
  { path: '/blog', url: 'https://emigrationpro.com/blog', component: 'Blog', label: 'Relocation Guides' },
] as const;

test('keeps the sample report, about, and relocation guide routes distinct', () => {
  assert.equal(new Set(publicPages.map(({ path }) => path)).size, publicPages.length);

  for (const { path, component } of publicPages) {
    assert.match(
      appSource,
      new RegExp(`<Route\\s+path=["']${path}["']\\s+element=\\{<${component}\\s*/>\\}`),
      `${path} should render ${component}`,
    );
  }
});
test('links every public page from both navigation surfaces', () => {
  for (const { url, label } of publicPages) {
    const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const linkPattern = new RegExp(
      `(?:href:\\s*["']${escapedUrl}["'][\\s\\S]{0,120}label:\\s*["']${escapedLabel}["']|` +
        `href=["']${escapedUrl}["'][\\s\\S]{0,160}>[\\s\\n]*${escapedLabel})`,
    );

    assert.match(navigationSource, linkPattern, `${label} should remain in the primary navigation`);
    assert.match(footerSource, linkPattern, `${label} should remain in the footer`);
  }
});
