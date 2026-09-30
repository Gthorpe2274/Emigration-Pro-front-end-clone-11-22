import assert from 'node:assert/strict';
import test from 'node:test';
import { parseClarityInsights } from '../src/worker/clarity-analytics.ts';

const fixture = [
  { metricName: 'Traffic', information: [{ totalSessionCount: '12', totalBotSessionCount: '2', distinctUserCount: '9', pagesPerSessionPercentage: 1.75 }] },
  { metricName: 'ScrollDepth', information: [{ averageScrollDepth: 82.5 }] },
  { metricName: 'EngagementTime', information: [{ activeTime: '70', totalTime: '95' }] },
  { metricName: 'DeadClickCount', information: [{ subTotal: '3', pagesViews: '2', sessionsWithMetricPercentage: 16.67 }] },
  { metricName: 'RageClickCount', information: [{ subTotal: '1', pagesViews: '1', sessionsWithMetricPercentage: 8.33 }] },
  { metricName: 'Device', information: [{ name: 'Mobile', sessionsCount: '8' }, { name: 'PC', sessionsCount: '4' }] },
  { metricName: 'Browser', information: [{ name: 'ChromeMobile', sessionsCount: '8' }, { name: 'Edge', sessionsCount: '4' }] },
  { metricName: 'Country', information: [{ name: 'United States', sessionsCount: '10' }, { name: 'Canada', sessionsCount: '2' }] },
  { metricName: 'PopularPages', information: [{ url: 'https://emigrationpro.com/', sessionsCount: '12' }] },
];

test('normalizes Clarity export metrics for the admin dashboard', () => {
  const result = parseClarityInsights(fixture);
  assert.equal(result.periodDays, 3);
  assert.deepEqual(result.metrics.sessions, 12);
  assert.deepEqual(result.metrics.uniqueUsers, 9);
  assert.deepEqual(result.metrics.pagesPerSession, 1.75);
  assert.deepEqual(result.metrics.deadClicks, { count: 3, pageViews: 2, sessionPercentage: 16.67 });
  assert.deepEqual(result.devices[0], { name: 'Mobile', sessions: 8 });
  assert.deepEqual(result.popularPages[0], { name: 'https://emigrationpro.com/', sessions: 12 });
});

test('accepts casing variations and missing optional metric blocks', () => {
  const result = parseClarityInsights([
    { metricName: 'Traffic', information: [{ sessionsCount: 4, distantUserCount: 3, PagesPerSessionPercentage: 2 }] },
    { metricName: 'Popular Pages', information: [{ URL: '/', totalSessionCount: 4 }] },
  ]);
  assert.equal(result.metrics.sessions, 4);
  assert.equal(result.metrics.uniqueUsers, 3);
  assert.equal(result.metrics.scriptErrors.count, 0);
  assert.deepEqual(result.popularPages, [{ name: '/', sessions: 4 }]);
});

test('rejects a malformed Clarity response', () => {
  assert.throws(() => parseClarityInsights({ error: true }), /invalid response/);
});
