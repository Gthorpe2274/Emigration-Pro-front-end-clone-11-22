import { ArrowRight, CheckCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/react-app/components/Footer';
import Navigation from '@/react-app/components/Navigation';
import { useSEO } from '@/react-app/hooks/useSEO';
import { PAGE_SEO, SITE_ORIGIN } from '@/shared/page-seo';

type GuideSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type GuideFaq = { question: string; answer: string };

type GuideSource = { label: string; href: string };

type GuideData = {
  path: string;
  eyebrow: string;
  intro: string;
  sections: GuideSection[];
  faqs: GuideFaq[];
  sources: GuideSource[];
  related: { to: string; label: string; description: string }[];
};

const LAST_REVIEWED = 'October 14, 2026';

const GUIDE_DATA: Record<string, GuideData> = {
  '/best-countries-for-americans-to-move-to': {
    path: '/best-countries-for-americans-to-move-to',
    eyebrow: 'Country comparison guide',
    intro:
      'The best country depends on your visa options, budget, work, family, healthcare needs and preferred way of life. Use this guide to build a realistic shortlist before comparing individual cities.',
    sections: [
      {
        title: 'Best countries for expats by priority',
        paragraphs: [
          'A universal ranking can hide the tradeoffs that determine whether a move works. A retiree using savings, a family with school-age children and a remote worker may need three different shortlists.',
          'Start with legal residence and financial fit. Then compare healthcare access, housing, safety, language, climate, infrastructure, schools, tax exposure and the distance from your support network.',
        ],
        bullets: [
          'Portugal and Spain: compare for European access, healthcare, climate and city choice.',
          'Mexico and Costa Rica: compare for proximity to the United States, established expat communities and varied city costs.',
          'Germany: compare for professional opportunities, infrastructure and central European access.',
          'Canada: compare for proximity, familiar institutions and clearly documented immigration programs.',
          'Thailand: compare for city choice, private healthcare access and regional travel.',
          'Georgia and Albania: compare when a longer initial stay and lower day-to-day costs are important.',
        ],
      },
      {
        title: 'Build a shortlist that fits your circumstances',
        paragraphs: [
          'Eliminate destinations where you do not have a plausible legal pathway. Visitor entry is not the same as permission to reside or work, and a popular expat destination is not automatically suitable for your income source.',
          'For each remaining country, compare at least two cities. National averages can obscure large differences in rent, healthcare access, schools, transportation and climate.',
        ],
        bullets: [
          'Confirm residence and work rules with the responsible national authority.',
          'Create a city-level budget with housing, insurance, transportation and return travel.',
          'Check healthcare access for prescriptions, ongoing treatment and emergencies.',
          'Review U.S. federal and state obligations before changing residence.',
        ],
      },
      {
        title: 'Turn the comparison into a relocation plan',
        paragraphs: [
          'Emigration Pro uses your budget, profession, age, family situation and priorities to narrow the field. The free assessment is a starting point; the personalized report then researches one destination city across fourteen practical categories.',
          'Treat every shortlist as provisional. Immigration rules, safety conditions, taxes and costs change, so verify official sources again before applying, booking or moving.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is the best place to move out of the United States?',
        answer:
          'There is no single best destination. The strongest choice is the country and city where you have a lawful path to stay, a sustainable budget, suitable healthcare and a realistic plan for work, family and taxes.',
      },
      {
        question: 'Are the best countries for expats also the easiest countries to move to?',
        answer:
          'Not necessarily. Quality-of-life rankings and visitor-entry rules do not establish residency or work eligibility. Compare the legal pathway separately from lifestyle appeal.',
      },
    ],
    sources: [
      { label: 'U.S. Department of State travel advisories', href: 'https://travel.state.gov/en/international-travel/travel-advisories.html' },
      { label: 'IRS guidance for U.S. citizens abroad', href: 'https://www.irs.gov/individuals/international-taxpayers/us-citizens-and-resident-aliens-abroad' },
    ],
    related: [
      { to: '/assessment', label: 'Take the free assessment', description: 'Match destinations to your budget and priorities.' },
      { to: '/best-countries', label: 'See low-cost quick-entry options', description: 'Compare six destinations for a simpler first arrival.' },
      { to: '/moving-to-europe-from-usa', label: 'Compare European destinations', description: 'Start a Europe-specific shortlist.' },
    ],
  },
  '/how-to-move-out-of-the-united-states': {
    path: '/how-to-move-out-of-the-united-states',
    eyebrow: 'Step-by-step relocation guide',
    intro:
      'Moving abroad is a sequence of legal, financial and practical decisions. This guide organizes the work from choosing a destination through departure and arrival.',
    sections: [
      {
        title: '1. Choose a viable destination and legal pathway',
        paragraphs: [
          'Start with the purpose of the move: employment, remote work, retirement, study, investment or family connection. That purpose determines which residence routes deserve attention.',
          'Shortlist countries only after checking whether your income, savings, profession and family circumstances fit a current pathway. Do not plan a permanent move around tourist admission alone.',
        ],
      },
      {
        title: '2. Build the complete relocation budget',
        paragraphs: [
          'Model the first year, not only monthly rent. Include applications, document authentication, travel, deposits, insurance, shipping, temporary housing, local transportation and a reserve for delays.',
          'Compare individual cities because housing, healthcare and transportation costs can vary more within a country than national averages suggest.',
        ],
      },
      {
        title: '3. Resolve U.S. obligations before departure',
        paragraphs: [
          'U.S. citizens generally remain subject to federal tax filing rules while abroad. State residency, banking, voting, Social Security, Medicare and insurance each require separate review.',
          'Keep a departure file containing passport records, visas, tax documents, account information, prescriptions, school records, medical summaries and proof of the dates and ties relevant to your move.',
        ],
        bullets: [
          'Confirm passport validity and destination entry requirements.',
          'Get individualized tax advice for federal and state residency questions.',
          'Arrange healthcare coverage and prescription continuity.',
          'Update banks, insurers, mail, voting and emergency contacts.',
          'Create a dated application, departure and arrival checklist.',
        ],
      },
      {
        title: '4. Plan the first ninety days after arrival',
        paragraphs: [
          'Map the tasks that must occur after entry: residence registration, tax numbers, local banking, housing, utilities, school enrollment, healthcare registration and any work authorization steps.',
          'Book a reconnaissance trip when possible. A city that looks suitable on paper may not fit your transportation needs, climate tolerance or daily routine.',
        ],
      },
    ],
    faqs: [
      { question: 'Do I have to give up U.S. citizenship to move abroad?', answer: 'No. Living abroad and renouncing citizenship are separate matters. Most Americans living overseas retain U.S. citizenship and continue to address applicable U.S. obligations.' },
      { question: 'Can I move abroad using tourist entry?', answer: 'Tourist or visa-free entry may allow a visit, but it does not automatically authorize residence or employment. Confirm the appropriate route before relying on it for a move.' },
    ],
    sources: [
      { label: 'U.S. Department of State international travel', href: 'https://travel.state.gov/en/international-travel.html' },
      { label: 'IRS guidance for U.S. citizens abroad', href: 'https://www.irs.gov/individuals/international-taxpayers/us-citizens-and-resident-aliens-abroad' },
      { label: 'Social Security international programs', href: 'https://www.ssa.gov/international/' },
    ],
    related: [
      { to: '/assessment', label: 'Start with the country-match assessment', description: 'Identify destinations that fit your circumstances.' },
      { to: '/moving-abroad-glossary', label: 'Use the moving abroad glossary', description: 'Understand residency, visa, tax and healthcare terms.' },
      { to: '/sample-report', label: 'Preview a relocation report', description: 'See how one destination city is researched.' },
    ],
  },
  '/moving-to-europe-from-usa': {
    path: '/moving-to-europe-from-usa',
    eyebrow: 'Europe relocation hub',
    intro:
      'Moving to Europe from the USA starts with matching your circumstances to a national residence route. Europe is not one immigration system, and each country sets its own long-stay requirements.',
    sections: [
      {
        title: 'Choose countries by pathway, not popularity',
        paragraphs: [
          'Begin with the countries where your employment, remote income, retirement resources, study plans, investment or family relationship may support a lawful stay. Then compare cities for cost, healthcare, transport, language and climate.',
          'Portugal and Spain often enter American shortlists for climate and city choice; Germany for professional opportunities and infrastructure; France and Italy for regional variety; and several smaller European countries for different cost and residency tradeoffs.',
        ],
      },
      {
        title: 'Compare the details that change the move',
        paragraphs: [
          'A residence permit does not automatically answer whether you may work locally, bring dependants, use public healthcare or owe local tax. Review each issue separately using the responsible national authority.',
        ],
        bullets: [
          'Minimum income, savings, employment or sponsorship requirements.',
          'Work rights for the main applicant and dependants.',
          'Health-insurance requirements before and after registration.',
          'Housing documentation and local registration steps.',
          'Tax residence, U.S. filing and treaty questions.',
          'Renewal, permanent residence and physical-presence rules.',
        ],
      },
      {
        title: 'Plan at the city level',
        paragraphs: [
          'Compare housing and transportation before choosing a city. A smaller city may reduce rent but require a car, while a larger city may provide stronger healthcare and employment access at a higher cost.',
          'Families should review school language, admissions calendars and tuition. Retirees and people with ongoing medical needs should identify suitable hospitals and specialists before committing to housing.',
        ],
      },
    ],
    faqs: [
      { question: 'Can a U.S. citizen move to Europe permanently?', answer: 'Potentially, but the route is country-specific. A U.S. passport permits certain short visits; permanent relocation requires a qualifying national visa or residence process.' },
      { question: 'Which European country is easiest for Americans to move to?', answer: 'Ease depends on the applicant. Income source, employment, savings, family ties and long-term goals determine which national routes are realistically available.' },
    ],
    sources: [
      { label: 'European Commission immigration portal', href: 'https://immigration-portal.ec.europa.eu/index_en' },
      { label: 'U.S. Department of State guidance for travelers in Europe', href: 'https://travel.state.gov/content/travel/en/international-travel/before-you-go/travelers-with-special-considerations/us-travelers-in-europe.html' },
    ],
    related: [
      { to: '/best-countries-for-americans-to-move-to', label: 'Compare the best-fit countries', description: 'Build a broader shortlist before narrowing to Europe.' },
      { to: '/assessment', label: 'Match countries to your priorities', description: 'Use your work, budget, family and healthcare needs.' },
      { to: '/how-to-move-out-of-the-united-states', label: 'Follow the departure checklist', description: 'Organize the U.S. side of the move.' },
    ],
  },
  '/digital-nomad-visa-countries': {
    path: '/digital-nomad-visa-countries',
    eyebrow: 'Remote-work visa guide',
    intro:
      'Digital nomad visa countries offer different combinations of income thresholds, stay length, dependant rules, work restrictions and tax consequences. Compare the complete program rather than the headline duration.',
    sections: [
      {
        title: 'What to compare before choosing a program',
        paragraphs: [
          'A remote-work residence route may require foreign employment, freelance contracts, business ownership or a documented income history. Some programs permit dependants, while others impose separate financial or insurance requirements.',
        ],
        bullets: [
          'Who qualifies and which kinds of foreign income count.',
          'Required income history, savings and supporting documents.',
          'Application location, processing sequence and government fees.',
          'Initial duration, renewal rules and physical-presence requirements.',
          'Dependant eligibility, schooling and healthcare access.',
          'Local work restrictions and potential tax residence.',
        ],
      },
      {
        title: 'Countries commonly compared by remote workers',
        paragraphs: [
          'Americans often compare programs in Portugal, Spain, Croatia, Greece, Estonia, Costa Rica and other destinations. Program names and rules change, so use this list to begin research—not as confirmation that a particular route is currently open or suitable.',
          'After establishing eligibility, compare individual cities for internet reliability, time-zone fit, housing, healthcare, transportation and access to a professional community.',
        ],
      },
      {
        title: 'Separate immigration permission from tax planning',
        paragraphs: [
          'Permission to live in a country does not settle where income is taxed or whether a business may operate there. U.S. citizens generally continue to address U.S. federal filing rules while abroad, and local tax residence can create additional obligations.',
          'Confirm immigration rules with the national authority and obtain individualized cross-border tax advice before relying on a program for a long-term move.',
        ],
      },
    ],
    faqs: [
      { question: 'Does a digital nomad visa allow local employment?', answer: 'Often it is designed for foreign-source remote work, but permissions differ by country. Do not assume it authorizes employment for a local company.' },
      { question: 'Will a digital nomad visa make me a tax resident?', answer: 'It may, depending on local law, time spent in the country and other facts. Immigration status and tax residence are related but separate analyses.' },
    ],
    sources: [
      { label: 'European Commission immigration portal', href: 'https://immigration-portal.ec.europa.eu/index_en' },
      { label: 'IRS guidance for U.S. citizens abroad', href: 'https://www.irs.gov/individuals/international-taxpayers/us-citizens-and-resident-aliens-abroad' },
    ],
    related: [
      { to: '/earn-abroad', label: 'Plan how to earn abroad', description: 'Compare income approaches and practical constraints.' },
      { to: '/moving-to-europe-from-usa', label: 'Explore moving to Europe', description: 'Compare national routes and city-level tradeoffs.' },
      { to: '/assessment', label: 'Find countries that fit', description: 'Match destinations to your work, budget and priorities.' },
    ],
  },
};

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
