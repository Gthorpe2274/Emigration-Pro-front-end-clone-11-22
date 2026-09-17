import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const API_ROOT = 'https://www.googleapis.com/youtube/v3';
const MIN_SUBSCRIBERS = 200;
const MAX_SUBSCRIBERS = 2000;
const MIN_VIDEO_VIEWS = 250;
const TARGET_COUNT = 25;

const queries = [
  'best countries to live abroad channel',
  'compare countries to retire abroad',
  'where to move abroad expat channel',
  'countries ranked for expats living abroad',
  'international living destinations YouTube',
  'retire overseas multiple countries',
  'American living in Portugal vlog',
  'American living in Spain vlog',
  'expat living in Mexico daily life',
  'expat living in Ecuador vlog',
  'expat living in Colombia vlog',
  'expat living in Costa Rica vlog',
  'expat living in Panama vlog',
  'American living in France vlog',
  'expat living in Italy daily life',
  'expat living in Albania vlog',
  'expat living in Georgia country vlog',
  'expat living in Thailand daily life',
  'expat living in Vietnam vlog',
  'expat living in Philippines daily life',
  'expat living in Malaysia vlog',
  'expat living in Japan daily life',
  'expat living in South Korea vlog',
  'expat living in Ghana vlog',
  'expat living in Kenya vlog',
  'expat living in South Africa vlog',
  'expat living in Australia vlog',
  'expat living in New Zealand vlog',
  'expat living abroad family vlog',
  'retired abroad daily life vlog'
];

const countryNames = [
  'Albania', 'Argentina', 'Australia', 'Austria', 'Belize', 'Brazil', 'Bulgaria',
  'Cambodia', 'Canada', 'Chile', 'Colombia', 'Costa Rica', 'Croatia', 'Cyprus',
  'Czechia', 'Dominican Republic', 'Ecuador', 'Egypt', 'France', 'Georgia',
  'Germany', 'Ghana', 'Greece', 'Hungary', 'Indonesia', 'Ireland', 'Italy',
  'Japan', 'Kenya', 'Malaysia', 'Malta', 'Mexico', 'Montenegro', 'Morocco',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Panama', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Romania', 'Singapore', 'South Africa', 'South Korea',
  'Spain', 'Thailand', 'Turkey', 'United Arab Emirates', 'United Kingdom',
  'Uruguay', 'Vietnam'
];

const excludedHosts = [
  'youtube.com', 'youtu.be', 'google.com', 'googleapis.com', 'facebook.com',
  'instagram.com', 'twitter.com', 'x.com', 'tiktok.com', 'pinterest.com'
];

function chunks(values, size) {
  return Array.from({ length: Math.ceil(values.length / size) }, (_, index) =>
    values.slice(index * size, (index + 1) * size));
}

async function api(path, params, key) {
  const url = new URL(`${API_ROOT}/${path}`);
  for (const [name, value] of Object.entries({ ...params, key })) {
    url.searchParams.set(name, String(value));
  }
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || `YouTube API error ${response.status}`);
  return data;
}

function externalUrls(text) {
  const matches = text.match(/https?:\/\/[^\s<>"')\]}]+/gi) || [];
  const cleaned = matches.map((value) => value.replace(/[.,;:!?]+$/, ''));
  return [...new Set(cleaned)].filter((value) => {
    try {
      const host = new URL(value).hostname.toLowerCase().replace(/^www\./, '');
      return !excludedHosts.some((excluded) => host === excluded || host.endsWith(`.${excluded}`));
    } catch {
      return false;
    }
  });
}

function csvCell(value) {
  const text = Array.isArray(value) ? value.join(' | ') : String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

function countriesMentioned(text) {
  const normalized = text.toLowerCase();
  return countryNames.filter((country) => normalized.includes(country.toLowerCase()));
}

async function main() {
  const keyPath = resolve(process.argv[2] || 'youtube_key.txt');
  const outputPath = resolve(process.argv[3] || 'outputs/youtube-living-abroad-channels.md');
  const keyFileContent = (await readFile(keyPath, 'utf8')).trim();
  const key = keyPath.toLowerCase().endsWith('.json')
    ? JSON.parse(keyFileContent).YOUTUBE_API_KEY?.trim()
    : keyFileContent;
  if (!key) throw new Error(`No API key found in ${keyPath}`);

  const candidateIds = new Set();
  const matchedQueries = new Map();
  for (const query of queries) {
    const result = await api('search', {
      part: 'snippet', q: query, type: 'video', maxResults: 50, order: 'relevance'
    }, key);
    for (const item of result.items || []) {
      const id = item.snippet.channelId;
      candidateIds.add(id);
      if (!matchedQueries.has(id)) matchedQueries.set(id, new Set());
      matchedQueries.get(id).add(query);
    }
  }

  const channels = [];
  for (const ids of chunks([...candidateIds], 50)) {
    const result = await api('channels', {
      part: 'snippet,statistics,contentDetails,brandingSettings', id: ids.join(',')
    }, key);
    channels.push(...(result.items || []));
  }

  const eligible = channels.filter((channel) => {
    const count = Number(channel.statistics?.subscriberCount || 0);
    return !channel.statistics?.hiddenSubscriberCount &&
      count >= MIN_SUBSCRIBERS && count <= MAX_SUBSCRIBERS;
  });

  const verified = [];
  for (const channel of eligible) {
    const uploads = channel.contentDetails?.relatedPlaylists?.uploads;
    if (!uploads) continue;
    const playlist = await api('playlistItems', {
      part: 'snippet,contentDetails', playlistId: uploads, maxResults: 50
    }, key);
    const ids = (playlist.items || []).map((item) => item.contentDetails.videoId);
    if (!ids.length) continue;
    const details = await api('videos', {
      part: 'snippet,statistics', id: ids.join(',')
    }, key);
    const qualifying = (details.items || [])
      .filter((video) => Number(video.statistics?.viewCount || 0) >= MIN_VIDEO_VIEWS)
      .sort((a, b) => Number(b.statistics.viewCount) - Number(a.statistics.viewCount));
    if (qualifying.length < 3) continue;

    const channelText = [
      channel.snippet?.description || '',
      channel.brandingSettings?.channel?.description || '',
      ...(details.items || []).map((video) => `${video.snippet?.title || ''} ${video.snippet?.description || ''}`)
    ].join('\n');
    const countries = countriesMentioned(channelText);
    if (countries.length < 3) continue;

    const descriptions = [
      channel.snippet?.description || '',
      channel.brandingSettings?.channel?.description || '',
      ...(details.items || []).slice(0, 20).map((video) => video.snippet?.description || '')
    ];
    const websites = [...new Set(descriptions.flatMap(externalUrls))];
    if (!websites.length) continue;

    verified.push({
      channel: channel.snippet.title,
      channelId: channel.id,
      channelUrl: `https://www.youtube.com/channel/${channel.id}`,
      subscribers: Number(channel.statistics.subscriberCount),
      countriesCovered: countries,
      website: websites[0],
      alternateWebsites: websites.slice(1, 4),
      matchedSearches: [...(matchedQueries.get(channel.id) || [])],
      qualifyingVideoCountAmongLatest50: qualifying.length,
      qualifyingVideos: qualifying.slice(0, 3).map((video) => ({
        title: video.snippet.title,
        views: Number(video.statistics.viewCount),
        url: `https://www.youtube.com/watch?v=${video.id}`
      }))
    });
  }

  verified.sort((a, b) => a.subscribers - b.subscribers);
  const selected = verified.slice(0, TARGET_COUNT);
  const checkedAt = new Date().toISOString();
  const lines = [
    '# Small YouTube Channels About Living Abroad', '',
    `Verified with the YouTube Data API on ${checkedAt.slice(0, 10)}. Counts are a point-in-time snapshot.`, '',
    `Criteria: ${MIN_SUBSCRIBERS.toLocaleString()}–${MAX_SUBSCRIBERS.toLocaleString()} subscribers; at least three of the latest 50 uploads have ${MIN_VIDEO_VIEWS}+ views; at least three countries appear across the channel profile/recent uploads; at least one non-social external website appears in the channel or recent video descriptions.`, '',
    `Found ${verified.length} qualifying candidates; the first ${selected.length} are listed below.`, '',
    '| # | Channel | Subscribers | Countries covered | Associated website | Three qualifying videos |',
    '|---:|---|---:|---|---|---|',
    ...selected.map((item, index) => {
      const videos = item.qualifyingVideos.map((video) =>
        `[${video.title.replaceAll('|', '\\|')}](${video.url}) (${video.views.toLocaleString()} views)`).join('<br>');
      return `| ${index + 1} | [${item.channel.replaceAll('|', '\\|')}](${item.channelUrl}) | ${item.subscribers.toLocaleString()} | ${item.countriesCovered.join(', ')} | [Website](${item.website}) | ${videos} |`;
    }), '',
    '## Verification notes', '',
    '- “Associated website” means a creator-linked external site found in public channel or recent-video descriptions. Link hubs, newsletters, Patreon, and creator storefronts may appear.',
    '- The API does not expose channel About-page links directly, so each website should receive a final human relevance check before outreach.',
    '- “Latest 50” keeps API usage bounded and makes the performance test reproducible.', ''
  ];

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, lines.join('\n'), 'utf8');
  await writeFile(outputPath.replace(/\.md$/i, '.json'), JSON.stringify({ checkedAt, candidates: verified }, null, 2), 'utf8');
  const csvHeader = ['Channel', 'Channel URL', 'Subscribers', 'Countries covered', 'Website', 'Qualifying videos in latest 50', 'Video 1', 'Video 2', 'Video 3'];
  const csvRows = selected.map((item) => [
    item.channel, item.channelUrl, item.subscribers, item.countriesCovered, item.website,
    item.qualifyingVideoCountAmongLatest50,
    ...item.qualifyingVideos.map((video) => `${video.title} (${video.views} views) ${video.url}`)
  ]);
  await writeFile(outputPath.replace(/\.md$/i, '.csv'),
    [csvHeader, ...csvRows].map((row) => row.map(csvCell).join(',')).join('\n'), 'utf8');
  console.log(JSON.stringify({ candidateChannels: candidateIds.size, subscriberEligible: eligible.length, verified: verified.length, selected: selected.length, outputPath }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
