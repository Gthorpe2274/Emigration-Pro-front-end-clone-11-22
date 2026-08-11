import { Link, useLocation } from 'react-router-dom';
import Navigation from '@/react-app/components/Navigation';
import Footer from '@/react-app/components/Footer';
import { useSEO } from '@/react-app/hooks/useSEO';
import { PAGE_SEO } from '@/shared/page-seo';

export function SampleReport() {
  const location = useLocation();
  const returnTo = location.state?.returnTo;

  useSEO({
    title: 'Sample Relocation Report — Bangkok, Thailand',
    description:
      'Explore a sample Emigration Pro relocation report for Bangkok, including visas, employment, healthcare, costs, safety, infrastructure, education, and relocation planning.',
    canonicalPath: '/sample-report',
    image: PAGE_SEO['/sample-report'].image,
    imageAlt: PAGE_SEO['/sample-report'].imageAlt,
  });

  return (
    <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14 print:hidden">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <div className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-3">
              Sample Report
            </div>
            <h1 className="font-brand-serif font-medium text-4xl md:text-5xl tracking-tight text-brand-ink">
              Bangkok Relocation Report
            </h1>
            <p className="mt-3 text-brand-muted max-w-2xl leading-relaxed">
              Review the structure, research depth, source links, and recommendations included in an
              Emigration Pro personalized report. Sample content is watermarked throughout.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {returnTo && (
              <Link
                to={returnTo}
                className="inline-flex items-center px-5 py-3 rounded-lg border border-brand-border-strong bg-brand-surface text-brand-ink font-semibold hover:bg-brand-surface-2 transition-colors"
              >
                &larr; Back to Results
              </Link>
            )}
            <a
              href="/sample-report-bangkok.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-3 rounded-lg bg-brand-btn text-brand-btn-ink font-semibold hover:bg-brand-ink-2 transition-colors"
            >
              Open Full Screen
            </a>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-brand-border bg-white shadow-xl">
          <iframe
            src="/sample-report-bangkok.html"
            title="Sample Bangkok, Thailand relocation report"
            className="block w-full h-[82vh] min-h-[720px] border-0"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
