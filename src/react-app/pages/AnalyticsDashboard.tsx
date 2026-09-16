import { BarChart3, ExternalLink, Flame, MousePointerClick, Video } from 'lucide-react';
import { TRACKED_CLARITY_PAGES } from '@/react-app/components/ClarityAnalytics';

const PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID || 'yif8w21arg';
const CLARITY_BASE = `https://clarity.microsoft.com/projects/view/${PROJECT_ID}`;

export default function AnalyticsDashboard() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 border-b border-slate-800 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Protected admin</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Behavior analytics</h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              Heatmaps and recordings are collected only after visitor consent, with form controls masked and advertising storage disabled.
            </p>
          </div>
          <a href="/admin/crm" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">Back to CRM</a>
        </div>

        <section className="grid gap-4 py-8 md:grid-cols-3">
          {[
            { label: 'Clarity overview', href: `${CLARITY_BASE}/dashboard`, icon: BarChart3 },
            { label: 'Heatmaps', href: `${CLARITY_BASE}/heatmaps`, icon: Flame },
            { label: 'Session recordings', href: `${CLARITY_BASE}/recordings`, icon: Video },
          ].map(({ label, href, icon: Icon }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-cyan-500/70">
              <Icon className="h-7 w-7 text-cyan-300" />
              <div className="mt-5 flex items-center justify-between">
                <span className="font-semibold">{label}</span>
                <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-cyan-300" />
              </div>
            </a>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="border-b border-slate-800 p-6">
            <div className="flex items-center gap-3">
              <MousePointerClick className="h-6 w-6 text-cyan-300" />
              <h2 className="text-xl font-bold">Tracked pages</h2>
            </div>
            <p className="mt-2 text-sm text-slate-400">Use the path or tracked-page identifier below in Clarity filters.</p>
          </div>
          <div className="grid gap-px bg-slate-800 sm:grid-cols-2 lg:grid-cols-3">
            {TRACKED_CLARITY_PAGES.map((page) => (
              <article key={page.path} className="bg-slate-900 p-6">
                <span className="rounded-full bg-cyan-950 px-2.5 py-1 text-xs font-semibold text-cyan-200">{page.group}</span>
                <h3 className="mt-4 font-bold">{page.label}</h3>
                <p className="mt-2 font-mono text-xs text-slate-400">{page.path}</p>
                <p className="mt-1 font-mono text-xs text-slate-500">tracked_page: {page.pageId}</p>
              </article>
            ))}
          </div>
        </section>

        <p className="mt-6 text-sm text-slate-500">
          The legacy <code>/best-countries</code> URL is reported as <strong className="text-slate-300">Leave Now</strong>; it is intentionally not a separate dashboard entry.
        </p>
      </div>
    </main>
  );
}
