import { ArrowRight, CheckCircle, Clock, ExternalLink, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/react-app/components/Footer';
import Navigation from '@/react-app/components/Navigation';
import { useSEO } from '@/react-app/hooks/useSEO';
import { PAGE_SEO } from '@/shared/page-seo';

const LAST_REVIEWED = 'September 7, 2026';

const destinations = [
  {
    name: 'Albania',
    flag: '🇦🇱',
    entry: 'Visa-free for up to 1 year',
    budgetFit: 'Strong outside peak-season coastal areas',
    bestFor: 'The longest simple arrival window in Europe',
    note: 'A residence permit is required if you stay beyond one year or plan to work or study.',
    source: 'https://travel.state.gov/en/international-travel/travel-advisories/albania.html',
  },
  {
    name: 'Georgia',
    flag: '🇬🇪',
    entry: 'Visa-free for up to 365 days',
    budgetFit: 'Strong in Tbilisi and smaller cities, depending on neighborhood',
    bestFor: 'Remote workers seeking a long initial stay',
    note: 'U.S. citizens may enter, reside, work or study without a visa for up to 365 days; admission remains discretionary.',
    source: 'https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/Georgia.html',
  },
  {
    name: 'Mexico',
    flag: '🇲🇽',
    entry: 'Visa-free visitor entry; length set at arrival, up to 180 days',
    budgetFit: 'Strong in many inland and secondary cities',
    bestFor: 'A short flight from the United States',
    note: 'The immigration officer determines the authorized stay. Visitor status is not permission to take local employment.',
    source: 'https://travel.state.gov/en/international-travel/travel-advisories/mexico.html',
  },
  {
    name: 'Colombia',
    flag: '🇨🇴',
    entry: 'Visa-free for 90 days; extension may be available',
    budgetFit: 'Strong in several major and secondary cities',
    bestFor: 'City choice, climate variety and U.S. flight access',
    note: 'Tourist and business stays are limited to 180 cumulative days per calendar year; complete Check-Mig before travel.',
    source: 'https://travel.state.gov/en/international-travel/travel-advisories/colombia.html',
  },
  {
    name: 'Ecuador',
    flag: '🇪🇨',
    entry: 'Visa-free for up to 90 days in a 12-month period',
    budgetFit: 'Strong in mainland cities; the Galápagos costs more',
    bestFor: 'Dollar-based budgeting and varied climates',
    note: 'A visa must be approved before travel for a longer stay. Entry and security rules vary by area.',
    source: 'https://travel.state.gov/en/international-travel/travel-advisories/ecuador.html',
  },
  {
    name: 'Thailand',
    flag: '🇹🇭',
    entry: 'Visa-free for stays under 60 days; online arrival registration required',
    budgetFit: 'Strong outside premium islands and central Bangkok',
    bestFor: 'Established infrastructure and regional travel',
    note: 'Check the admit-until stamp at arrival. Longer stays and many work activities require the appropriate visa.',
    source: 'https://travel.state.gov/en/international-travel/travel-advisories/thailand.html',
  },
];

export default function LowCostQuickEntry() {
  const seo = PAGE_SEO['/best-countries'];

  useSEO({
    title: seo.title,
    description: seo.description,
    canonicalPath: '/best-countries',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: seo.heading,
        description: seo.description,
        datePublished: '2026-09-07',
        dateModified: '2026-09-07',
        author: { '@type': 'Organization', name: 'Emigration Pro' },
        publisher: { '@type': 'Organization', name: 'Emigration Pro' },
        mainEntityOfPage: 'https://emigrationpro.com/best-countries',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Low-cost countries with quick entry for U.S. citizens',
        itemListElement: destinations.map((destination, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: destination.name,
          description: `${destination.entry}. ${destination.bestFor}.`,
        })),
      },
    ],
  });

  return (
    <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink">
      <Navigation />
      <main>
        <section className="border-b border-brand-border">
          <div className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-24">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-accent">Practical shortlist</p>
            <h1 className="max-w-4xl font-brand-serif text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">
              Low-cost countries Americans can enter quickly
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-relaxed text-brand-muted">
              Six destinations where a U.S. passport can usually get you through the first arrival without a lengthy advance visa process—and where everyday costs can be lower than in many U.S. cities.
            </p>
            <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
              <strong>Quick entry is not the same as legal residency.</strong> Visitor admission does not automatically authorize local work, permanent residence, public healthcare or unlimited stays. Rules can change and border officers make the final admission decision.
            </div>
            <p className="mt-5 text-sm text-brand-muted">Entry rules reviewed {LAST_REVIEWED}. Cost labels are relative and qualitative; housing and lifestyle change the result.</p>
          </div>
        </section>

        <section className="border-b border-brand-border bg-brand-surface">
          <div className="mx-auto max-w-5xl px-4 py-14 md:px-8 md:py-20">
            <div className="mb-10 grid gap-5 md:grid-cols-3">
              {[
                [Clock, 'Fast first step', 'No advance tourist visa for the ordinary stays shown below.'],
                [Wallet, 'Budget potential', 'Options with lower-cost cities, not a promise that every location is cheap.'],
                [CheckCircle, 'Official checks', 'Each entry rule links to current U.S. State Department guidance.'],
              ].map(([Icon, title, copy]) => {
                const CardIcon = Icon as typeof Clock;
                return (
                  <div key={String(title)} className="rounded-xl border border-brand-border bg-brand-bg p-5">
                    <CardIcon className="mb-3 h-5 w-5 text-brand-accent" />
                    <h2 className="font-brand-serif text-xl font-medium">{String(title)}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-brand-muted">{String(copy)}</p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-6">
              {destinations.map((destination, index) => (
                <article key={destination.name} className="rounded-xl border border-brand-border bg-brand-bg p-6 md:p-8">
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-2xl">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl" aria-hidden="true">{destination.flag}</span>
                        <h2 className="font-brand-serif text-3xl font-medium">{index + 1}. {destination.name}</h2>
                      </div>
                      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                        <div><dt className="font-semibold text-brand-ink">Entry window</dt><dd className="mt-1 leading-relaxed text-brand-muted">{destination.entry}</dd></div>
                        <div><dt className="font-semibold text-brand-ink">Budget fit</dt><dd className="mt-1 leading-relaxed text-brand-muted">{destination.budgetFit}</dd></div>
                        <div><dt className="font-semibold text-brand-ink">Best for</dt><dd className="mt-1 leading-relaxed text-brand-muted">{destination.bestFor}</dd></div>
                        <div><dt className="font-semibold text-brand-ink">Important limit</dt><dd className="mt-1 leading-relaxed text-brand-muted">{destination.note}</dd></div>
                      </dl>
                    </div>
                    <a href={destination.source} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-brand-accent hover:underline">
                      Verify entry rules <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-20">
          <h2 className="font-brand-serif text-4xl font-medium">How to choose before you book</h2>
          <ol className="mt-7 grid gap-5 md:grid-cols-2">
            {[
              ['Confirm the legal purpose', 'Tourism, remote work, study and local employment can require different permission even when entry is visa-free.'],
              ['Price the actual city', 'Compare long-term housing, insurance, flights, taxes and transport—not a countrywide cost-of-living average.'],
              ['Check the exit plan', 'Know your authorized departure date and whether a residence application can legally be made after arrival.'],
              ['Review safety and healthcare', 'Read the current advisory, identify hospitals and arrange coverage that works outside the United States.'],
            ].map(([title, copy], index) => (
              <li key={title} className="flex gap-4 rounded-xl border border-brand-border p-5">
                <span className="font-brand-serif text-2xl text-brand-accent">{index + 1}</span>
                <div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-relaxed text-brand-muted">{copy}</p></div>
              </li>
            ))}
          </ol>
          <div className="mt-12 rounded-2xl bg-brand-ink p-8 text-white md:p-10">
            <h2 className="font-brand-serif text-3xl font-medium">Find the country that fits your situation</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-[#b8c8e2]">A low price or long visitor stay is only one part of the decision. Compare your budget, work, family, healthcare and climate needs with our free assessment.</p>
            <Link to="/assessment" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-brand-accent-2 px-6 py-3 font-semibold text-brand-accent-ink">
              Start the free assessment <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
