import type { Config, Context } from '@netlify/edge-functions';
import { KEY_PAGES } from '../../src/shared/page-seo.ts';

/**
 * Server-side SEO for blog posts.
 *
 * emigrationpro.com is a client-rendered SPA: every URL returns the same shell with an
 * empty #root, and the real title/description/body only appear after React runs. Googlebot
 * executes JavaScript so it copes, but the AI crawlers that matter for answer engines --
 * GPTBot, ClaudeBot, PerplexityBot -- generally do not. Without this, every blog post is
 * an identical contentless page to them, and to link unfurlers.
 *
 * The Worker has equivalent HTMLRewriter logic, but it only runs for requests that reach
 * the workers.dev host. Public traffic is served by Netlify, so it never fired in
 * production. This runs on the path the public actually uses.
 *
 * Failure is always non-fatal: any error returns the untouched SPA shell, which is exactly
 * the behaviour that exists today.
 */

const WORKER_ORIGIN = 'https://emigration-pro.aiservices4biz.workers.dev';
const SITE_ORIGIN = 'https://emigrationpro.com';

interface BlogPost {
  title: string;
  slug: string;
  body: string;
  excerpt?: string;
  featured_image?: string;
  author?: string;
  published_date?: string;
  updated_at?: string;
}

/** Escape for use inside an HTML attribute or text node. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Strip markdown/HTML down to readable prose. */
function toPlainText(source: string): string {
  return source
    .replace(/<[^>]*>/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function summarize(post: BlogPost): string {
  const plain = toPlainText(post.excerpt?.trim() || post.body);
  if (plain.length <= 160) return plain;
  return `${plain.slice(0, 157).replace(/\s+\S*$/, '')}…`;
}

/** Replace a meta tag's content attribute, matched on either name= or property=. */
function setMetaContent(html: string, key: string, value: string): string {
  const pattern = new RegExp(
    `(<meta\\s+(?:name|property)=["']${key}["'][^>]*content=["'])[^"']*(["'])`,
    'i'
  );
  return html.replace(pattern, `$1${esc(value)}$2`);
}

export default async function handler(request: Request, context: Context) {
  const response = await context.next();

  // Only rewrite real HTML documents; leave assets and API passthrough alone.
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  const slug = new URL(request.url).pathname.replace(/^\/blog\//, '').replace(/\/$/, '');
  if (!slug || slug.includes('/')) return response;

  try {
    const apiResponse = await fetch(
      `${WORKER_ORIGIN}/api/blog/posts/${encodeURIComponent(slug)}`,
      { headers: { accept: 'application/json' } }
    );
    if (!apiResponse.ok) return response;

    const data = (await apiResponse.json()) as { success?: boolean; post?: BlogPost };
    if (!data?.success || !data.post) return response;

    const post = data.post;
    const url = `${SITE_ORIGIN}/blog/${post.slug}`;
    const title = `${post.title} | Emigration Pro`;
    const description = summarize(post);
    const image = post.featured_image || `${SITE_ORIGIN}/images/elderly-couple-documents.jpg`;

    let html = await response.text();

    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
    html = setMetaContent(html, 'description', description);
    html = setMetaContent(html, 'og:title', title);
    html = setMetaContent(html, 'og:description', description);
    html = setMetaContent(html, 'og:image', image);
    html = setMetaContent(html, 'og:url', url);
    html = setMetaContent(html, 'og:type', 'article');
    html = setMetaContent(html, 'twitter:title', title);
    html = setMetaContent(html, 'twitter:description', description);
    html = setMetaContent(html, 'twitter:image', image);
    html = html.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${esc(url)}" />`
    );

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description,
      image: [image],
      datePublished: post.published_date,
      dateModified: post.updated_at || post.published_date,
      author: { '@type': 'Person', name: post.author || 'Emigration Pro' },
      publisher: { '@id': `${SITE_ORIGIN}/#organization` },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      inLanguage: 'en-US',
    };

    // The article itself, for crawlers that never run React. Capped so a long post does
    // not bloat the shell; enough for an answer engine to understand and cite the page.
    const articleText = toPlainText(post.body).slice(0, 12000);

    html = html.replace(
      '</head>',
      `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(
        /</g,
        '\\u003c'
      )}</script></head>`
    );

    // Links out to the conversion pages, not just back to /blog. Editorial pages are
    // where this site earns its authority, so the crawlable link graph has to carry that
    // through to the pages that matter instead of dead-ending in the blog.
    const relatedLinks = KEY_PAGES.map(
      (page) =>
        `<li><a href="${SITE_ORIGIN}${esc(page.href)}">${esc(page.label)}</a> — ${esc(page.blurb)}</li>`
    ).join('');

    const prerenderedArticle =
      `<article data-seo-prerendered="true"><h1>${esc(post.title)}</h1>` +
        `<p><em>${esc(description)}</em></p>` +
        `<p>${esc(articleText)}</p>` +
        `<nav><h2>Plan your own move</h2><ul>${relatedLinks}` +
        `<li><a href="${SITE_ORIGIN}/blog">More relocation guides</a></li></ul></nav>` +
        `</article>`;

    // Serve the article as ordinary initial HTML. React replaces #root after startup;
    // crawlers that do not execute JavaScript can still index the article body.
    html = html.replace(
      /<div\s+id=["']root["']\s*>\s*<\/div>/i,
      `<div id="root">${prerenderedArticle}</div>`
    );

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    return new Response(html, { status: response.status, headers });
  } catch (error) {
    console.error('blog-seo edge function failed, serving unmodified shell:', error);
    return response;
  }
}

export const config: Config = {
  path: '/blog/*',
};
