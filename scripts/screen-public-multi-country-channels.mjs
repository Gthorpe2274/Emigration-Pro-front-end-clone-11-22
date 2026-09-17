import { writeFile, mkdir } from 'node:fs/promises';

const SITEMAP = 'https://tripchannels.com/sitemap-channels.xml';
const LIVING_PATTERN = /expat|living abroad|live abroad|move abroad|moving abroad|relocat|digital nomad|remote work|retir|location independent|cost of living|work abroad|life abroad/i;
const STYLE_TERMS = new Set(['Digital Nomad', 'Solo Female', 'Luxury', 'Budget', 'Food', 'Family', 'Van Life', 'Slow', 'Outdoor & Hiking', 'Travel Photography']);

function decode(value = '') {
  return value.replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"');
}

function viewNumber(number, suffix) {
  return Number(number) * (suffix === 'K' ? 1000 : suffix === 'M' ? 1000000 : 1);
}

async function inspect(url) {
  const html = await fetch(url).then((response) => response.ok ? response.text() : '');
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  let creator;
  for (const match of scripts) {
    try {
      const graph = JSON.parse(match[1])['@graph'] || [];
      creator ||= graph.find((item) => item['@type'] === 'Person' || (item['@type'] === 'Organization' && item.jobTitle === 'Travel YouTuber'));
    } catch {}
  }
  if (!creator) return null;
  const subscribers = Number(creator.interactionStatistic?.userInteractionCount || 0);
  if (subscribers < 200 || subscribers > 2000) return null;
  const meta = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] || '');
  const description = creator.description || '';
  if (!LIVING_PATTERN.test(`${creator.name} ${description} ${meta} ${html}`)) return null;
  const filmed = Number(meta.match(/filmed in (\d+) countries/i)?.[1] || 0);
  const topics = (creator.knowsAbout || []).filter((topic) => !STYLE_TERMS.has(topic));
  if (Math.max(filmed, topics.length) < 3) return null;
  const viewMatches = [...html.matchAll(/([\d.]+)([KM]?) views/g)];
  const views = viewMatches.map((match) => viewNumber(match[1], match[2])).filter((value) => value >= 250);
  if (views.length < 3) return null;
  return {
    name: creator.name,
    youtube: creator.sameAs?.find((value) => value.includes('youtube.com')),
    subscribers,
    countries: topics,
    filmedCountries: filmed,
    qualifyingDisplayedVideos: views.length,
    directoryProfile: url,
    description
  };
}

async function main() {
  const sitemap = await fetch(SITEMAP).then((response) => response.text());
  const urls = [...sitemap.matchAll(/<loc>([^<]+\/channel\/[^<]+)<\/loc>/g)].map((match) => match[1]);
  const results = [];
  let next = 0;
  async function worker() {
    while (next < urls.length) {
      const index = next++;
      try {
        const result = await inspect(urls[index]);
        if (result) results.push(result);
      } catch {}
    }
  }
  await Promise.all(Array.from({ length: 24 }, worker));
  results.sort((a, b) => a.subscribers - b.subscribers || b.filmedCountries - a.filmedCountries);
  await mkdir('outputs', { recursive: true });
  await writeFile('outputs/public-multi-country-channel-candidates.json', JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2));
  console.log(JSON.stringify({ scanned: urls.length, found: results.length, names: results.map((item) => item.name) }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
