import { useEffect } from 'react';

const SITE_NAME = 'Emigration Pro';
const SITE_ORIGIN = 'https://emigrationpro.com';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/images/elderly-couple-documents.jpg`;

interface SEOProps {
  title: string;
  description?: string;
  /** Path only, e.g. '/best-countries'. Defaults to the current pathname. */
  canonicalPath?: string;
  /** Absolute URL, or a site-relative path starting with '/'. */
  image?: string;
  /** Accessible description for social preview images. */
  imageAlt?: string;
  /** og:type — 'website' for most pages, 'article' for blog posts. */
  type?: 'website' | 'article';
  /** Keeps a page out of search results. Use on admin and per-customer pages. */
  noindex?: boolean;
  /** Structured data for this page, appended as a managed ld+json block. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Set false to use `title` verbatim instead of appending the site name. */
  appendSiteName?: boolean;
}

/** Find an existing tag or create it, tagging ours so we can clean up on unmount. */
function upsert(selector: string, create: () => HTMLElement): HTMLElement {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    el.setAttribute('data-seo-managed', '');
    document.head.appendChild(el);
  }
  return el;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  const el = upsert(`meta[${attr}="${key}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute(attr, key);
    return m;
  });
  el.setAttribute('content', content);
}

function absolute(pathOrUrl: string): string {
  return pathOrUrl.startsWith('http') ? pathOrUrl : `${SITE_ORIGIN}${pathOrUrl}`;
}

/**
 * Sets per-route metadata on a client-rendered page.
 *
 * Caveat worth knowing: this runs in an effect, so it only helps crawlers that execute
 * JavaScript (Googlebot does; most AI crawlers do not). The non-JS baseline lives in
 * index.html, and blog posts get server-injected meta via the Worker's HTMLRewriter.
 */
export function useSEO({
  title,
  description,
  canonicalPath,
  image,
  imageAlt,
  type = 'website',
  noindex = false,
  jsonLd,
  appendSiteName = true,
}: SEOProps) {
  const serializedJsonLd = jsonLd ? JSON.stringify(jsonLd) : undefined;

  useEffect(() => {
    const fullTitle = appendSiteName ? `${title} | ${SITE_NAME}` : title;
    const url = absolute(canonicalPath ?? window.location.pathname);
    const imageUrl = image ? absolute(image) : DEFAULT_IMAGE;

    document.title = fullTitle;

    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }

    setMeta('property', 'og:title', fullTitle);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:image', imageUrl);
    if (imageAlt) setMeta('property', 'og:image:alt', imageAlt);
    setMeta('name', 'twitter:image', imageUrl);
    if (imageAlt) setMeta('name', 'twitter:image:alt', imageAlt);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta(
      'name',
      'robots',
      noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'
    );

    const canonical = upsert('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      return l;
    }) as HTMLLinkElement;
    canonical.href = url;

    // Route-specific structured data. Removed on unmount so it never leaks into the
    // next route — the static @graph in index.html is left untouched.
    let script: HTMLScriptElement | undefined;
    if (serializedJsonLd) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-route', '');
      script.textContent = serializedJsonLd;
      document.head.appendChild(script);
    }

    return () => {
      script?.remove();
    };
  }, [title, description, canonicalPath, image, imageAlt, type, noindex, serializedJsonLd, appendSiteName]);
}
