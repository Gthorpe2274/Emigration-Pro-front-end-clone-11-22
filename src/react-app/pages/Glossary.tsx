import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, ExternalLink, Search } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';
import Footer from '@/react-app/components/Footer';
import { useSEO } from '@/react-app/hooks/useSEO';
import { PAGE_SEO } from '@/shared/page-seo';
import { GLOSSARY_CATEGORIES, GLOSSARY_TERMS } from '@/shared/glossary-data';

const SITE_ORIGIN = 'https://emigrationpro.com';

function termId(term: string) {
  return term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function Glossary() {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const visibleTerms = useMemo(
    () => GLOSSARY_TERMS.filter((entry) =>
      !normalizedQuery || [entry.term, entry.category, entry.definition, entry.significance]
        .some((value) => value.toLowerCase().includes(normalizedQuery))),
    [normalizedQuery],
  );

  const seo = PAGE_SEO['/moving-abroad-glossary'];
  useSEO({
    title: seo.title,
    description: seo.description,
    canonicalPath: '/moving-abroad-glossary',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        '@id': `${SITE_ORIGIN}/moving-abroad-glossary#term-set`,
        name: 'Moving Abroad Glossary for Americans',
        description: seo.description,
        url: `${SITE_ORIGIN}/moving-abroad-glossary`,
        inLanguage: 'en-US',
        hasDefinedTerm: GLOSSARY_TERMS.map((entry) => ({
          '@type': 'DefinedTerm',
          '@id': `${SITE_ORIGIN}/moving-abroad-glossary#${termId(entry.term)}`,
          name: entry.term,
          description: entry.definition,
          inDefinedTermSet: `${SITE_ORIGIN}/moving-abroad-glossary#term-set`,
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Moving Abroad Glossary', item: `${SITE_ORIGIN}/moving-abroad-glossary` },
        ],
      },
    ],
  });

  return (
    <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink">
      <Navigation />

      <main>
        <section className="border-b border-brand-border">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-surface border border-brand-border rounded-full text-xs font-semibold text-brand-ink-2 uppercase tracking-wide mb-7">
              <BookOpen className="w-3.5 h-3.5 text-brand-accent" aria-hidden="true" />
              Relocation Knowledge Base
            </div>
            <h1 className="font-brand-serif font-medium text-5xl md:text-6xl leading-[1.05] tracking-tight text-brand-ink mb-6">
              Moving Abroad <span className="italic text-brand-ink-2">Glossary</span>
            </h1>
            <p className="text-lg leading-relaxed text-brand-muted max-w-3xl mx-auto mb-9">
              Plain-English explanations of visa, residency, document, U.S. tax, healthcare,
              and arrival terms Americans encounter when planning an international move.
            </p>

            <label className="relative block max-w-2xl mx-auto text-left">
              <span className="sr-only">Search glossary terms</span>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search visas, taxes, documents, healthcare…"
                className="w-full rounded-xl border border-brand-border-strong bg-brand-surface py-4 pl-12 pr-4 text-brand-ink placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
              />
            </label>
          </div>
        </section>

        <section className="bg-brand-surface border-b border-brand-border">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
            <nav aria-label="Glossary categories" className="flex flex-wrap justify-center gap-2">
              {GLOSSARY_CATEGORIES.map((category) => (
                <a
                  key={category}
                  href={`#${termId(category)}`}
                  className="px-4 py-2 rounded-full bg-brand-bg border border-brand-border text-sm font-medium text-brand-ink-2 hover:border-brand-accent hover:text-brand-accent transition-colors"
                >
                  {category}
                </a>
              ))}
            </nav>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 md:px-8 py-14 md:py-20">
          {visibleTerms.length === 0 ? (
            <div className="text-center py-16 border border-brand-border rounded-2xl bg-brand-surface">
              <h2 className="font-brand-serif text-2xl font-medium mb-2">No matching term found</h2>
              <p className="text-brand-muted">Try a broader word such as “visa,” “tax,” or “document.”</p>
            </div>
          ) : (
            GLOSSARY_CATEGORIES.map((category) => {
              const categoryTerms = visibleTerms.filter((entry) => entry.category === category);
              if (!categoryTerms.length) return null;

              return (
                <section key={category} id={termId(category)} className="scroll-mt-28 mb-16 last:mb-0">
                  <div className="flex items-end justify-between gap-4 border-b border-brand-border pb-4 mb-7">
                    <h2 className="font-brand-serif font-medium text-3xl md:text-4xl tracking-tight">{category}</h2>
                    <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                      {categoryTerms.length} {categoryTerms.length === 1 ? 'term' : 'terms'}
                    </span>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-5">
                    {categoryTerms.map((entry) => (
                      <article
                        key={entry.term}
                        id={termId(entry.term)}
                        className="scroll-mt-28 rounded-2xl border border-brand-border bg-brand-surface p-6 md:p-7"
                      >
                        <h3 className="font-brand-serif text-2xl font-medium text-brand-ink mb-4">{entry.term}</h3>
                        <p className="leading-7 text-brand-ink-2 mb-4">{entry.definition}</p>
                        <div className="space-y-3 text-sm leading-6 text-brand-muted">
                          <p><strong className="text-brand-ink">Why it matters:</strong> {entry.significance}</p>
                          <p><strong className="text-brand-ink">Example:</strong> {entry.example}</p>
                        </div>
                        <a
                          href={entry.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-brand-accent hover:underline"
                        >
                          {entry.source.label}
                          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </section>

        <section className="bg-brand-ink text-white">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-14 md:py-18 text-center">
            <h2 className="font-brand-serif text-3xl md:text-4xl font-medium mb-4">Definitions are only the starting point</h2>
            <p className="text-gray-300 leading-7 max-w-2xl mx-auto mb-8">
              Requirements change by country, city, personal profile, and application date. Use the
              assessment to identify compatible destinations, then review how these concepts apply in
              a personalized city-level report.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/assessment" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-brand-ink font-semibold hover:bg-gray-100 transition-colors">
                Start free assessment <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link to="/sample-report" className="inline-flex items-center px-6 py-3 rounded-lg border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors">
                View the sample report
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 md:px-8 py-10 text-sm leading-6 text-brand-muted">
          <p>
            This glossary provides general educational information, not legal, tax, medical, or
            immigration advice. Government rules and terminology change. Confirm requirements with the
            responsible authority and consult an appropriately licensed professional for advice about
            your circumstances.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
