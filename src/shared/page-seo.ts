/**
 * Single source of truth for public page metadata.
 *
 * Two very different consumers read this:
 *  - the React pages, via useSEO, for browsers and JS-executing crawlers;
 *  - netlify/edge-functions/page-seo.ts, which injects the same copy into the served
 *    HTML for crawlers that never run JavaScript (most AI/answer-engine bots).
 *
 * Keeping both on one map is the point: when the two drifted apart previously, the
 * version crawlers actually saw was the stale one. Plain data only — no imports, no
 * path aliases — so the Deno edge bundler can pull it in unchanged.
 */

export const SITE_ORIGIN = 'https://emigrationpro.com';

export interface PageSEO {
  /** Page title, without the site-name suffix. */
  title: string;
  /** Meta description. Aim for 150-160 characters. */
  description: string;
  /** H1 used in the crawlable no-JS fallback. */
  heading: string;
  /** Prose the fallback exposes, so a bot has something real to read and cite. */
  summary: string[];
  /** Internal links rendered into the fallback, keeping the link graph crawlable. */
  links?: { href: string; label: string }[];
  /** Set when the title is already complete and should not get " | Emigration Pro". */
  standaloneTitle?: boolean;
  /** Site-relative OpenGraph/Twitter card used by both React and the edge renderer. */
  image?: string;
  imageAlt?: string;
}

/**
 * Links worth pushing authority toward. Blog posts and page fallbacks both point here,
 * so editorial traffic actually reaches the pages that convert instead of dead-ending
 * on /blog.
 */
export const KEY_PAGES: { href: string; label: string; blurb: string }[] = [
  {
    href: '/assessment',
    label: 'Take the free country-match assessment',
    blurb: 'See which countries fit your budget, profession and family situation.',
  },
  {
    href: '/best-countries-for-americans-to-move-to',
    label: 'Compare the best countries for Americans to move to',
    blurb: 'Build a realistic shortlist around residency, budget, healthcare, work and family needs.',
  },
  {
    href: '/best-countries',
    label: 'Leave now: compare low-cost countries with quick entry',
    blurb: 'Six practical destinations with simple initial entry for U.S. passport holders.',
  },
  {
    href: '/sample-report',
    label: 'See a sample relocation report',
    blurb: 'A real excerpt showing the depth of the personalized research.',
  },
  {
    href: '/earn-abroad',
    label: 'Learn how to earn abroad',
    blurb: 'Building self-employed income while living overseas.',
  },
  {
    href: '/moving-abroad-glossary',
    label: 'Use the moving abroad glossary',
    blurb: 'Plain-English definitions for visas, residency, taxes, documents and healthcare.',
  },
];

export const PAGE_SEO: Record<string, PageSEO> = {
  '/': {
    title: 'Moving Abroad from the U.S. | Emigration Pro',
    standaloneTitle: true,
    image: '/og/home.jpg',
    imageAlt: 'A serious plan for leaving the U.S. — Emigration Pro',
    description:
      'Moving abroad from the U.S.? Compare destinations with a free country-match assessment and get a personalized plan covering visas, costs and healthcare.',
    heading: 'Moving abroad from the U.S.? Find the country and city that fit you',
    summary: [
      'Emigration Pro helps U.S. citizens work out where they could realistically move and what it would actually take. A free structured assessment matches your budget, profession, age, family situation and healthcare needs against destination countries.',
      'The personalized relocation report researches one destination city across 14 categories: U.S. departure and visa steps, employment, relocation timeline, healthcare, cost of living, political stability and security, environmental and water quality, digital connectivity, infrastructure and power, mobility, culture, recreation, retirement benefits, and children\'s education.',
      'Emigration Pro is a research and planning service, not a law firm. It does not file applications or give legal advice, and visa rules should be confirmed against official government sources before acting.',
    ],
  },
  '/assessment': {
    image: '/og/assessment.jpg',
    imageAlt: 'Find countries that fit your life — Emigration Pro country-match assessment',
    title: 'Free Country-Match Assessment',
    description:
      'Answer a structured questionnaire about your budget, profession, family and priorities to see which countries realistically fit your move abroad from the U.S.',
    heading: 'Free country-match assessment for Americans moving abroad',
    summary: [
      'The assessment asks about your age, profession, monthly budget, children and their schooling needs, preferred climate and setting, and how much you weight immigration policy, healthcare, safety and internet quality.',
      'It returns destination countries that fit those constraints, rather than a generic ranking. The assessment is free and is the starting point for the personalized relocation report.',
    ],
  },
  '/best-countries': {
    title: 'Low-Cost Countries Americans Can Enter Quickly',
    description:
      'Compare 6 affordable countries U.S. citizens can enter without a lengthy advance visa: entry windows, budget fit, limits and official sources.',
    heading: 'Low-cost countries Americans can enter quickly',
    summary: [
      'A practical comparison of Albania, Georgia, Mexico, Colombia, Ecuador and Thailand for U.S. citizens seeking a lower-cost destination and a simple first arrival.',
      'The page distinguishes visa-free visitor admission from legal residency and work authorization, shows the ordinary initial entry window, explains important limits and links every country to current U.S. State Department guidance.',
      'Entry rules were reviewed September 7, 2026. Immigration rules can change and admission is never guaranteed, so travelers should verify the official source immediately before booking or moving.',
    ],
    links: [
      { href: '/assessment', label: 'Match countries to your budget and priorities' },
      { href: '/moving-abroad-glossary', label: 'Understand visa and residency terms' },
    ],
  },
  '/best-countries-for-americans-to-move-to': {
    title: 'Best Countries for Americans to Move To in 2026',
    description:
      'Compare the best countries for Americans to move to by residency options, budget, healthcare, safety, work, family needs and expat lifestyle.',
    heading: 'Best countries for Americans to move to',
    summary: [
      'The best destination depends on lawful residence options, budget, work, family, healthcare and preferred lifestyle. This guide helps Americans build a practical shortlist before comparing individual cities.',
      'It compares the questions that matter across popular expat destinations: residence and work rights, housing, healthcare, safety, infrastructure, schools, taxes and distance from the United States.',
      'Country rankings are a starting point, not immigration advice. Requirements and conditions change, so readers should confirm official sources before applying, booking or moving.',
    ],
    links: [
      { href: '/assessment', label: 'Match countries to your circumstances' },
      { href: '/best-countries', label: 'Compare low-cost quick-entry destinations' },
      { href: '/moving-to-europe-from-usa', label: 'Explore moving to Europe from the USA' },
    ],
  },
  '/how-to-move-out-of-the-united-states': {
    title: 'How to Move Out of the United States: Step-by-Step Guide',
    description:
      'Learn how to move out of the United States: choose a country, identify a visa, budget, prepare documents and address U.S. tax and departure tasks.',
    heading: 'How to move out of the United States',
    summary: [
      'A step-by-step guide to organizing an international move, from choosing a viable destination and legal pathway through budgeting, documents, U.S. obligations and arrival tasks.',
      'The guide explains why visitor entry is different from residence or work permission and why Americans should review federal tax filing, state residency, healthcare, banking, voting and Social Security separately.',
    ],
    links: [
      { href: '/assessment', label: 'Start with the country-match assessment' },
      { href: '/moving-abroad-glossary', label: 'Understand moving-abroad terminology' },
      { href: '/sample-report', label: 'Preview a city-level relocation report' },
    ],
  },
  '/moving-to-europe-from-usa': {
    title: 'Moving to Europe from USA: Countries, Visas and Costs',
    description:
      'Plan a move to Europe from the USA by comparing national residence routes, work rights, healthcare, costs, taxes and practical city-level tradeoffs.',
    heading: 'Moving to Europe from USA: countries, visas and costs',
    summary: [
      'Moving to Europe requires a country-specific residence plan. Each country sets its own requirements for employment, remote work, retirement, study, investment and family-based stays.',
      'This guide shows Americans how to compare eligibility, work rights, dependants, healthcare, housing, tax residence and renewal rules before narrowing the decision to individual cities.',
    ],
    links: [
      { href: '/best-countries-for-americans-to-move-to', label: 'Compare a broader country shortlist' },
      { href: '/assessment', label: 'Match European destinations to your priorities' },
      { href: '/how-to-move-out-of-the-united-states', label: 'Organize the U.S. departure steps' },
    ],
  },
  '/digital-nomad-visa-countries': {
    title: 'Digital Nomad Visa Countries for Americans in 2026',
    description:
      'Compare digital nomad visa countries by eligibility, income evidence, duration, dependants, work limits, healthcare and possible tax residence.',
    heading: 'Digital nomad visa countries for Americans',
    summary: [
      'A practical framework for comparing remote-work residence programs by eligibility, income evidence, duration, dependants, insurance, work restrictions and potential tax residence.',
      'Program rules change. Readers should confirm every requirement with the responsible national authority and obtain individualized cross-border tax advice before relying on a program.',
    ],
    links: [
      { href: '/earn-abroad', label: 'Plan how to earn abroad' },
      { href: '/moving-to-europe-from-usa', label: 'Explore European residence options' },
      { href: '/assessment', label: 'Find countries that fit your work and budget' },
    ],
  },
  '/sample-report': {
    image: '/og/sample-report.jpg',
    imageAlt: 'Sample relocation report for Bangkok — Emigration Pro',
    title: 'Sample Relocation Report — Bangkok, Thailand',
    description:
      'Explore a 14-section Emigration Pro relocation report for Bangkok covering visas, employment, healthcare, costs, safety, infrastructure and education.',
    heading: 'Sample relocation report: Bangkok, Thailand',
    summary: [
      'This watermarked Bangkok sample shows the research depth, source links and recommendations included in an Emigration Pro personalized relocation report.',
      'The report covers 14 categories: steps to leave America, job market analysis, a master relocation timeline, comprehensive healthcare mapping, cost of living, political stability and security, environmental and water quality, digital connectivity and internet, infrastructure and power reliability, mobility and urban connectivity, culture and entertainment, sports and recreation, senior and retirement benefits, and children\'s education.',
    ],
  },
  '/global-wealth-strategy': {
    title: 'Global Wealth Strategy for High-Net-Worth Relocation',
    description:
      'For entrepreneurs and investors relocating for tax residency, asset protection, or a second citizenship -- our referral partner Nomad Capitalist builds the holistic plan.',
    heading: 'Global wealth strategy',
    summary: [
      'For US $500K+ income / $1M+ net worth entrepreneurs and investors, relocation is often really about tax residency, asset protection, and second citizenship -- a different scope than a single visa filing.',
      'Nomad Capitalist is Emigration Pro\'s referral partner for this scope: a boutique advisory serving 1,500+ clients across 100+ countries since 2012 on international tax strategy, residency and citizenship planning, offshore banking, and corporate structuring.',
    ],
  },
  '/earn-abroad': {
    title: 'Earn Abroad: Self-Employment for Expats',
    description:
      'How Americans living overseas build sustainable self-employed income — remote work, online businesses and the practical constraints of earning from abroad.',
    heading: 'Earning a living abroad',
    summary: [
      'How Americans living overseas build sustainable, self-employed income, and the practical constraints that come with earning from another country.',
      'Covers remote work, online business models, and how income source interacts with the visa you hold — many residency routes restrict local employment while permitting foreign-earned income.',
    ],
  },
  '/living-wage-business': {
    title: 'Building a Living Wage Online Business',
    description:
      'Online business models that can realistically cover living costs abroad, and what it takes to get one to a living wage while relocating.',
    heading: 'Building a living wage online business',
    summary: [
      'Online business models that can realistically cover living costs abroad, and a realistic view of what it takes to get one to a living wage.',
      'Aimed at people who need income to travel with them, rather than a side project — including how much runway to expect before the income is dependable.',
    ],
  },
  '/multiple-options': {
    title: 'Multiple Options — Living Wage Online Business',
    description:
      'Explore various online business models and hybrid approaches to income while relocating abroad.',
    heading: 'Multiple Options',
    summary: [
      'Curated video resources on combining or hybridizing online business models rather than committing to a single income path.',
      'Part of the Living Wage Online Business guide, covering one of several income-producing business models for people relocating abroad.',
    ],
  },
  '/youtuber': {
    title: 'Youtuber — Living Wage Online Business',
    description:
      'Build an audience and monetize through ads and sponsorships as an online income model while relocating abroad.',
    heading: 'Youtuber',
    summary: [
      'Curated video resources on building an audience and monetizing through ads and sponsorships.',
      'Part of the Living Wage Online Business guide, covering one of several income-producing business models for people relocating abroad.',
    ],
  },
  '/affiliate': {
    title: 'Affiliate — Living Wage Online Business',
    description:
      'Earn commissions by promoting products you trust as an online income model while relocating abroad.',
    heading: 'Affiliate',
    summary: [
      'Curated video resources on earning commissions by promoting products you trust.',
      'Part of the Living Wage Online Business guide, covering one of several income-producing business models for people relocating abroad.',
    ],
  },
  '/agency': {
    title: 'Agency — Living Wage Online Business',
    description:
      'Offer scalable, specialized services to clients worldwide as an online income model while relocating abroad.',
    heading: 'Agency',
    summary: [
      'Curated video resources on offering scalable, specialized services to clients worldwide.',
      'Part of the Living Wage Online Business guide, covering one of several income-producing business models for people relocating abroad.',
    ],
  },
  '/digital-sales': {
    title: 'Digital Sales — Living Wage Online Business',
    description:
      'Create and sell digital products, courses, and software. Curated videos on building and scaling an Amazon KDP and digital product business.',
    heading: 'Digital Sales',
    summary: [
      'Curated video resources on creating and selling digital products, courses, and software — including Amazon KDP publishing and marketing strategy.',
      'Part of the Living Wage Online Business guide, covering one of several income-producing business models for people relocating abroad.',
    ],
  },
  '/blog': {
    title: 'Relocation Guides for Americans Moving Abroad',
    description:
      'Guides on visa requirements, cost of living, healthcare and the practical logistics of moving abroad, written for U.S. citizens planning a relocation.',
    heading: 'Relocation guides for Americans moving abroad',
    summary: [
      'Guides on visa requirements, cost of living, healthcare systems and the practical logistics of moving abroad, written for U.S. citizens planning a relocation.',
    ],
  },
  '/about': {
    image: '/og/about.jpg',
    imageAlt: 'About Emigration Pro and its relocation research methodology',
    title: 'About Emigration Pro',
    description:
      'Who runs Emigration Pro, how the relocation research is produced, and what the service does and does not do.',
    heading: 'About Emigration Pro',
    summary: [
      'Emigration Pro was founded by G. Lynn Thorpe, Esq., a Columbia University School of Law graduate, international attorney, longtime International Living member and extensive international traveler.',
      'The service produces city-level relocation research for U.S. citizens. Reports prioritize relevant national, regional and local government sources for immigration, tax, healthcare, public-safety and other decision-critical information.',
      'Emigration Pro is a research and planning service. It does not file visa applications, and it does not provide legal or immigration advice.',
    ],
  },
  '/moving-abroad-glossary': {
    image: '/og/glossary.jpg',
    imageAlt: 'Moving Abroad Glossary — Emigration Pro',
    title: 'Moving Abroad Glossary for Americans',
    description:
      'Understand 25 essential moving-abroad terms covering visas, residency, documents, U.S. taxes, healthcare and international relocation.',
    heading: 'Moving abroad glossary for Americans',
    summary: [
      'Plain-English definitions of the visa, residency, document, U.S. tax, healthcare and arrival terminology Americans encounter when planning an international move.',
      'Each entry explains why the term matters, provides a practical relocation example and links to an authoritative public source where a suitable source is available.',
      'Definitions are general educational information. Requirements vary by country and change over time, so applicants should confirm current rules with the responsible government authority.',
    ],
  },
};

/** Full title including the site-name suffix, matching what useSEO renders. */
export function fullTitle(seo: PageSEO): string {
  return seo.standaloneTitle ? seo.title : `${seo.title} | Emigration Pro`;
}
