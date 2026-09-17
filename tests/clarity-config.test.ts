import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CLARITY_PROJECT_ID,
  TRACKED_CLARITY_PAGES,
  getTrackedClarityPage,
  normalizeClarityPath,
} from '../src/react-app/analytics/clarityConfig.ts';

test('uses the production Clarity project everywhere', () => {
  assert.equal(CLARITY_PROJECT_ID, 'yif8w21arg');
});

test('tracks exact and dynamic public routes', () => {
  assert.equal(getTrackedClarityPage('/')?.pageId, 'home');
  assert.equal(getTrackedClarityPage('/assessment/')?.pageId, 'assessment');
  assert.equal(getTrackedClarityPage('/city/thailand/bangkok')?.pageId, 'city-details');
  assert.equal(getTrackedClarityPage('/blog/moving-to-mexico')?.pageId, 'blog-post');
});

test('does not track private, payment, admin, or uploaded-file routes', () => {
  const excludedPaths = [
    '/results/123',
    '/relocation-hub/123',
    '/checkout-report',
    '/access-hub',
    '/admin/analytics',
    '/system-login',
    '/test-reports',
    '/file-converter',
  ];

  for (const path of excludedPaths) {
    assert.equal(getTrackedClarityPage(path), undefined, `${path} should remain excluded`);
  }
});

test('normalizes query strings, hashes, and trailing slashes', () => {
  assert.equal(normalizeClarityPath('/blog/example/?source=email#section'), '/blog/example');
});

test('keeps route patterns and page identifiers unique', () => {
  assert.equal(new Set(TRACKED_CLARITY_PAGES.map((page) => page.path)).size, TRACKED_CLARITY_PAGES.length);
  assert.equal(new Set(TRACKED_CLARITY_PAGES.map((page) => page.pageId)).size, TRACKED_CLARITY_PAGES.length);
});
