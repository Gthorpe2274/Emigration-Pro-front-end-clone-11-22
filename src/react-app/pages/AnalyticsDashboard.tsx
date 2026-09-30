import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  Clock3,
  ExternalLink,
  Flame,
  Gauge,
  Globe2,
  MonitorSmartphone,
  MousePointerClick,
  RefreshCw,
  TriangleAlert,
  Users,
  Video,
} from 'lucide-react';
import { CLARITY_PROJECT_ID, TRACKED_CLARITY_PAGES } from '@/react-app/analytics/clarityConfig';

const CLARITY_BASE = `https://clarity.microsoft.com/projects/view/${CLARITY_PROJECT_ID}`;

type BreakdownItem = { name: string; sessions: number };
type BehaviorMetric = { count: number; pageViews: number; sessionPercentage: number };

type AnalyticsPayload = {
  source: 'clarity';
  syncedAt: string;
  cached: boolean;
  stale: boolean;
  data: {
    periodDays: number;
    metrics: {
      sessions: number;
      botSessions: number;
      uniqueUsers: number;
      pagesPerSession: number;
      averageScrollDepth: number;
      activeTimeSeconds: number;
      totalTimeSeconds: number;
      deadClicks: BehaviorMetric;
      rageClicks: BehaviorMetric;
      excessiveScrolls: BehaviorMetric;
      quickBacks: BehaviorMetric;
      scriptErrors: BehaviorMetric;
      errorClicks: BehaviorMetric;
    };
    popularPages: BreakdownItem[];
    devices: BreakdownItem[];
    browsers: BreakdownItem[];
    countries: BreakdownItem[];
    referrers: BreakdownItem[];
  };
};

function getApiBaseUrl() {
  return window.location.hostname.includes('netlify.app')
    ? 'https://emigration-pro.aiservices4biz.workers.dev'
    : '';
}

function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value);
}

function formatDuration(seconds: number) {
  if (!seconds) return '0s';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

function formatPageName(value: string) {
  try {
    const url = new URL(value);
    return `${url.pathname}${url.search}` || '/';
  } catch {
    return value;
  }
}

function BreakdownCard({
  title,
  icon: Icon,
  items,
  emptyLabel,
}: {
  title: string;
  icon: typeof Globe2;
  items: BreakdownItem[];
  emptyLabel: string;
}) {
  const maximum = Math.max(...items.map((item) => item.sessions), 1);
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="mb-5 flex items-center gap-3">
        <Icon className="h-5 w-5 text-cyan-300" />
        <h2 className="font-bold">{title}</h2>
      </div>
      {items.length ? (
        <div className="space-y-4">
          {items.slice(0, 5).map((item) => (
            <div key={item.name}>
              <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
                <span className="truncate text-slate-300" title={item.name}>{item.name}</span>
                <span className="shrink-0 font-semibold text-slate-100">{formatNumber(item.sessions)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.max((item.sessions / maximum) * 100, 3)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{emptyLabel}</p>
      )}
    </article>
  );
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = sessionStorage.getItem('adminToken') || sessionStorage.getItem('blogAdminToken');
    if (!token) {
      setError('Your admin session has expired. Sign in again to view analytics.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/analytics/clarity`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => ({})) as AnalyticsPayload & { error?: string };
      if (!response.ok) throw new Error(result.error || 'Unable to load Clarity analytics.');
      setAnalytics(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load Clarity analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const metrics = analytics?.data.metrics;
  const syncedAt = analytics?.syncedAt
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(analytics.syncedAt))
    : '';

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-slate-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live Clarity data
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Behavior analytics</h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              Current Microsoft Clarity activity for the previous 72 hours. Metrics refresh from Clarity throughout the day.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void loadAnalytics()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold hover:border-cyan-500 disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh view
            </button>
            <a href="/admin/crm" className="px-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">Back to CRM</a>
          </div>
        </header>

        <section className="flex flex-wrap items-center gap-x-6 gap-y-2 py-5 text-xs text-slate-500">
          <span>Project <strong className="font-mono text-slate-300">{CLARITY_PROJECT_ID}</strong></span>
          {syncedAt && <span>Last synced <strong className="text-slate-300">{syncedAt}</strong></span>}
          {analytics?.cached && !analytics.stale && <span className="text-cyan-300">Shared cached snapshot</span>}
          {analytics?.stale && <span className="font-semibold text-amber-300">Showing the latest saved snapshot</span>}
        </section>

        {error && (
          <section className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
            <div className="flex gap-4">
              <TriangleAlert className="mt-0.5 h-6 w-6 shrink-0 text-amber-300" />
              <div>
                <h2 className="font-bold text-amber-100">Clarity data is not connected yet</h2>
                <p className="mt-1 text-sm leading-6 text-amber-100/70">{error}</p>
                <a href={`${CLARITY_BASE}/settings`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-200 hover:text-white">
                  Open Clarity settings <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </section>
        )}

        {loading && !analytics ? (
          <section className="grid min-h-72 place-items-center rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="text-center text-slate-400">
              <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-cyan-300" />
              Loading current Clarity data…
            </div>
          </section>
        ) : metrics && analytics ? (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Sessions', value: formatNumber(metrics.sessions), detail: `${formatNumber(metrics.botSessions)} bots excluded`, icon: Activity },
                { label: 'Unique users', value: formatNumber(metrics.uniqueUsers), detail: 'Distinct Clarity visitors', icon: Users },
                { label: 'Pages per session', value: formatNumber(metrics.pagesPerSession, 2), detail: 'Average page depth', icon: BarChart3 },
                { label: 'Average scroll depth', value: `${formatNumber(metrics.averageScrollDepth, 1)}%`, detail: 'Across recorded pages', icon: Gauge },
              ].map(({ label, value, detail, icon: Icon }) => (
                <article key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
                    <Icon className="h-5 w-5 text-cyan-300" />
                  </div>
                  <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
                  <p className="mt-1 text-xs text-slate-500">{detail}</p>
                </article>
              ))}
            </section>

            <section className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
              <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <div className="flex items-center gap-3">
                  <MousePointerClick className="h-5 w-5 text-cyan-300" />
                  <h2 className="font-bold">Interaction signals</h2>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {[
                    ['Dead clicks', metrics.deadClicks],
                    ['Rage clicks', metrics.rageClicks],
                    ['Excessive scrolls', metrics.excessiveScrolls],
                    ['Quick backs', metrics.quickBacks],
                    ['Script errors', metrics.scriptErrors],
                    ['Error clicks', metrics.errorClicks],
                  ].map(([label, metric]) => {
                    const item = metric as BehaviorMetric;
                    return (
                      <div key={label as string} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                        <p className="text-xs font-semibold text-slate-500">{label as string}</p>
                        <div className="mt-2 flex items-end justify-between gap-3">
                          <strong className="text-2xl">{formatNumber(item.count)}</strong>
                          <span className="text-xs text-slate-500">{formatNumber(item.sessionPercentage, 1)}% sessions</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-cyan-300" />
                  <h2 className="font-bold">Engagement time</h2>
                </div>
                <p className="mt-6 text-4xl font-bold">{formatDuration(metrics.activeTimeSeconds)}</p>
                <p className="mt-2 text-sm text-slate-400">Average active time out of {formatDuration(metrics.totalTimeSeconds)} total time.</p>
                <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${metrics.totalTimeSeconds ? Math.min((metrics.activeTimeSeconds / metrics.totalTimeSeconds) * 100, 100) : 0}%` }}
                  />
                </div>
              </article>
            </section>

            <section className="mt-4 grid gap-4 lg:grid-cols-3">
              <BreakdownCard title="Devices" icon={MonitorSmartphone} items={analytics.data.devices} emptyLabel="No device breakdown for this period." />
              <BreakdownCard title="Browsers" icon={Globe2} items={analytics.data.browsers} emptyLabel="No browser breakdown for this period." />
              <BreakdownCard title="Countries" icon={Globe2} items={analytics.data.countries} emptyLabel="No country breakdown for this period." />
            </section>

            <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70">
              <div className="flex flex-col gap-3 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-bold">Popular pages</h2>
                  <p className="mt-1 text-sm text-slate-500">Pages visited during the current Clarity export window.</p>
                </div>
                <a href={`${CLARITY_BASE}/heatmaps`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                  View heatmaps <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              {analytics.data.popularPages.length ? (
                <div className="divide-y divide-slate-800">
                  {analytics.data.popularPages.map((page, index) => (
                    <div key={`${page.name}-${index}`} className="flex items-center gap-4 px-6 py-4">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-800 text-xs font-bold text-slate-400">{index + 1}</span>
                      <span className="min-w-0 flex-1 truncate font-mono text-sm text-slate-300" title={page.name}>{formatPageName(page.name)}</span>
                      <span className="shrink-0 text-sm font-semibold">{formatNumber(page.sessions)} sessions</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-6 text-sm text-slate-500">No popular-page breakdown is available for this period.</p>
              )}
            </section>
          </>
        ) : null}

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { label: 'Open Clarity overview', href: `${CLARITY_BASE}/dashboard`, icon: BarChart3 },
            { label: 'Open heatmaps', href: `${CLARITY_BASE}/heatmaps`, icon: Flame },
            { label: 'Open session recordings', href: `${CLARITY_BASE}/recordings`, icon: Video },
          ].map(({ label, href, icon: Icon }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-cyan-500/70">
              <span className="flex items-center gap-3 font-semibold"><Icon className="h-5 w-5 text-cyan-300" />{label}</span>
              <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-cyan-300" />
            </a>
          ))}
        </section>

        <p className="mt-6 text-xs leading-5 text-slate-500">
          Clarity tracks {TRACKED_CLARITY_PAGES.length} consented public route rules. Customer results, relocation hubs, checkout, administration, system login, and uploaded-file routes remain excluded.
        </p>
      </div>
    </main>
  );
}
