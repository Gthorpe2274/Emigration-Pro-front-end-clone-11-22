import { ArrowRight, Landmark, Scale, ShieldCheck, Globe2, CheckCircle2, XCircle } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';
import Footer from '@/react-app/components/Footer';
import { useSEO } from '@/react-app/hooks/useSEO';
import { PAGE_SEO } from '@/shared/page-seo';

// Referral link for Nomad Capitalist. Replace with the tracked/attributed URL
// they provide (e.g. a UTM-tagged link or affiliate portal URL) once issued --
// this placeholder points at their general application page.
const PARTNER_URL = 'https://nomadcapitalist.com/apply/';

const capabilities = [
  {
    Icon: Scale,
    title: 'International tax strategy',
    desc: 'Cross-border tax optimization and jurisdiction analysis built around where you actually spend your time.',
  },
  {
    Icon: Landmark,
    title: 'Residency & second citizenship',
    desc: 'Citizenship by investment, residency by investment, and long-term relocation planning across 100+ countries.',
  },
  {
    Icon: ShieldCheck,
    title: 'Offshore banking & asset protection',
    desc: 'International banking relationships, asset-protection structures, and global wealth diversification.',
  },
  {
    Icon: Globe2,
    title: 'International corporate structuring',
    desc: 'Cross-border business structuring for entrepreneurs operating in more than one country.',
  },
];

const qualifies = [
  'US $500K+ annual income or US $1M+ in assets',
  'Value one integrated strategy over one-off "products"',
  'Are open to exploring more than one jurisdiction',
  'Want a long-term partner, not a single transaction',
];

const notAFit = [
  'Looking for a single, standalone service (one bank account, one visa filing)',
  'Not yet near the $500K income / $1M net worth threshold',
  'Want a DIY approach without professional coordination',
];

export default function GlobalWealthStrategy() {
  useSEO({
    title: PAGE_SEO['/global-wealth-strategy'].title,
    description: PAGE_SEO['/global-wealth-strategy'].description,
    canonicalPath: '/global-wealth-strategy',
  });

  return (
    <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink">
      <Navigation />

      {/* HERO */}
      <section className="border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-14 md:pt-20 pb-10 md:pb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-surface border border-brand-border rounded-full text-xs font-semibold text-brand-ink-2 uppercase tracking-wide mb-7">
            <span className="w-1.5 h-1.5 bg-brand-accent rounded-full" />
            Referral partner &middot; Nomad Capitalist
          </div>
          <h1 className="font-brand-serif font-medium text-4xl md:text-6xl leading-[1.05] tracking-tight text-brand-ink mb-6">
            Planning at a <span className="text-brand-ink-2">different scale</span>.
          </h1>
          <p className="text-lg leading-relaxed text-brand-muted max-w-2xl mx-auto">
            For Business Owners and Investors whose relocation is really about tax residency,
            asset protection, and a second citizenship, our Partner Nomad Capitalist has been
            serving over 1,500 clients across 100+ countries since 2012.
          </p>
        </div>
      </section>

      {/* IS THIS YOU */}
      <section className="border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-10 md:pt-14 pb-16 md:pb-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-4">Who this is for</div>
            <h2 className="font-brand-serif font-medium text-3xl md:text-4xl leading-tight tracking-tight text-brand-ink">
              A quick gut-check before you click through.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-7 bg-brand-surface border border-brand-border rounded-xl">
              <h3 className="font-brand-serif text-lg font-medium text-brand-ink mb-4">This is a fit if you&hellip;</h3>
              <ul className="space-y-3">
                {qualifies.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-brand-ink">
                    <CheckCircle2 className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-7 bg-brand-surface border border-brand-border rounded-xl">
              <h3 className="font-brand-serif text-lg font-medium text-brand-ink mb-4">Probably not yet, if you&hellip;</h3>
              <ul className="space-y-3">
                {notAFit.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-brand-muted">
                    <XCircle className="w-4 h-4 text-brand-muted mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT THEY HELP WITH */}
      <section className="bg-brand-surface border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-4">Holistic international structuring</div>
            <h2 className="font-brand-serif font-medium text-3xl md:text-4xl leading-tight tracking-tight text-brand-ink">
              A Tailored Implementation Plan
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {capabilities.map(({ Icon, title, desc }) => (
              <div key={title} className="p-7 bg-brand-bg border border-brand-border rounded-xl">
                <div className="w-11 h-11 bg-brand-surface border border-brand-border rounded-xl flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-brand-accent" />
                </div>
                <h3 className="font-brand-serif text-xl font-medium text-brand-ink mb-2">{title}</h3>
                <p className="text-sm leading-relaxed text-brand-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DISCLOSURE */}
      <section className="bg-brand-surface">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-14 md:py-16 text-center">
          <p className="text-sm leading-relaxed text-brand-muted mb-3">
            Nomad Capitalist is an independent advisory firm and a paid referral partner of
            Emigration Pro -- we may earn a referral fee if you engage their services. Neither
            Emigration Pro nor Nomad Capitalist is a licensed legal, financial, or tax advisor;
            nothing on this page is legal, financial, or tax advice.
          </p>
          <a
            href={PARTNER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-brand-ink-2 hover:text-brand-accent transition-colors"
          >
            Visit Nomad Capitalist
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
