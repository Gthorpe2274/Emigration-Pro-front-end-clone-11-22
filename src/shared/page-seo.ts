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
    href: '/best-countries',
    label: 'Compare the best countries for American expats',
    blurb: 'Portugal, Spain, Mexico, Costa Rica, Germany and Canada, side by side.',
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
];

export const PAGE_SEO: Record<string, PageSEO> = {
  '/': {
    title: 'Emigration Pro — Plan Your Move Abroad from the U.S.',
    standaloneTitle: true,
    description:
      'Plan your move abroad from the U.S. Take the free country-match assessment, then get a personalized report on visas, cost of living, healthcare and taxes.',
    heading: 'Plan your move abroad from the United States',
    summary: [
      'Emigration Pro helps U.S. citizens work out where they could realistically move and what it would actually take. A free structured assessment matches your budget, profession, age, family situation and healthcare needs against destination countries.',
      'From there, a personalized relocation report covers the specifics for a chosen city: which visa routes you qualify for, what living there costs month to month, how healthcare access works, what housing looks like, and the tax considerations of leaving the U.S.',
      'Emigration Pro is a research and planning service, not a law firm. It does not file applications or give legal advice, and visa rules should be confirmed against official government sources before acting.',
    ],
  },
  '/assessment': {
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
    title: 'Best Countries for American Expats',
    description:
      'Portugal, Spain, Mexico, Costa Rica, Germany and Canada compared for Americans moving abroad — residency routes, cost of living, healthcare and safety.',
    heading: 'Best countries for American expats',
    summary: [
      'A side-by-side comparison of the destinations Americans most often choose: Portugal, Spain, Mexico, Costa Rica, Germany and Canada.',
      'Each is assessed on its residency and immigration pathways, cost of living relative to the U.S., healthcare quality, safety, common languages, climate and the cities where expat communities are already established.',
    ],
  },
  '/sample-report': {
    title: 'Sample Relocation Report — Rio de Janeiro',
    description:
      'A partial sample of the Emigration Pro relocation report, covering healthcare, cost of living and political stability for Rio de Janeiro, Brazil.',
    heading: 'Sample relocation report: Rio de Janeiro, Brazil',
    summary: [
      'A partial sample of the personalized relocation report, built for a 78-year-old professional relocating to Rio de Janeiro.',
      'It shows the report structure: steps to leave the U.S., job market analysis, a master relocation timeline, healthcare mapping down to named hospitals by neighborhood, cost of living, political stability and security, and environmental and water quality.',
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
  '/blog': {
    title: 'Relocation Guides & Visa News for American Expats',
    description:
      'Guides on visa requirements, cost of living, healthcare and the practical logistics of moving abroad, written for U.S. citizens planning a relocation.',
    heading: 'Relocation guides and visa news for American expats',
    summary: [
      'Guides on visa requirements, cost of living, healthcare systems and the practical logistics of moving abroad, written for U.S. citizens planning a relocation.',
    ],
  },
  '/about': {
    title: 'About Emigration Pro',
    description:
      'Who runs Emigration Pro, how the relocation research is produced, and what the service does and does not do.',
    heading: 'About Emigration Pro',
    summary: [
      'Emigration Pro produces relocation research for U.S. citizens considering a move abroad, combining structured country matching with personalized, city-level reporting.',
      'It is a research and planning service. It does not file visa applications, and it does not provide legal or immigration advice.',
    ],
  },
};

/** Full title including the site-name suffix, matching what useSEO renders. */
export function fullTitle(seo: PageSEO): string {
  return seo.standaloneTitle ? seo.title : `${seo.title} | Emigration Pro`;
}
