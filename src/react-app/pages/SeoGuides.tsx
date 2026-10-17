import { ArrowRight, CheckCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/react-app/components/Footer';
import Navigation from '@/react-app/components/Navigation';
import { useSEO } from '@/react-app/hooks/useSEO';
import { PAGE_SEO, SITE_ORIGIN } from '@/shared/page-seo';
import { GUIDE_DATA, GuideData, LAST_REVIEWED } from '@/shared/guide-data';

function GuidePage({ data }: { data: GuideData }) {
  const seo = PAGE_SEO[data.path];
  const faqEntities = data.faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  }));

  useSEO({
    title: seo.title,
    description: seo.description,
    canonicalPath: data.path,
    type: 'article',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: seo.heading,
        description: seo.description,
        datePublished: '2026-10-14',
        dateModified: '2026-10-14',
        author: { '@type': 'Organization', name: 'Emigration Pro' },
        publisher: { '@type': 'Organization', name: 'Emigration Pro' },
        mainEntityOfPage: `${SITE_ORIGIN}${data.path}`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqEntities,
      },
    ],
  });

  return (
    <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink">
      <Navigation />
      <main>
        <section className="border-b border-brand-border bg-brand-surface">
          <div className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-24">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-bg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-ink-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
              {data.eyebrow}
            </div>
            <h1 className="max-w-4xl font-brand-serif text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">{seo.heading}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-brand-muted">{data.intro}</p>
            <p className="mt-5 text-sm font-medium text-brand-muted">Last reviewed {LAST_REVIEWED}</p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 md:px-8 md:py-20">
          <div className="space-y-12">
            {data.sections.map((section) => (
              <article key={section.title} className="border-b border-brand-border pb-12 last:border-b-0">
                <h2 className="font-brand-serif text-3xl font-medium leading-tight md:text-4xl">{section.title}</h2>
                <div className="mt-5 max-w-4xl space-y-4 text-base leading-7 text-brand-muted">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
                {section.bullets && (
                  <ul className="mt-6 grid gap-3 md:grid-cols-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 rounded-lg border border-brand-border bg-brand-surface p-4 text-sm leading-relaxed text-brand-ink-2">
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-accent" aria-hidden="true" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>

          <section className="mt-4 rounded-xl border border-brand-border bg-brand-surface p-6 md:p-8">
            <h2 className="font-brand-serif text-3xl font-medium">Frequently asked questions</h2>
            <div className="mt-6 divide-y divide-brand-border">
              {data.faqs.map((faq) => (
                <div key={faq.question} className="py-5 first:pt-0 last:pb-0">
                  <h3 className="text-lg font-semibold text-brand-ink">{faq.question}</h3>
                  <p className="mt-2 leading-relaxed text-brand-muted">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-brand-serif text-3xl font-medium">Official starting points</h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-brand-muted">Rules change. Confirm current requirements with the responsible government authority before acting.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {data.sources.map((source) => (
                <a key={source.href} href={source.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-brand-border bg-brand-surface px-4 py-3 text-sm font-semibold text-brand-ink hover:border-brand-accent">
                  {source.label}<ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </section>

          <section className="mt-14 rounded-xl bg-brand-ink p-7 text-white md:p-10">
            <h2 className="font-brand-serif text-3xl font-medium md:text-4xl">Turn research into a personal shortlist</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-[#b8c8e2]">Answer questions about your budget, profession, family and priorities to identify destinations worth investigating further.</p>
            <Link to="/assessment" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#15803d] px-6 py-3 font-semibold text-white hover:bg-[#166534]">
              Start the free assessment<ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>

          <section className="mt-14">
            <h2 className="font-brand-serif text-3xl font-medium">Continue planning</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {data.related.map((item) => (
                <Link key={item.to} to={item.to} className="group rounded-xl border border-brand-border bg-brand-surface p-5 hover:border-brand-accent">
                  <span className="font-semibold text-brand-ink group-hover:text-brand-accent">{item.label}</span>
                  <span className="mt-2 block text-sm leading-relaxed text-brand-muted">{item.description}</span>
                </Link>
              ))}
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export function BestCountriesGuide() {
  return <GuidePage data={GUIDE_DATA['/best-countries-for-americans-to-move-to']} />;
}

export function MoveOutOfUnitedStatesGuide() {
  return <GuidePage data={GUIDE_DATA['/how-to-move-out-of-the-united-states']} />;
}

export function MovingToEuropeGuide() {
  return <GuidePage data={GUIDE_DATA['/moving-to-europe-from-usa']} />;
}

export function DigitalNomadVisaCountriesGuide() {
  return <GuidePage data={GUIDE_DATA['/digital-nomad-visa-countries']} />;
}
