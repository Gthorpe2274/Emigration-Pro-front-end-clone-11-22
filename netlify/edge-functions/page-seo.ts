import type { Config, Context } from '@netlify/edge-functions';
import { PAGE_SEO, KEY_PAGES, SITE_ORIGIN, fullTitle } from '../../src/shared/page-seo.ts';
import { GLOSSARY_TERMS } from '../../src/shared/glossary-data.ts';

/**
 * Server-side SEO for the main marketing pages, mirroring what blog-seo.ts does for
 * posts.
 *
 * Same underlying problem: this is a client-rendered SPA, so without this every one of
 * these URLs serves an identical contentless shell. Googlebot renders the JS; the AI
 * crawlers behind answer engines generally do not, so /best-countries and /assessment
 * were indistinguishable from the homepage to them.
 *
 * Copy comes from src/shared/page-seo.ts, which the React pages also read, so the
 * crawler-visible version cannot drift from the rendered one.
 *
 * Any failure returns the untouched shell — the behaviour that exists today.
 */

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setMetaContent(html: string, key: string, value: string): string {
  const pattern = new RegExp(
    `(<meta\\s+(?:name|property)=["']${key}["'][^>]*content=["'])[^"']*(["'])`,
    'i'
  );
  return html.replace(pattern, `$1${esc(value)}$2`);
}

export default async function handler(request: Request, context: Context) {
  const response = await context.next();

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  // Normalise a trailing slash so '/best-countries/' hits the same entry.
  const rawPath = new URL(request.url).pathname;
  const path = rawPath.length > 1 ? rawPath.replace(/\/$/, '') : rawPath;
  const seo = PAGE_SEO[path];
  if (!seo) return response;

  try {
    const url = `${SITE_ORIGIN}${path === '/' ? '/' : path}`;
    const title = fullTitle(seo);

    let html = await response.text();

    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
    html = setMetaContent(html, 'description', seo.description);
    html = setMetaContent(html, 'og:title', title);
    html = setMetaContent(html, 'og:description', seo.description);
    html = setMetaContent(html, 'og:url', url);
    html = setMetaContent(html, 'og:type', 'website');
    if (seo.image) {
      const image = `${SITE_ORIGIN}${seo.image}`;
      html = setMetaContent(html, 'og:image', image);
      html = setMetaContent(html, 'twitter:image', image);
    }
    if (seo.imageAlt) {
      html = setMetaContent(html, 'og:image:alt', seo.imageAlt);
      html = html.replace('</head>', `<meta name="twitter:image:alt" content="${esc(seo.imageAlt)}" /></head>`);
    }
    html = setMetaContent(html, 'twitter:title', title);
    html = setMetaContent(html, 'twitter:description', seo.description);
    html = html.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${esc(url)}" />`
    );

    // Internal links: page-specific ones first, then the key pages, minus self-links.
    const links = [...(seo.links ?? []), ...KEY_PAGES.map((p) => ({ href: p.href, label: p.label }))]
      .filter((link, index, all) => link.href !== path && all.findIndex((l) => l.href === link.href) === index);

    const glossaryContent = path === '/moving-abroad-glossary'
      ? `<section><h2>Glossary terms</h2>${GLOSSARY_TERMS.map((entry) =>
          `<article id="${esc(entry.term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))}">` +
          `<h3>${esc(entry.term)}</h3><p>${esc(entry.definition)}</p>` +
          `<p><strong>Why it matters:</strong> ${esc(entry.significance)}</p>` +
          `<p><strong>Example:</strong> ${esc(entry.example)}</p>` +
          `<p><a href="${esc(entry.source.url)}">${esc(entry.source.label)}</a></p></article>`
        ).join('')}</section>`
      : '';

    const prerenderedContent =
      `<main data-seo-prerendered="true"><h1>${esc(seo.heading)}</h1>` +
      seo.summary.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('') +
      glossaryContent +
      (links.length
        ? `<nav><h2>Related</h2><ul>${links
            .map((l) => `<li><a href="${SITE_ORIGIN}${esc(l.href)}">${esc(l.label)}</a></li>`)
            .join('')}</ul></nav>`
        : '') +
      `</main>`;

    const webPageStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description: seo.description,
      isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
      about: { '@id': `${SITE_ORIGIN}/#organization` },
      inLanguage: 'en-US',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_ORIGIN}/`,
          },
          ...(path === '/'
            ? []
            : [{ '@type': 'ListItem', position: 2, name: seo.heading, item: url }]),
        ],
      },
    };

    const structuredData = path === '/moving-abroad-glossary'
      ? {
          '@context': 'https://schema.org',
          '@graph': [
            { ...webPageStructuredData, '@context': undefined },
            {
              '@type': 'DefinedTermSet',
              '@id': `${url}#term-set`,
              name: 'Moving Abroad Glossary for Americans',
              description: seo.description,
              url,
              inLanguage: 'en-US',
              hasDefinedTerm: GLOSSARY_TERMS.map((entry) => ({
                '@type': 'DefinedTerm',
                '@id': `${url}#${entry.term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
                name: entry.term,
                description: entry.definition,
                inDefinedTermSet: `${url}#term-set`,
              })),
            },
          ],
        }
      : webPageStructuredData;

    html = html.replace(
      '</head>',
      `<script type="application/ld+json" data-seo-server-route>${JSON.stringify(structuredData).replace(
        /</g,
        '\\u003c'
      )}</script></head>`
    );

    // Put meaningful page content in the ordinary initial DOM. React replaces the
    // contents of #root once the application starts, while non-JS crawlers receive a
    // real document instead of an empty root or content hidden in <noscript>.
    html = html.replace(
      /<div\s+id=["']root["']\s*>\s*<\/div>/i,
      `<div id="root">${prerenderedContent}</div>`
    );

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    return new Response(html, { status: response.status, headers });
  } catch (error) {
    console.error('page-seo edge function failed, serving unmodified shell:', error);
    return response;
  }
}

export const config: Config = {
  path: [
    '/',
    '/assessment',
    '/best-countries',
    '/sample-report',
    '/earn-abroad',
    '/living-wage-business',
    '/blog',
    '/about',
    '/moving-abroad-glossary',
  ],
};
