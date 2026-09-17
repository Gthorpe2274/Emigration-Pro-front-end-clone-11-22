export const CLARITY_PROJECT_ID = 'yif8w21arg';

export type ClarityContentGroup =
  | 'core'
  | 'leave-now'
  | 'relocation'
  | 'resources'
  | 'earn-abroad'
  | 'legal';

export type TrackedClarityPage = {
  path: string;
  pageId: string;
  label: string;
  group: ClarityContentGroup;
  match?: 'exact' | 'prefix';
};

// This is intentionally an allowlist. Pages containing customer, payment,
// administrative, or uploaded-file data must never be added implicitly.
export const TRACKED_CLARITY_PAGES: TrackedClarityPage[] = [
  { path: '/', pageId: 'home', label: 'Home', group: 'core' },
  { path: '/assessment', pageId: 'assessment', label: 'Assessment', group: 'core' },
  { path: '/best-countries', pageId: 'leave-now', label: 'Leave Now', group: 'leave-now' },
  { path: '/city/', pageId: 'city-details', label: 'City Details', group: 'relocation', match: 'prefix' },
  { path: '/about', pageId: 'about', label: 'About', group: 'core' },
  { path: '/sample-report', pageId: 'sample-report', label: 'Sample Report', group: 'relocation' },
  { path: '/moving-abroad-glossary', pageId: 'glossary', label: 'Moving Abroad Glossary', group: 'resources' },
  { path: '/blog', pageId: 'blog-index', label: 'Blog', group: 'resources' },
  { path: '/blog/', pageId: 'blog-post', label: 'Blog Post', group: 'resources', match: 'prefix' },
  { path: '/earn-abroad', pageId: 'earn-abroad', label: 'Earn Abroad', group: 'earn-abroad' },
  { path: '/global-wealth-strategy', pageId: 'global-wealth-strategy', label: 'Global Wealth Strategy', group: 'earn-abroad' },
  { path: '/living-wage-business', pageId: 'living-wage-business', label: 'Living Wage Business', group: 'earn-abroad' },
  { path: '/digital-sales', pageId: 'digital-sales', label: 'Digital Sales', group: 'earn-abroad' },
  { path: '/multiple-options', pageId: 'multiple-options', label: 'Multiple Options', group: 'earn-abroad' },
  { path: '/youtuber', pageId: 'youtuber', label: 'YouTube Creator', group: 'earn-abroad' },
  { path: '/affiliate', pageId: 'affiliate', label: 'Affiliate', group: 'earn-abroad' },
  { path: '/agency', pageId: 'agency', label: 'Agency', group: 'earn-abroad' },
  { path: '/privacy', pageId: 'privacy', label: 'Privacy Policy', group: 'legal' },
  { path: '/terms', pageId: 'terms', label: 'Terms of Service', group: 'legal' },
];

export function normalizeClarityPath(pathname: string) {
  const pathOnly = pathname.split(/[?#]/, 1)[0] || '/';
  return pathOnly === '/' ? pathOnly : pathOnly.replace(/\/+$/, '');
}

export function getTrackedClarityPage(pathname: string) {
  const normalizedPath = normalizeClarityPath(pathname);

  return TRACKED_CLARITY_PAGES.find((page) => (
    page.match === 'prefix'
      ? normalizedPath.startsWith(page.path)
      : normalizedPath === page.path
  ));
}
