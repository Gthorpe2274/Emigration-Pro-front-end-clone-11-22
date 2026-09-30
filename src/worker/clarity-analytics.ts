export const CLARITY_EXPORT_URL = 'https://www.clarity.ms/export-data/api/v1/project-live-insights';
export const CLARITY_PERIOD_DAYS = 3;

type UnknownRecord = Record<string, unknown>;

type ClarityMetricBlock = {
  metricName?: unknown;
  information?: unknown;
};

export type ClarityBreakdownItem = {
  name: string;
  sessions: number;
};

export type ClarityBehaviorMetric = {
  count: number;
  pageViews: number;
  sessionPercentage: number;
};

export type ClarityDashboardMetrics = {
  sessions: number;
  botSessions: number;
  uniqueUsers: number;
  pagesPerSession: number;
  averageScrollDepth: number;
  activeTimeSeconds: number;
  totalTimeSeconds: number;
  deadClicks: ClarityBehaviorMetric;
  rageClicks: ClarityBehaviorMetric;
  excessiveScrolls: ClarityBehaviorMetric;
  quickBacks: ClarityBehaviorMetric;
  scriptErrors: ClarityBehaviorMetric;
  errorClicks: ClarityBehaviorMetric;
};

export type ClarityDashboardData = {
  periodDays: number;
  metrics: ClarityDashboardMetrics;
  popularPages: ClarityBreakdownItem[];
  devices: ClarityBreakdownItem[];
  browsers: ClarityBreakdownItem[];
  countries: ClarityBreakdownItem[];
  referrers: ClarityBreakdownItem[];
};

export class ClarityApiError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Clarity API request failed with status ${status}`);
    this.status = status;
  }
}

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function firstNumber(record: UnknownRecord | undefined, keys: string[]): number {
  if (!record) return 0;
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return toNumber(record[key]);
  }
  return 0;
}

function normalizeMetricName(value: unknown): string {
  return typeof value === 'string' ? value.replace(/[\s_-]/g, '').toLowerCase() : '';
}

function getInformation(blocks: ClarityMetricBlock[], ...names: string[]): UnknownRecord[] {
  const expected = new Set(names.map(normalizeMetricName));
  const block = blocks.find((candidate) => expected.has(normalizeMetricName(candidate.metricName)));
  return Array.isArray(block?.information) ? block.information.filter(isRecord) : [];
}

function parseBehavior(blocks: ClarityMetricBlock[], ...names: string[]): ClarityBehaviorMetric {
  const row = getInformation(blocks, ...names)[0];
  return {
    count: firstNumber(row, ['subTotal', 'count', 'totalCount']),
    pageViews: firstNumber(row, ['pagesViews', 'pageViews']),
    sessionPercentage: firstNumber(row, ['sessionsWithMetricPercentage', 'sessionPercentage', 'percentage']),
  };
}

function getItemName(row: UnknownRecord): string {
  const candidate = row.URL
    ?? row.url
    ?? row.name
    ?? row.Name
    ?? row.title
    ?? row.pageTitle
    ?? row.referrerUrl;
  if (typeof candidate !== 'string' || !candidate.trim()) return 'Direct / unknown';
  return candidate.trim();
}

function parseBreakdown(blocks: ClarityMetricBlock[], names: string[]): ClarityBreakdownItem[] {
  return getInformation(blocks, ...names)
    .map((row) => ({
      name: getItemName(row),
      sessions: firstNumber(row, ['sessionsCount', 'sessionCount', 'totalSessionCount', 'count']),
    }))
    .filter((item) => item.sessions > 0)
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10);
}

export function parseClarityInsights(payload: unknown): ClarityDashboardData {
  if (!Array.isArray(payload)) throw new Error('Clarity returned an invalid response');
  const blocks = payload.filter(isRecord) as ClarityMetricBlock[];
  const traffic = getInformation(blocks, 'Traffic')[0];
  const scrollDepth = getInformation(blocks, 'ScrollDepth', 'Scroll Depth')[0];
  const engagement = getInformation(blocks, 'EngagementTime', 'Engagement Time')[0];

  return {
    periodDays: CLARITY_PERIOD_DAYS,
    metrics: {
      sessions: firstNumber(traffic, ['totalSessionCount', 'sessionsCount']),
      botSessions: firstNumber(traffic, ['totalBotSessionCount', 'botSessionsCount']),
      uniqueUsers: firstNumber(traffic, ['distinctUserCount', 'distantUserCount', 'uniqueUserCount']),
      pagesPerSession: firstNumber(traffic, ['pagesPerSessionPercentage', 'PagesPerSessionPercentage', 'pagesPerSession']),
      averageScrollDepth: firstNumber(scrollDepth, ['averageScrollDepth', 'scrollDepth']),
      activeTimeSeconds: firstNumber(engagement, ['activeTime', 'activeTimeSeconds']),
      totalTimeSeconds: firstNumber(engagement, ['totalTime', 'totalTimeSeconds']),
      deadClicks: parseBehavior(blocks, 'DeadClickCount', 'Dead Click Count'),
      rageClicks: parseBehavior(blocks, 'RageClickCount', 'Rage Click Count'),
      excessiveScrolls: parseBehavior(blocks, 'ExcessiveScroll', 'Excessive Scroll'),
      quickBacks: parseBehavior(blocks, 'QuickbackClick', 'Quickback Click'),
      scriptErrors: parseBehavior(blocks, 'ScriptErrorCount', 'Script Error Count'),
      errorClicks: parseBehavior(blocks, 'ErrorClickCount', 'Error Click Count'),
    },
    popularPages: parseBreakdown(blocks, ['PopularPages', 'Popular Pages']),
    devices: parseBreakdown(blocks, ['Device']),
    browsers: parseBreakdown(blocks, ['Browser']),
    countries: parseBreakdown(blocks, ['Country', 'Country/Region']),
    referrers: parseBreakdown(blocks, ['ReferrerUrl', 'Referrer URL']),
  };
}

export async function fetchClarityInsights(
  token: string,
  fetcher: typeof fetch = fetch,
): Promise<ClarityDashboardData> {
  const url = new URL(CLARITY_EXPORT_URL);
  url.searchParams.set('numOfDays', String(CLARITY_PERIOD_DAYS));
  const response = await fetcher(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new ClarityApiError(response.status);
  return parseClarityInsights(await response.json());
}
