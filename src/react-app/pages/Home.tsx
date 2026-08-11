import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, FileText, MapPin, Network, Route, Star } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';
import Footer from '@/react-app/components/Footer';
import EmailCaptureModal from '@/react-app/components/EmailCaptureModal';
import { useSEO } from '@/react-app/hooks/useSEO';
import { PAGE_SEO } from '@/shared/page-seo';

const destinations = [
  { name: 'Portugal', flag: '🇵🇹', tier: 'Tier 1', visa: 'D7 · Golden Visa', desc: 'Robust healthcare, English-friendly cities, and an established expat community in Porto and Lisbon.', cost: '62' },
  { name: 'Spain', flag: '🇪🇸', tier: 'Tier 1', visa: 'Non-lucrative visa', desc: 'Warm climate, universal healthcare, and a lower cost of living outside Madrid and Barcelona.', cost: '68' },
  { name: 'Mexico', flag: '🇲🇽', tier: 'Tier 2', visa: 'Temporary resident', desc: 'Close to the US, a favorable tax treaty, and thriving expat hubs in CDMX, Mérida, and Oaxaca.', cost: '48' },
  { name: 'Costa Rica', flag: '🇨🇷', tier: 'Tier 2', visa: 'Rentista · Pensionado', desc: 'Stable democracy, universal healthcare (Caja), and a mature retirement infrastructure.', cost: '58' },
];

const reportSections = [
  { n: '01', title: 'Steps to Take to Leave America', desc: 'Residency pathways, customs requirements, and practical departure steps.' },
  { n: '02', title: 'Job Market Analysis', desc: 'Local demand, salary benchmarks, opportunities, and professional risks.' },
  { n: '03', title: 'Master Relocation Timeline & Guide', desc: 'A chronological roadmap from preparation through arrival and integration.' },
  { n: '04', title: 'Comprehensive Healthcare Mapping', desc: 'Hospitals, healthcare systems, insurance, prescriptions, and emergency access.' },
  { n: '05', title: 'Cost of Living', desc: 'A detailed relocation budget with realistic, destination-specific costs.' },
  { n: '06', title: 'Political Stability & Security', desc: 'Political conditions, local governance, crime, safety, and emergency support.' },
  { n: '07', title: 'Environmental & Water Quality', desc: 'Water safety, air quality, natural hazards, waste systems, and green space.' },
  { n: '08', title: 'Digital Connectivity & Internet', desc: 'Internet speeds, mobile coverage, provider reliability, and remote-work access.' },
  { n: '09', title: 'Infrastructure & Power Reliability', desc: 'Power, roads, sanitation, utilities, and future infrastructure projects.' },
  { n: '10', title: 'Mobility & Urban Connectivity', desc: 'Public transportation, vehicle ownership, walkability, and commute options.' },
  { n: '11', title: 'Culture, Arts & Entertainment', desc: 'Festivals, dining, nightlife, theaters, galleries, and cultural experiences.' },
  { n: '12', title: 'Sports & Active Recreation', desc: 'Professional sports, fitness facilities, and outdoor recreation options.' },
  { n: '13', title: 'Senior & Retirement Benefits', desc: 'Tax considerations, discounts, healthcare subsidies, and senior programs.' },
  { n: '14', title: 'Children’s Education & Schooling', desc: 'Schools, curricula, tuition, admissions, support services, and university pathways.' },
];

const relocationHubAssets = [
  'Immigration-law and visa-service resources',
  'Residence and citizenship-planning providers',
  'International banking and money-transfer resources',
  'International health-insurance options',
  'Moving, shipping, settling-in, and customs resources',
  'U.S.-based consulate and visa-application locations',
  'Destination-focused relocation videos',
  'Cost-of-living and neighborhood video resources',
  'Healthcare, immigration, and cultural-orientation videos',
  'Facebook, Reddit, and Discord expat communities',
  'Getting-started and reconnaissance-trip guidance',
  'Two years of Hub access with quarterly updates',
];

const testimonials = [
  {
    initials: 'SR',
    name: 'Sarah Rodriguez',
    role: 'Retired teacher · moved to Portugal',
    quote: 'The Portugal assessment was incredibly detailed and accurate. The report helped us understand exactly what we needed for the Golden Visa program. We’re now happily living in Lisbon!',
  },
  {
    initials: 'MC',
    name: 'Michael Chen',
    role: 'Software developer · relocated to Costa Rica',
    quote: 'As a remote software developer, the assessment perfectly matched my priorities. The cost analysis for Costa Rica was spot-on and saved me months of research. Highly recommend!',
  },
  {
    initials: 'DT',
    name: 'David Thompson',
    role: 'Entrepreneur · moved to Mexico',
    quote: 'The Mexico assessment revealed important healthcare considerations we hadn’t thought of. The timeline and checklist made our move organized and stress-free. Worth every penny!',
  },
];

export default function Home() {
  useSEO({
    title: PAGE_SEO['/'].title,
    description: PAGE_SEO['/'].description,
    canonicalPath: '/',
    image: PAGE_SEO['/'].image,
    imageAlt: PAGE_SEO['/'].imageAlt,
    appendSiteName: !PAGE_SEO['/'].standaloneTitle,
    // Deliberately not FAQPage: Google requires FAQ markup to mirror Q&A text that is
    // actually visible on the page, and this page is not laid out as Q&A.
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': 'https://emigrationpro.com/#webpage',
      url: 'https://emigrationpro.com/',
      name: PAGE_SEO['/'].title,
      isPartOf: { '@id': 'https://emigrationpro.com/#website' },
      about: { '@id': 'https://emigrationpro.com/#organization' },
      inLanguage: 'en-US',
    },
  });

  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleEmailSubmit = () => {
    // Email is already stored by the modal component
    // Redirect will be handled by EmailCaptureModal after email is saved to CRM
    // Redirects to Stripe Checkout (buy.stripe.com)
  };

  return (
    <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink">
      <Navigation />
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
      />

      {/* HERO */}
      <section className="border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-surface border border-brand-border rounded-full text-xs font-semibold text-brand-ink-2 uppercase tracking-wide mb-7">
              <span className="w-1.5 h-1.5 bg-brand-accent rounded-full" />
              For U.S. citizens planning to relocate
            </div>
            <h1 className="font-brand-serif font-medium text-5xl md:text-6xl leading-[1.05] tracking-tight text-brand-ink mb-6">
              A serious plan for<br />
              <span className="italic text-brand-ink-2">leaving the U.S.</span>
            </h1>
            <p className="text-lg leading-relaxed text-brand-accent font-bold max-w-xl mb-10">
              Here you will find the best places for you to move to and support yourself when there.
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex flex-col gap-1.5 items-center">
                <Link
                  to="/assessment"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-brand-btn text-brand-btn-ink rounded-lg font-semibold text-base hover:bg-brand-ink-2 transition-colors w-full md:w-auto"
                >
                  Start free assessment
                  <span className="text-lg leading-none">&rarr;</span>
                </Link>
                <span className="text-[13px] text-brand-muted font-medium">Find the City that suits you best.</span>
              </div>
              <Link
                to="/sample-report"
                className="px-6 py-4 text-brand-ink border border-brand-border-strong rounded-lg font-semibold text-base bg-brand-bg hover:bg-brand-surface transition-colors"
              >
                See sample report
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-brand-muted">
              <span className="inline-flex items-center gap-1.5"><span className="text-brand-accent font-bold">&#10003;</span> No credit card</span>
              <span className="inline-flex items-center gap-1.5"><span className="text-brand-accent font-bold">&#10003;</span> 3 minutes</span>
              <span className="inline-flex items-center gap-1.5"><span className="text-brand-accent font-bold">&#10003;</span> Data-driven</span>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-brand-surface border border-brand-border">
              <img src="/images/hero-1.png" alt="How to leave the US" className="w-full h-full object-cover" style={{ filter: 'saturate(0.9)' }} />
            </div>
            <div className="hidden sm:block absolute -left-8 bottom-12 w-64 p-5 bg-brand-bg border border-brand-border rounded-lg shadow-xl">
              <div className="font-brand-serif text-3xl font-medium text-brand-ink leading-none">14</div>
              <div className="text-sm text-brand-muted mt-1.5 leading-snug">Comprehensive sections in every personalized report</div>
            </div>
            <div className="hidden sm:flex absolute -right-5 top-10 items-center gap-2.5 px-4 py-3.5 bg-brand-btn text-brand-btn-ink rounded-lg shadow-xl">
              <span className="w-2 h-2 bg-brand-accent-2 rounded-full" />
              <span className="text-sm font-medium">Current visa data</span>
            </div>
          </div>
        </div>
      </section>

      {/* TAGLINE SECTION */}
      <section className="bg-brand-surface border-b border-brand-border py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center flex flex-col items-center justify-center">
          <h2 className="font-brand-serif font-medium text-3xl md:text-4xl leading-tight tracking-tight text-brand-ink mb-2">
            From Multimillionaire to Working People find your suitable Country.
          </h2>
          <p className="text-3xl md:text-4xl text-brand-accent font-medium">
            Get the information you need about the country and city of your choice.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-brand-surface border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-end mb-14">
            <div>
              <div className="inline-block text-xs font-semibold text-brand-accent-ink bg-brand-accent-2 px-2.5 py-1 rounded uppercase tracking-wide mb-5">Process</div>
              <h2 className="font-brand-serif font-medium text-4xl leading-tight tracking-tight text-brand-ink">Three steps from<br />question to plan.</h2>
            </div>
            <p className="text-lg leading-relaxed text-brand-muted max-w-md">
              A short assessment gives you a compatibility read. A Relocation Hub gives you people
              and services on the ground. The full Report gives you the paperwork, costs, and dates.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 bg-brand-bg border border-brand-border rounded-xl">
              <div className="flex items-baseline justify-between mb-8">
                <span className="font-brand-serif text-4xl font-medium text-brand-ink leading-none">01</span>
                <span className="text-xs uppercase tracking-wide text-brand-muted font-semibold">Free</span>
              </div>
              <h3 className="font-brand-serif text-2xl font-medium text-brand-ink mb-1">Assessment</h3>
              <div className="text-[13px] text-brand-muted font-medium mb-3">Find the City that suits you best.</div>
              <p className="text-base leading-relaxed text-brand-muted">Answer questions about age, profession, family, and priorities. Get an instant compatibility analysis for your chosen destination.</p>
            </div>
            <div className="p-8 bg-brand-bg border border-brand-border rounded-xl">
              <div className="flex items-baseline justify-between mb-8">
                <span className="font-brand-serif text-4xl font-medium text-brand-ink leading-none">02</span>
                <span className="text-xs uppercase tracking-wide text-brand-muted font-semibold">Included</span>
              </div>
              <h3 className="font-brand-serif text-2xl font-medium text-brand-ink mb-3">Relocation Hub</h3>
              <p className="text-base leading-relaxed text-brand-muted">A personalized hub for your city: vetted service providers, expat interviews on video, and active online communities.</p>
            </div>
            <div className="p-8 bg-brand-ink border border-brand-ink rounded-xl text-white">
              <div className="flex items-baseline justify-between mb-8">
                <span className="font-brand-serif text-4xl font-medium text-brand-accent-2 leading-none">03</span>
              </div>
              <h3 className="font-brand-serif text-2xl font-medium text-white mb-3">Professional Report</h3>
              <p className="text-base leading-relaxed text-[#b8c8e2]">Fourteen detailed sections: immigration paperwork, hyper-local costs, healthcare mapping, and a step-by-step timeline.</p>
            </div>
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section id="destinations" className="border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <div className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-4">Popular destinations</div>
              <h2 className="font-brand-serif font-medium text-4xl leading-tight tracking-tight text-brand-ink max-w-xl">Where Americans are landing, and why.</h2>
            </div>
            <div className="flex flex-col gap-1.5 self-start shrink-0 items-center">
              <Link
                to="/assessment"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#15803d] px-[18px] py-2.5 rounded-lg hover:bg-[#166534] transition-colors w-full"
              >
                Get Your Free Assessment &rarr;
              </Link>
              <span className="text-xs text-brand-muted font-medium">Find the City that suits you best.</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {destinations.map((d) => (
              <div key={d.name} className="p-6 bg-brand-bg border border-brand-border rounded-xl flex flex-col gap-4 hover:border-brand-accent hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-3xl leading-none">{d.flag}</span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-accent bg-brand-surface px-2 py-1 rounded">{d.tier}</span>
                </div>
                <div>
                  <h4 className="font-brand-serif text-xl font-medium text-brand-ink mb-1">{d.name}</h4>
                  <div className="text-xs text-brand-muted uppercase tracking-wide font-semibold">{d.visa}</div>
                </div>
                <p className="text-sm leading-relaxed text-brand-muted">{d.desc}</p>
                <div className="flex items-center justify-between pt-4 mt-auto border-t border-dashed border-brand-border">
                  <span className="text-xs text-brand-muted">Cost index</span>
                  <span className="font-brand-serif text-lg font-medium text-brand-ink">{d.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REPORT CTA */}
      <section id="report" className="bg-brand-ink text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-14 items-center">
          <div>
            <div className="text-xs font-semibold text-brand-accent-2 uppercase tracking-wide mb-5">The professional report</div>
            <h2 className="font-brand-serif font-medium text-4xl md:text-5xl leading-tight tracking-tight text-white mb-6">
              Your complete relocation <span className="italic text-brand-accent-2">planning stack</span>.
            </h2>
            <p className="text-lg leading-relaxed text-[#b8c8e2] max-w-md mb-10">
              Personalized to you, your family, priorities, budget, destination, and selected city.
              Generated on demand, with no wait for a generic report to be prepared.
            </p>
            <div className="flex flex-wrap items-center gap-5 mb-6">
              <div className="flex items-baseline gap-3">
                <span className="font-brand-serif text-5xl font-medium text-white leading-none">
                  $69<span className="text-2xl">.99</span>
                </span>
                <span className="text-2xl font-medium text-[#94a6c4] relative inline-block line-through decoration-red-500">
                  $99.99
                </span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide px-2.5 py-1.5 bg-brand-accent-2 text-brand-accent-ink rounded">Limited Time Offer</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowEmailModal(true)}
                className="px-6 py-4 bg-brand-accent-2 text-brand-accent-ink rounded-lg font-semibold text-base hover:brightness-95 transition-all"
              >
                Get your report
              </button>
              <Link
                to="/sample-report"
                className="px-5 py-4 text-white border border-[#2b4879] rounded-lg font-semibold text-base hover:bg-white/5 transition-colors"
              >
                View sample
              </Link>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="bg-brand-surface rounded-xl p-7 text-brand-ink border border-brand-border">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-brand-border-strong">
                <div>
                  <div className="font-brand-serif text-xl font-medium">Porto, Portugal</div>
                  <div className="text-xs text-brand-muted mt-0.5">Personalized report · 68 pages</div>
                </div>
                <div className="text-xs font-bold uppercase tracking-wide text-brand-accent-ink bg-brand-accent-2 px-2 py-1 rounded">Sample</div>
              </div>
              {[
                { n: '01', title: 'Steps to Take to Leave America', pages: 8 },
                { n: '02', title: 'Job Market Analysis', pages: 6 },
                { n: '03', title: 'Master Relocation Timeline & Guide', pages: 4 },
                { n: '04', title: 'Comprehensive Healthcare Mapping', pages: 5 },
                { n: '05', title: 'Cost of Living', pages: 6 },
                { n: '06', title: 'Political Stability & Security', pages: 7 },
              ].map((row) => (
                <div key={row.n} className="flex items-center justify-between py-2.5 border-b border-brand-border last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="font-brand-serif text-xs font-medium text-brand-muted w-6">{row.n}</span>
                    <span className="text-sm text-brand-ink font-medium">{row.title}</span>
                  </div>
                  <span className="text-xs text-brand-muted">{row.pages} pp</span>
                </div>
              ))}
            </div>
            <div className="absolute -right-6 -top-6 px-4 py-3.5 bg-brand-bg text-brand-ink border border-brand-border rounded-lg shadow-xl text-sm font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-accent rounded-full" />
              Personalized &amp; ready on demand
            </div>
          </div>
        </div>
      </section>

      {/* PURCHASE STACK */}
      <section className="bg-brand-surface border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-4">Everything included with your purchase</div>
            <h2 className="font-brand-serif font-medium text-4xl md:text-5xl leading-tight tracking-tight text-brand-ink mb-5">
              More than a report. A complete plan for your move.
            </h2>
            <p className="text-lg leading-relaxed text-brand-muted">
              One purchase gives you personalized city-level research, fourteen detailed report sections,
              an action roadmap, and two years of destination resources in your Relocation Hub.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {[
              {
                icon: FileText,
                title: 'Personalized on demand',
                desc: 'Generated for your family, priorities, budget, destination, and city—without waiting for a generic report.',
              },
              {
                icon: MapPin,
                title: 'City-level intelligence',
                desc: 'Local costs, healthcare, schools, transport, connectivity, safety, culture, and daily-life details.',
              },
              {
                icon: Network,
                title: 'Relocation Hub',
                desc: 'Professional resources, destination videos, expat communities, and quarterly updates for two years.',
              },
              {
                icon: Route,
                title: 'Action roadmap',
                desc: 'Departure steps and a master relocation timeline that turns research into a practical sequence of actions.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="p-6 bg-brand-bg border border-brand-border rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-brand-ink text-brand-accent-2 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-brand-serif text-xl font-medium text-brand-ink mb-2">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-brand-muted">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="text-xs font-semibold text-brand-accent uppercase tracking-wide mb-3">Inside your personalized report</div>
              <h3 className="font-brand-serif font-medium text-3xl md:text-4xl text-brand-ink">Fourteen researched sections. No filler.</h3>
            </div>
            <p className="text-base leading-relaxed text-brand-muted max-w-md">
              Every dimension is researched for your selected destination city and organized around the decisions you need to make.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-brand-border border border-brand-border rounded-xl overflow-hidden">
            {reportSections.map((s) => (
              <div key={s.n} className="p-6 bg-brand-bg flex flex-col gap-3 min-h-[160px]">
                <div className="flex items-center justify-between">
                  <span className="font-brand-serif text-xs font-medium text-brand-accent tracking-wide">{s.n}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent-2" />
                </div>
                <h4 className="font-brand-serif text-lg font-medium text-brand-ink leading-tight">{s.title}</h4>
                <p className="text-sm leading-relaxed text-brand-muted">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-12 items-start">
            <div>
              <div className="text-xs font-semibold text-brand-accent uppercase tracking-wide mb-4">Your personalized Relocation Hub</div>
              <h3 className="font-brand-serif font-medium text-3xl md:text-4xl leading-tight text-brand-ink mb-5">
                The people, resources, and local knowledge behind your plan.
              </h3>
              <p className="text-base leading-relaxed text-brand-muted mb-6">
                Your Hub extends the report with practical connections curated around your selected country and city.
                Report purchasers receive two years of access with quarterly updates.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-accent-2 text-brand-accent-ink text-sm font-semibold">
                <Check className="w-4 h-4" aria-hidden="true" />
                Included with your report purchase
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 p-6 md:p-8 bg-brand-bg border border-brand-border rounded-xl">
              {relocationHubAssets.map((asset) => (
                <div key={asset} className="flex items-start gap-3 text-sm leading-relaxed text-brand-ink">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-brand-accent" aria-hidden="true" />
                  <span>{asset}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 p-7 md:p-10 bg-brand-ink text-white rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-7">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold text-brand-accent-2 uppercase tracking-wide mb-3">Your move, organized</div>
              <h3 className="font-brand-serif font-medium text-3xl text-white mb-3">From research to a clear action roadmap.</h3>
              <p className="text-base leading-relaxed text-[#b8c8e2]">
                Connect city-level findings to departure steps, a master relocation timeline, and the decisions you should confirm with qualified professionals.
              </p>
            </div>
            <button
              onClick={() => setShowEmailModal(true)}
              className="shrink-0 px-7 py-4 bg-brand-accent-2 text-brand-accent-ink rounded-lg font-semibold text-base hover:brightness-95 transition-all"
            >
              Get your personalized report
            </button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="max-w-xl mb-14">
            <div className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-4">Client stories</div>
            <h2 className="font-brand-serif font-medium text-4xl leading-tight tracking-tight text-brand-ink">
              From questions to <span className="italic">boarding pass</span>.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <figure key={t.name} className="p-8 bg-brand-bg border border-brand-border rounded-xl flex flex-col gap-6">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-brand-accent fill-current" />
                  ))}
                </div>
                <blockquote className="font-brand-serif text-lg leading-snug text-brand-ink font-normal tracking-tight m-0">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3 pt-5 border-t border-brand-border">
                  <div className="w-10 h-10 rounded-full bg-brand-ink text-brand-accent-2 flex items-center justify-center font-brand-serif font-medium text-sm">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-brand-ink">{t.name}</div>
                    <div className="text-xs text-brand-muted mt-0.5">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Footer Links - Below Footer */}
      <div className="text-center py-4 bg-brand-surface border-t border-brand-border">
        <a
          href="/admin/blog"
          className="text-[10px] text-brand-muted hover:text-brand-ink transition-colors font-medium"
        >
          Site Health
        </a>
        <span className="mx-2 text-[10px] text-brand-border-strong">•</span>
        <a
          href="/admin/crm"
          className="text-[10px] text-brand-muted hover:text-brand-ink transition-colors font-medium"
        >
          Server
        </a>
      </div>
    </div>
  );
}
