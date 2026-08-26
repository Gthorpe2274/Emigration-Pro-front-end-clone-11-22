import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

import { runScheduledCleanup } from './retention-cleanup';
import { YouTubeAPIService } from './youtube-api-service';
import { findBestVideoReplacement } from './youtube-video-curator';
import { convertMarkdownToHTML, convertPDFToHTML } from './file-converter';

// Helper function for scheduled video updates
async function runScheduledVideoUpdates(env: Env): Promise<void> {
  console.log('=== STARTING SCHEDULED VIDEO UPDATES ===');

  try {
    if (!env.YOUTUBE_API_KEY) {
      console.warn('YouTube API key not configured, skipping video updates');
      return;
    }

    // Find assessments with videos due for update (next_update_date <= today)
    const dueForUpdate = await env.DB.prepare(`
      SELECT DISTINCT assessment_id
      FROM relocation_hub_videos
      WHERE next_update_date <= datetime('now')
      ORDER BY assessment_id
      LIMIT 50
    `).all();

    console.log(`Found ${dueForUpdate.results.length} assessments with videos due for update`);

    const youtubeService = new YouTubeAPIService(env.YOUTUBE_API_KEY);
    let processed = 0;
    let errors = 0;

    for (const row of dueForUpdate.results) {
      const assessmentId = (row.assessment_id as number);

      try {
        // Get assessment details
        const assessment = await env.DB.prepare(
          "SELECT * FROM assessments WHERE id = ?"
        ).bind(assessmentId).first();

        if (!assessment) {
          console.warn(`Assessment ${assessmentId} not found, skipping`);
          continue;
        }

        const country = (assessment.preferred_country as string) || '';
        const city = assessment.preferred_city as string | undefined;

        // Get current videos
        const currentVideos = await env.DB.prepare(`
          SELECT * FROM relocation_hub_videos
          WHERE assessment_id = ?
          ORDER BY video_slot ASC
        `).bind(assessmentId).all();

        if (currentVideos.results.length === 0) {
          continue; // No videos to update
        }

        // Update each video slot
        for (const currentVideo of currentVideos.results) {
          try {
            const slot = currentVideo.video_slot as number;
            const title = currentVideo.title as string;
            const query = title.toLowerCase()
              .replace(/living in /g, '')
              .replace(/ - .*/, '')
              .replace(/ as an .*/, '')
              .replace(/ vs .*/, '')
              .replace(/ step by step .*/i, ' guide')
              .replace(/ guide$/i, '')
              + ` ${country}${city ? ` ${city}` : ''} expat`;

            // Search YouTube
            const searchResults = await youtubeService.searchVideos({
              query: query,
              maxResults: 10,
              order: 'relevance'
            });

            if (searchResults.length === 0) {
              console.warn(`No search results for slot ${slot} in assessment ${assessmentId}`);
              continue;
            }

            // Use Gemini curation if available
            let selectedVideo;
            if (env.GEMINI_API_KEY) {
              const curated = await findBestVideoReplacement(
                {
                  assessment_id: assessmentId,
                  currentVideo: {
                    video_id: currentVideo.video_id as string,
                    title: title,
                    channel_name: currentVideo.channel_name as string,
                    description: currentVideo.description as string,
                    video_slot: slot
                  },
                  country,
                  city
                },
                searchResults,
                env.GEMINI_API_KEY
              );

              if (curated && curated.confidence_score >= 60) {
                selectedVideo = curated;
              } else {
                selectedVideo = searchResults[0];
              }
            } else {
              selectedVideo = searchResults[0];
            }

            // Update video in database
            const nextUpdateDate = new Date();
            nextUpdateDate.setMonth(nextUpdateDate.getMonth() + 6);

            await env.DB.prepare(`
              UPDATE relocation_hub_videos
              SET video_id = ?,
                  title = ?,
                  channel_name = ?,
                  channel_id = ?,
                  thumbnail_url = ?,
                  description = ?,
                  youtube_url = ?,
                  last_updated = CURRENT_TIMESTAMP,
                  next_update_date = ?,
                  updated_at = CURRENT_TIMESTAMP
              WHERE assessment_id = ? AND video_slot = ?
            `).bind(
              selectedVideo.video_id,
              selectedVideo.title,
              selectedVideo.channel_name,
              selectedVideo.channel_id,
              selectedVideo.thumbnail_url,
              selectedVideo.description,
              selectedVideo.youtube_url,
              nextUpdateDate.toISOString(),
              assessmentId,
              slot
            ).run();

            console.log(`Updated video slot ${slot} for assessment ${assessmentId}`);
          } catch (error) {
            console.error(`Error updating video slot ${currentVideo.video_slot} for assessment ${assessmentId}:`, error);
            errors++;
          }
        }

        processed++;

        // Rate limiting: wait 1 second between assessments to avoid API quota issues
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing assessment ${assessmentId}:`, error);
        errors++;
      }
    }

    console.log(`=== VIDEO UPDATES COMPLETE ===`);
    console.log(`Processed: ${processed}, Errors: ${errors}`);
  } catch (error) {
    console.error('Scheduled video update failed:', error);
  }
}

// Initialize Hono app
const app = new Hono<{ Bindings: Env }>();

const SITE_ORIGIN = 'https://emigrationpro.com';
const INDEXNOW_KEY = '72c62d03371f45b7a2177112fafe5a53';
const INDEXNOW_KEY_LOCATION = `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`;
const CRM_SALES_STATS_CACHE_KEY = 'crm:stripe-sales-stats:v2';
const CRM_TIME_ZONE = 'America/New_York';

type StripePaymentIntent = {
  id: string;
  created: number;
  amount_received: number;
  currency: string;
  livemode: boolean;
  status: string;
};

type StripePaymentIntentList = {
  data: StripePaymentIntent[];
  has_more: boolean;
};

type CrmSalesStats = {
  totalSales: number;
  salesThisMonth: number;
  asOf: string;
  source: 'stripe';
};

const monthKey = (date: Date) => new Intl.DateTimeFormat('en-CA', {
  timeZone: CRM_TIME_ZONE,
  year: 'numeric',
  month: '2-digit'
}).format(date);

async function fetchStripeSalesStats(env: Env): Promise<CrmSalesStats> {
  const cached = await env.REPORTS_KV.get(CRM_SALES_STATS_CACHE_KEY, 'json') as CrmSalesStats | null;
  if (cached) return cached;
  if (!env.STRIPE_SECRET_KEY) throw new Error('Stripe is not configured');

  const reportPriceCents = Math.round(Number(env.REPORT_PRICE_USD || '2') * 100);
  if (!Number.isFinite(reportPriceCents) || reportPriceCents <= 0) {
    throw new Error('The report price is not configured correctly');
  }
  const currentMonth = monthKey(new Date());
  let totalSales = 0;
  let salesThisMonth = 0;
  let startingAfter = '';

  // Count actual live captured payments for the report price. A completed
  // Checkout Session alone is not sufficient: it can be unpaid, zero-dollar,
  // or belong to another product in the same Stripe account.
  for (let page = 0; page < 1000; page += 1) {
    const params = new URLSearchParams({ limit: '100' });
    if (startingAfter) params.set('starting_after', startingAfter);
    const response = await fetch(`https://api.stripe.com/v1/payment_intents?${params}`, {
      headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` }
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error('Stripe sales stats request failed:', response.status, detail);
      throw new Error('Unable to load Stripe sales totals');
    }

    const result = await response.json() as StripePaymentIntentList;
    for (const payment of result.data) {
      if (!payment.livemode || payment.status !== 'succeeded' || payment.currency !== 'usd' || payment.amount_received !== reportPriceCents) continue;
      totalSales += 1;
      if (monthKey(new Date(payment.created * 1000)) === currentMonth) salesThisMonth += 1;
    }

    if (!result.has_more || result.data.length === 0) break;
    startingAfter = result.data[result.data.length - 1].id;
  }

  const stats: CrmSalesStats = {
    totalSales,
    salesThisMonth,
    asOf: new Date().toISOString(),
    source: 'stripe'
  };
  await env.REPORTS_KV.put(CRM_SALES_STATS_CACHE_KEY, JSON.stringify(stats), { expirationTtl: 300 });
  return stats;
}

function normalizePublicSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function publicBlogUrl(slug: string): string {
  return `${SITE_ORIGIN}/blog/${encodeURIComponent(slug)}`;
}

async function submitIndexNow(urls: string[]): Promise<void> {
  const urlList = [...new Set(urls)].filter((url) => url.startsWith(`${SITE_ORIGIN}/`));
  if (urlList.length === 0) return;

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'emigrationpro.com',
        key: INDEXNOW_KEY,
        keyLocation: INDEXNOW_KEY_LOCATION,
        urlList,
      }),
    });

    if (!response.ok) {
      console.error(`IndexNow submission failed (${response.status}):`, await response.text());
    }
  } catch (error) {
    // IndexNow must never make publishing fail. Log it so Workers observability can
    // surface transient network or provider errors.
    console.error('IndexNow submission error:', error);
  }
}

function queueIndexNow(c: { executionCtx: ExecutionContext }, urls: string[]): void {
  c.executionCtx.waitUntil(submitIndexNow(urls));
}

// Global Error Handler to prevent HTML responses for API errors
app.onError((err, c) => {
  console.error(`Global Error: ${err.message}`, err);

  // If it's an API route, always return JSON
  if (c.req.path.startsWith('/api/')) {
    return c.json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
      path: c.req.path
    }, 500);
  }

  // Otherwise, default behavior
  return c.text(`Internal Server Error: ${err.message}`, 500);
});

// Enable CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  maxAge: 86400,
  credentials: false
}));

// Security Headers Middleware
app.use('*', async (c, next) => {
  await next();
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Content-Security-Policy', "default-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; connect-src 'self' https:; img-src 'self' https: data: blob:; font-src 'self' https: data:; frame-src 'self' https://www.youtube.com https://youtube.com; object-src 'none'; base-uri 'self'; form-action 'self';");
});

// Test endpoint - confirms env vars are loaded
app.get('/api/env-test', async (c) => {
  const hasYouTube = !!c.env.YOUTUBE_API_KEY;
  const hasGemini = !!c.env.GEMINI_API_KEY;

  console.log('Environment check:', {
    youtube: hasYouTube,
    gemini: hasGemini,
    youtubeValue: c.env.YOUTUBE_API_KEY ? `${c.env.YOUTUBE_API_KEY.substring(0, 5)}...` : 'undefined',
    geminiValue: c.env.GEMINI_API_KEY ? `${c.env.GEMINI_API_KEY.substring(0, 5)}...` : 'undefined',
    allKeys: Object.keys(c.env)
  });

  return c.json({
    youtube: hasYouTube ? '✅ set' : '❌ missing',
    gemini: hasGemini ? '✅ set' : '❌ missing',
    debug: {
      youtubePrefix: c.env.YOUTUBE_API_KEY ? c.env.YOUTUBE_API_KEY.substring(0, 5) : 'N/A',
      geminiPrefix: c.env.GEMINI_API_KEY ? c.env.GEMINI_API_KEY.substring(0, 5) : 'N/A',
      envKeys: Object.keys(c.env)
    }
  });
});

// Debug endpoint - tests YouTube API only
app.get('/api/debug/youtube-test', async (c) => {
  if (!c.env.YOUTUBE_API_KEY) {
    return c.json({ error: 'YouTube API key not configured' }, 500);
  }

  try {
    console.log('Testing YouTube API with key:', c.env.YOUTUBE_API_KEY.substring(0, 10) + '...');
    const yt = new YouTubeAPIService(c.env.YOUTUBE_API_KEY);
    const searchResults = await yt.searchVideos({
      query: 'Portugal expat guide',
      maxResults: 3
    });

    console.log('YouTube API test successful, results:', searchResults.length);
    return c.json({
      success: true,
      resultsCount: searchResults.length,
      results: searchResults
    });
  } catch (error) {
    console.error('YouTube API test failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return c.json({
      success: false,
      error: errorMessage,
      stack: errorStack,
      apiKeySet: !!c.env.YOUTUBE_API_KEY,
      apiKeyPrefix: c.env.YOUTUBE_API_KEY ? c.env.YOUTUBE_API_KEY.substring(0, 10) : 'N/A'
    }, 500);
  }
});

// Debug endpoint - tests YouTube search and Gemini curation
app.get('/api/debug/gemini-curate', async (c) => {
  if (!c.env.YOUTUBE_API_KEY || !c.env.GEMINI_API_KEY) {
    return c.json({ error: 'API keys not configured' }, 500);
  }

  try {
    // 1. Search YouTube
    const yt = new YouTubeAPIService(c.env.YOUTUBE_API_KEY);
    const searchResults = await yt.searchVideos({
      query: 'Portugal expat guide',
      maxResults: 5
    });

    // 2. Curate with Gemini
    // Mock current video data
    const mockCurrentVideo = {
      video_id: 'mock_id',
      title: 'Old Video Title',
      channel_name: 'Old Channel',
      description: 'Old description',
      video_slot: 1
    };

    const curated = await findBestVideoReplacement(
      {
        assessment_id: 999, // Mock ID
        currentVideo: mockCurrentVideo,
        country: 'Portugal',
        city: 'Lisbon'
      },
      searchResults,
      c.env.GEMINI_API_KEY
    );

    return c.json({
      success: true,
      searchResultsCount: searchResults.length,
      geminiResult: curated,
      rawSearchResults: searchResults
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Middleware for blog admin API authentication (simplified - no API key required)
const adminAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  const token = authHeader.substring(7);
  const session = await c.env.REPORTS_KV.get(`admin_session:${token}`);
  if (!session) {
    return c.json({ error: 'Invalid or expired session' }, 401);
  }
  await next();
};


// Health check endpoint
app.get('/api/health', async (c) => {
  try {
    // Simple health check - verify database connection
    await c.env.DB.prepare('SELECT 1').first();
    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return c.json({
      status: 'unhealthy',
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Admin login endpoint with rate limiting (5 attempts per 15 minutes)
app.post('/api/admin/login', async (c) => {
  const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
  const attemptsKey = `admin_login_attempts:${ip}`;
  const attemptsRaw = await c.env.REPORTS_KV.get(attemptsKey);
  const attempts = attemptsRaw ? parseInt(attemptsRaw) : 0;
  if (attempts >= 5) {
    return c.json({ error: 'Too many login attempts. Try later.' }, 429);
  }
  const { username, password } = await c.req.json();
  // The standalone system login supplies both fields. Blog Admin historically
  // used a password-only form, so username remains optional for that client.
  const passwordIsValid = Boolean(c.env.ADMIN_PASSWORD) && password === c.env.ADMIN_PASSWORD;
  if ((username && username !== c.env.ADMIN_USERNAME) || !passwordIsValid) {
    await c.env.REPORTS_KV.put(attemptsKey, String(attempts + 1), { expirationTtl: 900 });
    return c.json({ error: 'Invalid credentials' }, 401);
  }
  // Successful login: reset attempts
  await c.env.REPORTS_KV.delete(attemptsKey);
  const token = crypto.randomUUID();
  await c.env.REPORTS_KV.put(`admin_session:${token}`, 'active', { expirationTtl: 86400 });
  return c.json({ token });
});

// Rotate admin sessions endpoint
app.post('/api/admin/rotate-sessions', adminAuth, async (c) => {
  const list = await c.env.REPORTS_KV.list({ prefix: 'admin_session:' });
  const keys = list.keys.map(k => k.name);
  for (const key of keys) {
    await c.env.REPORTS_KV.delete(key);
  }
  return c.json({ rotated: keys.length });
});

// Confirm that the browser still holds a valid server-issued admin session.
// Admin-only frontend tools use this before unlocking privileged workflows.
app.get('/api/admin/session', adminAuth, (c) => {
  return c.json({ authenticated: true });
});

// Assessment submission schema - aligned with shared types
const AssessmentSchema = z.object({
  user_age: z.number().min(18).max(100),
  user_job: z.string().min(1).max(200),
  children_count: z.number().int().min(0).max(10).optional().default(0),
  children_ages: z.string().max(100).optional(),
  education_preferences: z.string().max(500).optional(),
  preferred_country: z.string().min(1).max(100),
  preferred_city: z.string().optional(),
  location_preference: z.enum(['beachside', 'rural', 'city']),
  climate_preference: z.preprocess((val) => (val === '' ? undefined : val), z.enum(['tropical', 'seasonal', 'dry', 'mediterranean', 'temperate', 'northern']).optional()),
  monthly_budget: z.number().min(100).max(50000).optional().default(2000),
  immigration_policies_importance: z.number().min(1).max(5),
  healthcare_importance: z.number().min(1).max(5),
  safety_importance: z.number().min(1).max(5),
  internet_importance: z.number().min(1).max(5),
  emigration_process_importance: z.number().min(1).max(5),
  ease_of_immigration_importance: z.number().min(1).max(5),
  local_acceptance_importance: z.number().min(1).max(5)
}).superRefine((assessment, ctx) => {
  if (assessment.children_count > 0 && !assessment.children_ages?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['children_ages'],
      message: "Children's ages are required when children are relocating"
    });
  }
});

// Budget compatibility data for major cities
const cityBudgetData: { [key: string]: { [key: string]: { oneBedroomMin: number; oneBedroomMax: number; twoBedroomMin: number; twoBedroomMax: number; currency: string } } } = {
  'Portugal': {
    'Lisbon': { oneBedroomMin: 700, oneBedroomMax: 1200, twoBedroomMin: 1000, twoBedroomMax: 1800, currency: 'EUR' },
    'Porto': { oneBedroomMin: 500, oneBedroomMax: 900, twoBedroomMin: 700, twoBedroomMax: 1300, currency: 'EUR' },
    'default': { oneBedroomMin: 600, oneBedroomMax: 1000, twoBedroomMin: 800, twoBedroomMax: 1400, currency: 'EUR' }
  },
  'Spain': {
    'Barcelona': { oneBedroomMin: 800, oneBedroomMax: 1500, twoBedroomMin: 1200, twoBedroomMax: 2200, currency: 'EUR' },
    'Madrid': { oneBedroomMin: 750, oneBedroomMax: 1400, twoBedroomMin: 1100, twoBedroomMax: 2000, currency: 'EUR' },
    'default': { oneBedroomMin: 600, oneBedroomMax: 1200, twoBedroomMin: 900, twoBedroomMax: 1600, currency: 'EUR' }
  },
  'Mexico': {
    'Mexico City': { oneBedroomMin: 400, oneBedroomMax: 750, twoBedroomMin: 600, twoBedroomMax: 1200, currency: 'USD' },
    'default': { oneBedroomMin: 300, oneBedroomMax: 600, twoBedroomMin: 450, twoBedroomMax: 900, currency: 'USD' }
  },
  'Costa Rica': {
    'San José': { oneBedroomMin: 500, oneBedroomMax: 900, twoBedroomMin: 700, twoBedroomMax: 1300, currency: 'USD' },
    'default': { oneBedroomMin: 400, oneBedroomMax: 700, twoBedroomMin: 600, twoBedroomMax: 1000, currency: 'USD' }
  },
  'default': {
    'default': { oneBedroomMin: 800, oneBedroomMax: 1500, twoBedroomMin: 1200, twoBedroomMax: 2200, currency: 'USD' }
  }
};

// Function to analyze budget compatibility
function analyzeBudgetCompatibility(monthlyBudget: number, country: string, city?: string): string {
  const countryData = cityBudgetData[country] || cityBudgetData.default;
  const cityData = (city && countryData[city]) ? countryData[city] : countryData.default;

  // Convert budget to local currency if needed (simplified conversion for demo)
  let localBudget = monthlyBudget;
  if (cityData.currency === 'EUR') {
    localBudget = monthlyBudget * 0.92; // Approximate USD to EUR conversion
  }

  const cityName = city || country;
  const currencySymbol = cityData.currency === 'EUR' ? '€' : '$';

  // Check compatibility for 1-bedroom
  let budgetStatus = '';
  if (localBudget >= cityData.oneBedroomMax) {
    budgetStatus = `excellent - Your budget of $${monthlyBudget}/month (${currencySymbol}${Math.round(localBudget)}) comfortably covers premium 1-2 bedroom rentals in ${cityName}. Range: ${currencySymbol}${cityData.oneBedroomMin}-${cityData.oneBedroomMax}/month (1BR), ${currencySymbol}${cityData.twoBedroomMin}-${cityData.twoBedroomMax}/month (2BR).`;
  } else if (localBudget >= cityData.oneBedroomMin && localBudget < cityData.oneBedroomMax) {
    budgetStatus = `good - Your budget of $${monthlyBudget}/month (${currencySymbol}${Math.round(localBudget)}) covers most 1-bedroom apartments in ${cityName}. Range: ${currencySymbol}${cityData.oneBedroomMin}-${cityData.oneBedroomMax}/month (1BR). For 2-bedroom: ${currencySymbol}${cityData.twoBedroomMin}-${cityData.twoBedroomMax}/month.`;
  } else if (localBudget >= cityData.oneBedroomMin * 0.8) {
    budgetStatus = `tight - Your budget of $${monthlyBudget}/month (${currencySymbol}${Math.round(localBudget)}) may be challenging for ${cityName}. Consider smaller apartments or neighboring areas. Typical range: ${currencySymbol}${cityData.oneBedroomMin}-${cityData.oneBedroomMax}/month (1BR).`;
  } else {
    budgetStatus = `insufficient - Your budget of $${monthlyBudget}/month (${currencySymbol}${Math.round(localBudget)}) is below typical rental costs in ${cityName}. Consider increasing budget or exploring more affordable areas. Typical range: ${currencySymbol}${cityData.oneBedroomMin}-${cityData.oneBedroomMax}/month (1BR).`;
  }

  return budgetStatus;
}

// Assessment scoring algorithm
function calculateScore(assessment: any): { score: number; matchLevel: string; budgetCompatibility: string; criteriaScores: Record<string, number>; scoreReasons: string[] } | { error: boolean; message: string; details: string; climateConflict: any } {
  // Country scoring data
  const countryScores: { [key: string]: any } = {
    // Europe (South/Med)
    'Portugal': { immigration_policies: 4, healthcare: 4, safety: 4, internet: 4, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'mediterranean' },
    'Spain': { immigration_policies: 4, healthcare: 4, safety: 4, internet: 4, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'mediterranean' },
    'Italy': { immigration_policies: 3, healthcare: 4, safety: 4, internet: 3, emigration_process: 4, ease_of_immigration: 3, local_acceptance: 4, climate_type: 'mediterranean' },
    'Greece': { immigration_policies: 3, healthcare: 3, safety: 4, internet: 3, emigration_process: 4, ease_of_immigration: 3, local_acceptance: 4, climate_type: 'mediterranean' },
    'Turkey': { immigration_policies: 3, healthcare: 3, safety: 3, internet: 3, emigration_process: 3, ease_of_immigration: 3, local_acceptance: 4, climate_type: 'mediterranean' },

    // Europe (West/Central)
    'France': { immigration_policies: 3, healthcare: 5, safety: 4, internet: 4, emigration_process: 4, ease_of_immigration: 3, local_acceptance: 3, climate_type: 'temperate' },
    'Germany': { immigration_policies: 3, healthcare: 5, safety: 5, internet: 4, emigration_process: 4, ease_of_immigration: 3, local_acceptance: 3, climate_type: 'temperate' },
    'Netherlands': { immigration_policies: 3, healthcare: 5, safety: 5, internet: 5, emigration_process: 4, ease_of_immigration: 3, local_acceptance: 4, climate_type: 'temperate' },
    'Belgium': { immigration_policies: 3, healthcare: 5, safety: 4, internet: 4, emigration_process: 4, ease_of_immigration: 3, local_acceptance: 3, climate_type: 'temperate' },
    'Austria': { immigration_policies: 3, healthcare: 5, safety: 5, internet: 4, emigration_process: 4, ease_of_immigration: 3, local_acceptance: 3, climate_type: 'temperate' },
    'Switzerland': { immigration_policies: 2, healthcare: 5, safety: 5, internet: 5, emigration_process: 4, ease_of_immigration: 2, local_acceptance: 3, climate_type: 'temperate' },
    'United Kingdom': { immigration_policies: 3, healthcare: 4, safety: 4, internet: 5, emigration_process: 5, ease_of_immigration: 3, local_acceptance: 4, climate_type: 'temperate' },
    'Ireland': { immigration_policies: 3, healthcare: 4, safety: 5, internet: 4, emigration_process: 5, ease_of_immigration: 3, local_acceptance: 5, climate_type: 'temperate' },

    // Europe (North)
    'Denmark': { immigration_policies: 3, healthcare: 5, safety: 5, internet: 5, emigration_process: 4, ease_of_immigration: 3, local_acceptance: 4, climate_type: 'northern' },
    'Sweden': { immigration_policies: 3, healthcare: 5, safety: 5, internet: 5, emigration_process: 4, ease_of_immigration: 3, local_acceptance: 4, climate_type: 'northern' },
    'Norway': { immigration_policies: 3, healthcare: 5, safety: 5, internet: 5, emigration_process: 4, ease_of_immigration: 3, local_acceptance: 4, climate_type: 'northern' },
    'Finland': { immigration_policies: 3, healthcare: 5, safety: 5, internet: 5, emigration_process: 4, ease_of_immigration: 3, local_acceptance: 3, climate_type: 'northern' },

    // Europe (East)
    'Czech Republic': { immigration_policies: 4, healthcare: 4, safety: 5, internet: 4, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 3, climate_type: 'temperate' },
    'Hungary': { immigration_policies: 4, healthcare: 3, safety: 4, internet: 4, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 3, climate_type: 'temperate' },
    'Poland': { immigration_policies: 3, healthcare: 3, safety: 4, internet: 4, emigration_process: 4, ease_of_immigration: 3, local_acceptance: 3, climate_type: 'temperate' },
    'Romania': { immigration_policies: 4, healthcare: 3, safety: 4, internet: 5, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 3, climate_type: 'temperate' },
    'Ukraine': { immigration_policies: 2, healthcare: 2, safety: 1, internet: 3, emigration_process: 3, ease_of_immigration: 2, local_acceptance: 3, climate_type: 'temperate' },

    // Americas (North/Central)
    'Canada': { immigration_policies: 4, healthcare: 4, safety: 5, internet: 5, emigration_process: 5, ease_of_immigration: 4, local_acceptance: 5, climate_type: 'seasonal' },
    'Mexico': { immigration_policies: 4, healthcare: 3, safety: 2, internet: 3, emigration_process: 5, ease_of_immigration: 5, local_acceptance: 4, climate_type: 'tropical' },
    'Costa Rica': { immigration_policies: 4, healthcare: 4, safety: 4, internet: 3, emigration_process: 5, ease_of_immigration: 4, local_acceptance: 5, climate_type: 'tropical' },
    'Panama': { immigration_policies: 5, healthcare: 4, safety: 4, internet: 4, emigration_process: 5, ease_of_immigration: 5, local_acceptance: 4, climate_type: 'tropical' },
    'Belize': { immigration_policies: 4, healthcare: 2, safety: 3, internet: 2, emigration_process: 5, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'tropical' },
    'Dominican Republic': { immigration_policies: 4, healthcare: 3, safety: 3, internet: 3, emigration_process: 5, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'tropical' },
    'Puerto Rico': { immigration_policies: 5, healthcare: 4, safety: 3, internet: 4, emigration_process: 5, ease_of_immigration: 5, local_acceptance: 4, climate_type: 'tropical' },
    'Jamaica': { immigration_policies: 4, healthcare: 3, safety: 2, internet: 3, emigration_process: 5, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'tropical' },
    'Cuba': { immigration_policies: 2, healthcare: 4, safety: 4, internet: 1, emigration_process: 2, ease_of_immigration: 2, local_acceptance: 4, climate_type: 'tropical' },
    'Haiti': { immigration_policies: 3, healthcare: 1, safety: 1, internet: 1, emigration_process: 3, ease_of_immigration: 3, local_acceptance: 3, climate_type: 'tropical' },

    // Americas (South)
    'Colombia': { immigration_policies: 4, healthcare: 4, safety: 3, internet: 3, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 5, climate_type: 'tropical' },
    'Ecuador': { immigration_policies: 4, healthcare: 3, safety: 3, internet: 3, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'tropical' },
    'Brazil': { immigration_policies: 3, healthcare: 3, safety: 2, internet: 4, emigration_process: 4, ease_of_immigration: 3, local_acceptance: 5, climate_type: 'tropical' },
    'Argentina': { immigration_policies: 4, healthcare: 4, safety: 3, internet: 4, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'temperate' },
    'Chile': { immigration_policies: 4, healthcare: 4, safety: 5, internet: 4, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'seasonal' },
    'Uruguay': { immigration_policies: 4, healthcare: 4, safety: 5, internet: 4, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'temperate' },
    'Peru': { immigration_policies: 4, healthcare: 3, safety: 3, internet: 3, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'tropical' },
    'Bolivia': { immigration_policies: 4, healthcare: 2, safety: 3, internet: 2, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'tropical' },
    'Paraguay': { immigration_policies: 5, healthcare: 3, safety: 4, internet: 3, emigration_process: 4, ease_of_immigration: 5, local_acceptance: 4, climate_type: 'tropical' },
    'Venezuela': { immigration_policies: 2, healthcare: 2, safety: 1, internet: 2, emigration_process: 3, ease_of_immigration: 2, local_acceptance: 4, climate_type: 'tropical' },

    // Asia/Pacific
    'Thailand': { immigration_policies: 4, healthcare: 4, safety: 4, internet: 4, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 5, climate_type: 'tropical' },
    'Malaysia': { immigration_policies: 4, healthcare: 4, safety: 4, internet: 4, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'tropical' },
    'Vietnam': { immigration_policies: 4, healthcare: 3, safety: 4, internet: 3, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'tropical' },
    'Philippines': { immigration_policies: 4, healthcare: 3, safety: 3, internet: 3, emigration_process: 5, ease_of_immigration: 4, local_acceptance: 5, climate_type: 'tropical' },
    'Indonesia': { immigration_policies: 4, healthcare: 3, safety: 3, internet: 3, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'tropical' },
    'Japan': { immigration_policies: 2, healthcare: 5, safety: 5, internet: 5, emigration_process: 4, ease_of_immigration: 2, local_acceptance: 2, climate_type: 'temperate' },
    'South Korea': { immigration_policies: 2, healthcare: 5, safety: 5, internet: 5, emigration_process: 4, ease_of_immigration: 2, local_acceptance: 3, climate_type: 'temperate' },
    'Singapore': { immigration_policies: 2, healthcare: 5, safety: 5, internet: 5, emigration_process: 4, ease_of_immigration: 2, local_acceptance: 4, climate_type: 'tropical' },
    'China': { immigration_policies: 2, healthcare: 3, safety: 4, internet: 4, emigration_process: 3, ease_of_immigration: 2, local_acceptance: 3, climate_type: 'temperate' },
    'India': { immigration_policies: 3, healthcare: 3, safety: 3, internet: 3, emigration_process: 4, ease_of_immigration: 3, local_acceptance: 4, climate_type: 'tropical' },
    'Pakistan': { immigration_policies: 3, healthcare: 2, safety: 2, internet: 2, emigration_process: 3, ease_of_immigration: 3, local_acceptance: 3, climate_type: 'dry' },
    'Bangladesh': { immigration_policies: 3, healthcare: 2, safety: 2, internet: 2, emigration_process: 3, ease_of_immigration: 3, local_acceptance: 3, climate_type: 'tropical' },
    'Sri Lanka': { immigration_policies: 4, healthcare: 3, safety: 3, internet: 3, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'tropical' },

    'Australia': { immigration_policies: 3, healthcare: 5, safety: 5, internet: 4, emigration_process: 5, ease_of_immigration: 3, local_acceptance: 5, climate_type: 'mediterranean' },
    'New Zealand': { immigration_policies: 3, healthcare: 5, safety: 5, internet: 4, emigration_process: 5, ease_of_immigration: 3, local_acceptance: 5, climate_type: 'temperate' },

    // Middle East / Africa
    'UAE': { immigration_policies: 4, healthcare: 5, safety: 5, internet: 5, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 3, climate_type: 'dry' },
    'Saudi Arabia': { immigration_policies: 3, healthcare: 4, safety: 4, internet: 4, emigration_process: 3, ease_of_immigration: 3, local_acceptance: 3, climate_type: 'dry' },
    'Egypt': { immigration_policies: 3, healthcare: 2, safety: 3, internet: 3, emigration_process: 4, ease_of_immigration: 3, local_acceptance: 4, climate_type: 'dry' },
    'Morocco': { immigration_policies: 3, healthcare: 3, safety: 4, internet: 3, emigration_process: 4, ease_of_immigration: 3, local_acceptance: 4, climate_type: 'mediterranean' },
    'South Africa': { immigration_policies: 3, healthcare: 4, safety: 2, internet: 3, emigration_process: 4, ease_of_immigration: 3, local_acceptance: 4, climate_type: 'mediterranean' },
    'Ghana': { immigration_policies: 4, healthcare: 2, safety: 3, internet: 2, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 5, climate_type: 'tropical' },
    'Nigeria': { immigration_policies: 3, healthcare: 2, safety: 2, internet: 3, emigration_process: 3, ease_of_immigration: 3, local_acceptance: 3, climate_type: 'tropical' },
    'Kenya': { immigration_policies: 4, healthcare: 2, safety: 2, internet: 3, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'tropical' },
    'Tanzania': { immigration_policies: 4, healthcare: 1, safety: 3, internet: 2, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'tropical' },
    'Uganda': { immigration_policies: 4, healthcare: 1, safety: 3, internet: 2, emigration_process: 4, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'tropical' },
    'Ethiopia': { immigration_policies: 3, healthcare: 1, safety: 2, internet: 2, emigration_process: 3, ease_of_immigration: 3, local_acceptance: 3, climate_type: 'dry' },
    'Senegal': { immigration_policies: 3, healthcare: 2, safety: 3, internet: 2, emigration_process: 3, ease_of_immigration: 3, local_acceptance: 4, climate_type: 'tropical' },
    'Zimbabwe': { immigration_policies: 3, healthcare: 2, safety: 3, internet: 2, emigration_process: 3, ease_of_immigration: 3, local_acceptance: 4, climate_type: 'tropical' },

    // Caribbean & Others
    'Antigua and Barbuda': { immigration_policies: 4, healthcare: 3, safety: 4, internet: 3, emigration_process: 5, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'tropical' },
    'Aruba': { immigration_policies: 4, healthcare: 4, safety: 5, internet: 4, emigration_process: 5, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'dry' },
    'Bahamas': { immigration_policies: 4, healthcare: 4, safety: 3, internet: 4, emigration_process: 5, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'tropical' },
    'Barbados': { immigration_policies: 5, healthcare: 4, safety: 4, internet: 4, emigration_process: 5, ease_of_immigration: 5, local_acceptance: 4, climate_type: 'tropical' },
    'Grenada': { immigration_policies: 4, healthcare: 3, safety: 4, internet: 3, emigration_process: 5, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'tropical' },
    'Saint Lucia': { immigration_policies: 4, healthcare: 3, safety: 4, internet: 3, emigration_process: 5, ease_of_immigration: 4, local_acceptance: 4, climate_type: 'tropical' },
    'St. Thomas': { immigration_policies: 5, healthcare: 4, safety: 3, internet: 4, emigration_process: 5, ease_of_immigration: 5, local_acceptance: 4, climate_type: 'tropical' },
    'Trinidad and Tobago': { immigration_policies: 3, healthcare: 3, safety: 3, internet: 4, emigration_process: 4, ease_of_immigration: 3, local_acceptance: 4, climate_type: 'tropical' },
    'Angola': { immigration_policies: 2, healthcare: 1, safety: 2, internet: 2, emigration_process: 3, ease_of_immigration: 2, local_acceptance: 3, climate_type: 'tropical' },
    'Algeria': { immigration_policies: 2, healthcare: 2, safety: 2, internet: 2, emigration_process: 3, ease_of_immigration: 2, local_acceptance: 3, climate_type: 'mediterranean' },
    'Cameroon': { immigration_policies: 3, healthcare: 1, safety: 2, internet: 2, emigration_process: 3, ease_of_immigration: 3, local_acceptance: 3, climate_type: 'tropical' },
    'Côte d\'Ivoire': { immigration_policies: 3, healthcare: 1, safety: 2, internet: 2, emigration_process: 3, ease_of_immigration: 3, local_acceptance: 3, climate_type: 'tropical' },
    'DR Congo': { immigration_policies: 2, healthcare: 1, safety: 1, internet: 1, emigration_process: 3, ease_of_immigration: 2, local_acceptance: 3, climate_type: 'tropical' },
    'Liberia': { immigration_policies: 3, healthcare: 1, safety: 2, internet: 1, emigration_process: 3, ease_of_immigration: 3, local_acceptance: 4, climate_type: 'tropical' },
    'Sudan': { immigration_policies: 2, healthcare: 1, safety: 1, internet: 1, emigration_process: 3, ease_of_immigration: 2, local_acceptance: 3, climate_type: 'dry' },

    'default': {
      immigration_policies: 3,
      healthcare: 3,
      safety: 3,
      internet: 3,
      emigration_process: 3,
      ease_of_immigration: 3,
      local_acceptance: 3,
      climate_type: 'temperate',
    }
  };

  const countryData = countryScores[assessment.preferred_country] || countryScores.default;

  const factors = [
    'immigration_policies',
    'healthcare',
    'safety',
    'internet',
    'emigration_process',
    'ease_of_immigration',
    'local_acceptance'
  ];

  // Check for complete climate mismatches
  let climateMatchType = 'mismatch';

  if (assessment.climate_preference === countryData.climate_type) {
    climateMatchType = 'perfect';
  } else {
    // Define climate compatibility rules
    const climateCompatibility: { [key: string]: string[] } = {
      'tropical': ['temperate'],
      'seasonal': ['temperate', 'northern'],
      'dry': ['mediterranean'],
      'mediterranean': ['temperate', 'dry'],
      'temperate': ['seasonal', 'mediterranean', 'tropical'],
      'northern': ['seasonal']
    };

    const compatibleClimates = climateCompatibility[assessment.climate_preference] || [];
    if (compatibleClimates.includes(countryData.climate_type)) {
      climateMatchType = 'partial';
    } else {
      climateMatchType = 'complete_mismatch';
    }
  }

  // Return error for complete climate mismatches
  if (climateMatchType === 'complete_mismatch') {
    console.log(`🚫 COMPLETE CLIMATE MISMATCH DETECTED: ${assessment.climate_preference} vs ${countryData.climate_type}`);
    return {
      error: true,
      message: "Climate and country selected are incompatible. Please reconsider your climate preference or choose a different destination.",
      details: `You selected "${assessment.climate_preference}" climate but ${assessment.preferred_country} has a "${countryData.climate_type}" climate. These are fundamentally incompatible.`,
      climateConflict: {
        userPreference: assessment.climate_preference,
        countryClimate: countryData.climate_type,
        country: assessment.preferred_country
      }
    };
  }

  // Calculate score
  let weightedScore = 0;
  let totalImportanceWeight = 0;

  const criteriaScores: Record<string, number> = {};
  const scoreReasons: string[] = [];
  const factorLabels: Record<string, string> = {
    immigration_policies: 'Immigration policies', healthcare: 'Healthcare quality',
    safety: 'Safety and security', internet: 'High-speed internet',
    emigration_process: 'USA emigration process', ease_of_immigration: 'Ease of immigration',
    local_acceptance: 'Local acceptance'
  };

  factors.forEach(factor => {
    const importance = assessment[`${factor}_importance`];
    const countryScore = countryData[factor];
    const cappedCountryScore = Math.max(0, Math.min(4, Number(countryScore) || 0));

    let importanceWeight = Math.pow(importance, 1.5);

    // Age weighting booster for seniors (60+)
    if (assessment.user_age >= 60 && (factor === 'healthcare' || factor === 'safety')) {
      importanceWeight *= 2.0;
    }

    const factorScore = (cappedCountryScore / 4) * importanceWeight;

    weightedScore += factorScore;
    totalImportanceWeight += importanceWeight;

    // Store individual criteria score (0-100)
    criteriaScores[factor] = Math.min(100, (cappedCountryScore / 4) * 100);
    if (cappedCountryScore < 4) {
      scoreReasons.push(`${factorLabels[factor]} is rated ${cappedCountryScore}/4 for ${assessment.preferred_country}, below the top compatibility rating.`);
    }
  });

  // Add climate scoring
  let climateScore = 0;
  if (climateMatchType === 'perfect') {
    climateScore = 5;
  } else if (climateMatchType === 'partial') {
    climateScore = 3;
    scoreReasons.push(`Your ${assessment.climate_preference} climate preference is only a partial match for ${assessment.preferred_country}'s ${countryData.climate_type} climate.`);
  }

  const climateImportanceWeight = 8;
  const climateContribution = (climateScore / 5) * climateImportanceWeight;
  weightedScore += climateContribution;
  totalImportanceWeight += climateImportanceWeight;

  // Calculate final score
  const baseScore = (weightedScore / totalImportanceWeight) * 100;

  // Apply rural location penalties if applicable
  let finalScore = baseScore;
  if (assessment.location_preference === 'rural') {
    let totalRuralPenalty = 0;

    if (assessment.internet_importance >= 3) {
      totalRuralPenalty += Math.min(15, assessment.internet_importance * 3);
    }
    if (assessment.healthcare_importance >= 3) {
      totalRuralPenalty += Math.min(12, assessment.healthcare_importance * 2.5);
    }

    const maxTotalRuralPenalty = 45;
    totalRuralPenalty = Math.min(totalRuralPenalty, maxTotalRuralPenalty);
    finalScore -= totalRuralPenalty;
    if (totalRuralPenalty > 0) {
      const accessAreas = assessment.internet_importance >= 3 && assessment.healthcare_importance >= 3
        ? 'internet access and healthcare access'
        : assessment.internet_importance >= 3 ? 'internet access' : 'healthcare access';
      scoreReasons.push(`A rural location may make ${accessAreas} harder to match at the importance level you selected.`);
    }
  }

  finalScore = Math.round(Math.max(5, Math.min(100, finalScore)));

  // Determine match level
  let matchLevel = 'poor';
  if (finalScore >= 95) matchLevel = 'perfect';
  else if (finalScore >= 85) matchLevel = 'very_good';
  else if (finalScore >= 70) matchLevel = 'good';

  // Analyze budget compatibility
  const budgetCompatibility = analyzeBudgetCompatibility(
    assessment.monthly_budget || 2000,
    assessment.preferred_country,
    assessment.preferred_city
  );

  return { score: finalScore, matchLevel, budgetCompatibility, criteriaScores, scoreReasons };
}

// Create assessment endpoint
app.post("/api/assessments", zValidator("json", AssessmentSchema), async (c) => {
  try {
    const assessment = c.req.valid("json");

    // Log incoming assessment request for monitoring
    console.log('Assessment creation request:', {
      country: assessment.preferred_country,
      city: assessment.preferred_city,
      age: assessment.user_age,
      timestamp: new Date().toISOString()
    });

    const scoreResult = calculateScore(assessment);

    // Check if there was a climate compatibility error
    if ('error' in scoreResult) {
      return c.json({
        error: scoreResult.message,
        details: scoreResult.details,
        climateConflict: scoreResult.climateConflict,
        requiresReselection: true
      }, 400);
    }

    const { score, matchLevel, budgetCompatibility, criteriaScores } = scoreResult;

    // Set retention period (2 years from now)
    const retention_expires_at = new Date();
    retention_expires_at.setFullYear(retention_expires_at.getFullYear() + 2);

    const result = await c.env.DB.prepare(`
      INSERT INTO assessments (
        user_age, user_job, monthly_budget, children_count, children_ages, education_preferences,
        preferred_country, preferred_city, location_preference,
        climate_preference, immigration_policies_importance, healthcare_importance, safety_importance,
        internet_importance, emigration_process_importance, ease_of_immigration_importance,
        local_acceptance_importance, overall_score, match_level, budget_compatibility, retention_expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      assessment.user_age ?? 30,
      assessment.user_job ?? 'Test User',
      assessment.monthly_budget || 2000,
      assessment.children_count || 0,
      assessment.children_ages || null,
      assessment.education_preferences || null,
      assessment.preferred_country ?? 'Unknown',
      assessment.preferred_city || null,
      assessment.location_preference ?? 'city',
      assessment.climate_preference || null,
      assessment.immigration_policies_importance ?? 3,
      assessment.healthcare_importance ?? 3,
      assessment.safety_importance ?? 3,
      assessment.internet_importance ?? 3,
      assessment.emigration_process_importance ?? 3,
      assessment.ease_of_immigration_importance ?? 3,
      assessment.local_acceptance_importance ?? 3,
      score,
      matchLevel,
      budgetCompatibility,
      retention_expires_at.toISOString()
    ).run();

    const assessmentId = result.meta.last_row_id;

    console.log('Assessment created successfully:', {
      id: assessmentId,
      score,
      matchLevel,
      timestamp: new Date().toISOString()
    });

    return c.json({
      success: true,
      id: assessmentId,
      score,
      matchLevel,
      criteriaScores
    });
  } catch (error) {
    console.error("Error creating assessment:", error);

    // Return detailed error for debugging
    if (error instanceof z.ZodError) {
      return c.json({
        error: "Validation failed",
        details: error.errors,
        message: "The assessment data does not match the required schema"
      }, 400);
    }

    return c.json({
      error: "Failed to create assessment",
      message: error instanceof Error ? error.message : "Unknown error",
      details: String(error)
    }, 500);
  }
});

// CRM - Get all purchasers
app.get('/api/admin/crm/purchasers', adminAuth, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        r.id, r.email, r.session_code, r.assessment_id,
        CASE WHEN r.stripe_confirmed_at IS NOT NULL THEN 1 ELSE 0 END AS purchase_confirmed,
        COALESCE(r.is_active, 0) AS is_active,
        COALESCE(r.is_archived, 0) AS is_archived,
        r.created_at, r.expires_at, r.stripe_confirmed_at,
        a.preferred_country, a.preferred_city, a.overall_score
      FROM relocation_hub_access r
      LEFT JOIN assessments a ON r.assessment_id = a.id
      ORDER BY r.created_at DESC
    `).all();

    // Prevent caching of CRM data
    c.header('Cache-Control', 'no-store, no-cache, must-revalidate');
    c.header('Pragma', 'no-cache');

    return c.json({
      success: true,
      purchasers: results
    });
  } catch (error) {
    console.error('Error fetching CRM data:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch CRM data'
    }, 500);
  }
});

// CRM sales totals come from live, succeeded Stripe PaymentIntents for the
// report price. CRM contacts are captured before checkout and are not sales.
app.get('/api/admin/crm/sales-stats', adminAuth, async (c) => {
  try {
    const stats = await fetchStripeSalesStats(c.env);
    c.header('Cache-Control', 'no-store');
    return c.json({ success: true, ...stats });
  } catch (error) {
    console.error('Error fetching CRM sales stats:', error);
    return c.json({ success: false, error: 'Failed to load Stripe sales totals' }, 502);
  }
});

// CRM - Apply one action to multiple selected purchasers.
app.post('/api/admin/crm/purchasers/bulk', adminAuth, async (c) => {
  try {
    const body = await c.req.json();
    const action = body.action as unknown;
    const ids = Array.isArray(body.ids)
      ? Array.from(new Set(body.ids.map(Number))).filter(id => Number.isInteger(id) && id > 0)
      : [];

    if (!['archive', 'restore', 'delete'].includes(String(action))) {
      return c.json({ success: false, error: 'Invalid bulk action' }, 400);
    }
    if (ids.length === 0 || ids.length > 500) {
      return c.json({ success: false, error: 'Select between 1 and 500 customers' }, 400);
    }

    const statements = ids.map(id => action === 'delete'
      ? c.env.DB.prepare('DELETE FROM relocation_hub_access WHERE id = ?').bind(id)
      : c.env.DB.prepare('UPDATE relocation_hub_access SET is_archived = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .bind(action === 'archive' ? 1 : 0, id));
    const results = await c.env.DB.batch(statements);
    const affected = results.reduce((total, result) => total + (result.meta.changes || 0), 0);

    return c.json({ success: true, affected });
  } catch (error) {
    console.error('Error applying CRM bulk action:', error);
    return c.json({ success: false, error: 'Failed to apply bulk action' }, 500);
  }
});

// CRM - Update purchaser
app.put('/api/admin/crm/purchasers/:id', adminAuth, async (c) => {
  try {
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id <= 0) {
      return c.json({ success: false, error: 'Invalid purchaser ID' }, 400);
    }
    const body = await c.req.json();
    if (body.action === 'delete') {
      const result = await c.env.DB.prepare('DELETE FROM relocation_hub_access WHERE id = ?').bind(id).run();
      if (result.meta.changes === 0) {
        return c.json({ success: false, error: 'Purchaser not found' }, 404);
      }
      return c.json({ success: true, message: 'Purchaser deleted permanently' });
    }
    const { email, session_code, is_active, is_archived, purchase_confirmed } = body;

    if (!email || !session_code) {
      return c.json({
        success: false,
        error: 'Email and session code are required'
      }, 400);
    }

    // Update the purchaser record
    const result = await c.env.DB.prepare(`
      UPDATE relocation_hub_access
      SET email = ?,
          session_code = ?,
          is_active = ?,
          is_archived = ?,
          purchase_confirmed = ?
      WHERE id = ?
    `).bind(
      email.toLowerCase(),
      session_code,
      is_active ? 1 : 0,
      is_archived ? 1 : 0,
      purchase_confirmed ? 1 : 0,
      id
    ).run();

    if (result.meta.changes === 0) {
      return c.json({ success: false, error: 'Purchaser not found' }, 404);
    }

    return c.json({
      success: true,
      message: 'Purchaser updated successfully'
    });
  } catch (error) {
    console.error('Error updating purchaser:', error);
    return c.json({
      success: false,
      error: 'Failed to update purchaser'
    }, 500);
  }
});

// CRM - Delete purchaser permanently. POST is the primary action because some
// hosting proxies reject DELETE requests; DELETE remains for API compatibility.
const deletePurchaser = async (c: any) => {
  try {
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id <= 0) {
      return c.json({ success: false, error: 'Invalid purchaser ID' }, 400);
    }

    // Delete the purchaser record
    const result = await c.env.DB.prepare('DELETE FROM relocation_hub_access WHERE id = ?').bind(id).run();

    if (result.meta.changes === 0) {
      return c.json({ success: false, error: 'Purchaser not found' }, 404);
    }

    return c.json({
      success: true,
      message: 'Purchaser deleted permanently'
    });
  } catch (error) {
    console.error('Error deleting purchaser:', error);
    return c.json({
      success: false,
      error: 'Failed to delete purchaser'
    }, 500);
  }
};

app.post('/api/admin/crm/purchasers/:id/delete', adminAuth, deletePurchaser);
app.delete('/api/admin/crm/purchasers/:id', adminAuth, deletePurchaser);

// Blog Endpoints

// Public: Get all published posts
app.get('/api/blog/posts', async (c) => {
  try {
    // Ensure site_settings table exists
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `).run();

    // Check if we have already seeded
    const seededResult = await c.env.DB.prepare(
      'SELECT value FROM site_settings WHERE key = ?'
    ).bind('blog_seeded').first();
    const blogSeeded = seededResult ? seededResult.value === 'true' : false;

    let { results } = await c.env.DB.prepare(`
      SELECT id, title, slug, featured_image, featured_image_credit,
             featured_image_credit_url, featured_image_source_url,
             excerpt, published_date, author
      FROM blog_posts 
      WHERE is_published = 1 
      ORDER BY published_date DESC, created_at DESC
    `).all();

    // Auto-seed only if we haven't seeded before
    if (!blogSeeded) {
      // Check if ANY posts exist (published or draft) to decide on seeding
      // This prevents seeding conflicts if only drafts exist
      const totalCountResult = await c.env.DB.prepare('SELECT COUNT(*) as count FROM blog_posts').first();
      const totalCount = totalCountResult ? (totalCountResult.count as number) : 0;

      if (totalCount === 0) {
        console.log('Seeding initial blog posts...');
        const initialPosts = [
          {
            title: "Top 10 Countries for US Expats in 2024",
            slug: "top-10-countries-us-expats-2024",
            featured_image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
            body: "Discover the best destinations for Americans looking to move abroad, considering safety, healthcare, and cost of living. <br/><br/> 1. Portugal... <br/> 2. Costa Rica...",
            excerpt: "Discover the best destinations for Americans looking to move abroad, considering safety, healthcare, and cost of living.",
            published_date: new Date().toISOString(),
            is_published: 1,
            allow_comments: 1,
            author: "Emigration Pro Team"
          },
          {
            title: "The Ultimate Guide to Digital Nomad Visas",
            slug: "ultimate-guide-digital-nomad-visas",
            featured_image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
            body: "Learn which countries offer the best digital nomad visas and how to apply for them to work remotely from paradise. <br/><br/> Digital nomad visas are becoming increasingly popular...",
            excerpt: "Learn which countries offer the best digital nomad visas and how to apply for them to work remotely from paradise.",
            published_date: new Date().toISOString(),
            is_published: 1,
            allow_comments: 1,
            author: "Emigration Pro Team"
          },
          {
            title: "Moving Abroad Checklist: What to Do Before You Go",
            slug: "moving-abroad-checklist",
            featured_image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
            body: "A comprehensive checklist to ensure a smooth transition to your new life abroad, from banking to packing. <br/><br/> 1. Visa... <br/> 2. Banking...",
            excerpt: "A comprehensive checklist to ensure a smooth transition to your new life abroad, from banking to packing.",
            published_date: new Date().toISOString(),
            is_published: 1,
            allow_comments: 1,
            author: "Emigration Pro Team"
          }
        ];

        for (const post of initialPosts) {
          // Use INSERT OR IGNORE to be extra safe against race conditions or partial failures
          await c.env.DB.prepare(`
            INSERT OR IGNORE INTO blog_posts (title, slug, featured_image, body, excerpt, published_date, is_published, allow_comments, author)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            post.title, post.slug, post.featured_image, post.body, post.excerpt,
            post.published_date, post.is_published, post.allow_comments, post.author
          ).run();
        }
      }

      // Mark as seeded in the database
      await c.env.DB.prepare(`
        INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)
      `).bind('blog_seeded', 'true').run();

      // Re-fetch
      const newResults = await c.env.DB.prepare(`
        SELECT id, title, slug, featured_image, featured_image_credit,
               featured_image_credit_url, featured_image_source_url,
               excerpt, published_date, author
        FROM blog_posts 
        WHERE is_published = 1 
        ORDER BY published_date DESC, created_at DESC
      `).all();
      results = newResults.results;
    }

    return c.json({ success: true, posts: results });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return c.json({ success: false, error: 'Failed to fetch posts' }, 500);
  }
});

// Public: Get single post by slug
app.get('/api/blog/posts/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const post = await c.env.DB.prepare(`
      SELECT * FROM blog_posts WHERE slug = ? AND is_published = 1
    `).bind(slug).first();

    if (!post) {
      return c.json({ success: false, error: 'Post not found' }, 404);
    }

    return c.json({ success: true, post });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return c.json({ success: false, error: 'Failed to fetch post' }, 500);
  }
});

// Admin: Get all posts
app.get('/api/admin/blog/posts', adminAuth, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM blog_posts ORDER BY created_at DESC
    `).all();
    return c.json({ success: true, posts: results });
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    return c.json({ success: false, error: 'Failed to fetch posts' }, 500);
  }
});

// Admin: Create post
app.post('/api/admin/blog/posts', adminAuth, async (c) => {
  try {
    const body = await c.req.json();
    const {
      title, slug, featured_image, featured_image_credit, featured_image_credit_url,
      featured_image_source_url, body: content, excerpt, published_date,
      is_published, allow_comments, author
    } = body;

    const normalizedSlug = normalizePublicSlug(slug || title);
    if (!normalizedSlug) {
      return c.json({ success: false, error: 'A valid title or slug is required' }, 400);
    }

    await c.env.DB.prepare(`
      INSERT INTO blog_posts (
        title, slug, featured_image, featured_image_credit, featured_image_credit_url,
        featured_image_source_url, body, excerpt, published_date, is_published,
        allow_comments, author
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      title, normalizedSlug, featured_image, featured_image_credit || null,
      featured_image_credit_url || null, featured_image_source_url || null,
      content, excerpt,
      published_date, is_published ? 1 : 0, allow_comments ? 1 : 0, author
    ).run();

    if (is_published) {
      queueIndexNow(c, [publicBlogUrl(normalizedSlug), `${SITE_ORIGIN}/blog`]);
    }

    return c.json({ success: true, slug: normalizedSlug });
  } catch (error) {
    console.error('Error creating post:', error);
    return c.json({ success: false, error: 'Failed to create post' }, 500);
  }
});

// Admin: Update post
app.put('/api/admin/blog/posts/:id', adminAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const {
      title, slug, featured_image, featured_image_credit, featured_image_credit_url,
      featured_image_source_url, body: content, excerpt, published_date,
      is_published, allow_comments, author
    } = body;

    const existing = await c.env.DB.prepare(
      'SELECT slug, is_published FROM blog_posts WHERE id = ?'
    ).bind(id).first<{ slug: string; is_published: number }>();
    if (!existing) {
      return c.json({ success: false, error: 'Post not found' }, 404);
    }

    const normalizedSlug = normalizePublicSlug(slug || title);
    if (!normalizedSlug) {
      return c.json({ success: false, error: 'A valid title or slug is required' }, 400);
    }

    await c.env.DB.prepare(`
      UPDATE blog_posts 
      SET title = ?, slug = ?, featured_image = ?, featured_image_credit = ?,
          featured_image_credit_url = ?, featured_image_source_url = ?, body = ?,
          excerpt = ?, published_date = ?, is_published = ?, allow_comments = ?,
          author = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      title, normalizedSlug, featured_image, featured_image_credit || null,
      featured_image_credit_url || null, featured_image_source_url || null,
      content, excerpt,
      published_date, is_published ? 1 : 0, allow_comments ? 1 : 0, author, id
    ).run();

    const changedUrls: string[] = [];
    if (existing.is_published) changedUrls.push(publicBlogUrl(existing.slug));
    if (is_published) changedUrls.push(publicBlogUrl(normalizedSlug));
    if (changedUrls.length > 0) {
      changedUrls.push(`${SITE_ORIGIN}/blog`);
      queueIndexNow(c, changedUrls);
    }

    return c.json({ success: true, slug: normalizedSlug });
  } catch (error) {
    console.error('Error updating post:', error);
    return c.json({ success: false, error: 'Failed to update post' }, 500);
  }
});

// Admin: Delete post
app.delete('/api/admin/blog/posts/:id', adminAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const existing = await c.env.DB.prepare(
      'SELECT slug, is_published FROM blog_posts WHERE id = ?'
    ).bind(id).first<{ slug: string; is_published: number }>();
    await c.env.DB.prepare('DELETE FROM blog_posts WHERE id = ?').bind(id).run();
    if (existing?.is_published) {
      queueIndexNow(c, [publicBlogUrl(existing.slug), `${SITE_ORIGIN}/blog`]);
    }
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return c.json({ success: false, error: 'Failed to delete post' }, 500);
  }
});

// Admin: Search Unsplash without exposing the application credential to the browser.
app.get('/api/admin/blog/unsplash/search', adminAuth, async (c) => {
  const accessKey = c.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return c.json({ error: 'Unsplash image search is not configured.' }, 503);
  }

  const query = (c.req.query('query') || '').trim();
  if (query.length < 2 || query.length > 100) {
    return c.json({ error: 'Search query must be between 2 and 100 characters.' }, 400);
  }

  try {
    const searchUrl = new URL('https://api.unsplash.com/search/photos');
    searchUrl.searchParams.set('query', query);
    searchUrl.searchParams.set('per_page', '20');
    searchUrl.searchParams.set('orientation', 'landscape');
    searchUrl.searchParams.set('content_filter', 'high');

    const response = await fetch(searchUrl.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('Unsplash search failed:', response.status, details);
      if (response.status === 401 || response.status === 403) {
        return c.json({ error: 'Unsplash credentials were rejected.' }, 502);
      }
      if (response.status === 429) {
        return c.json({ error: 'Unsplash search limit reached. Please try again later.' }, 429);
      }
      return c.json({ error: 'Unsplash image search is temporarily unavailable.' }, 502);
    }

    const data = await response.json() as any;
    const results = Array.isArray(data.results) ? data.results.map((photo: any) => ({
      id: String(photo.id || ''),
      imageUrl: String(photo.urls?.regular || ''),
      thumbnailUrl: String(photo.urls?.small || photo.urls?.regular || ''),
      alt: String(photo.alt_description || photo.description || 'Unsplash photo'),
      photographerName: String(photo.user?.name || photo.user?.username || 'Unsplash photographer'),
      photographerUrl: String(photo.user?.links?.html || ''),
      photoUrl: String(photo.links?.html || ''),
      downloadLocation: String(photo.links?.download_location || ''),
    })).filter((photo: any) => photo.id && photo.imageUrl && photo.downloadLocation) : [];

    return c.json({ success: true, results });
  } catch (error) {
    console.error('Unsplash proxy error:', error);
    return c.json({ error: 'Unsplash image search failed.' }, 500);
  }
});

// Unsplash requires the API download endpoint to be triggered when a user
// chooses a photo for use. The exact download_location URL is returned by the
// search response and is validated here before the server calls it.
app.post('/api/admin/blog/unsplash/track-download', adminAuth, async (c) => {
  const accessKey = c.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return c.json({ error: 'Unsplash image search is not configured.' }, 503);
  }

  const { downloadLocation } = await c.req.json().catch(() => ({}));
  if (typeof downloadLocation !== 'string') {
    return c.json({ error: 'A valid Unsplash download location is required.' }, 400);
  }

  try {
    const trackingUrl = new URL(downloadLocation);
    const validPath = /^\/photos\/[A-Za-z0-9_-]+\/download$/.test(trackingUrl.pathname);
    if (trackingUrl.protocol !== 'https:' || trackingUrl.hostname !== 'api.unsplash.com' || !validPath) {
      return c.json({ error: 'Invalid Unsplash download location.' }, 400);
    }

    const response = await fetch(trackingUrl.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
    });

    if (!response.ok) {
      console.error('Unsplash download tracking failed:', response.status, await response.text());
      return c.json({ error: 'Unable to register the selected Unsplash image.' }, 502);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Unsplash tracking proxy error:', error);
    return c.json({ error: 'Unable to register the selected Unsplash image.' }, 500);
  }
});

// Get assessment result endpoint
app.get("/api/assessments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const result = await c.env.DB.prepare(
      "SELECT * FROM assessments WHERE id = ?"
    ).bind(id).first();

    if (!result) {
      return c.json({ error: "Assessment not found" }, 404);
    }

    // Check if assessment is still within retention period
    if (result.retention_expires_at) {
      const retentionExpiry = new Date(result.retention_expires_at as string);
      const now = new Date();

      if (now > retentionExpiry) {
        return c.json({
          error: "Assessment data has expired",
          message: "This assessment data is no longer available due to our two-year retention policy.",
          retentionExpired: true
        }, 410);
      }
    }

    const scoreResult = calculateScore(result);
    const scoreDetails = 'error' in scoreResult
      ? {}
      : { criteriaScores: scoreResult.criteriaScores, score_reasons: scoreResult.scoreReasons };

    return c.json({
      success: true,
      assessment: { ...result, ...scoreDetails }
    });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return c.json({ error: "Failed to fetch assessment" }, 500);
  }
});

// Landing point for Stripe's post-payment redirect.
//
// Stripe only substitutes {CHECKOUT_SESSION_ID} into the success URL, so it
// cannot hand back our assessment id directly. This resolves the session
// server-side, maps the buyer's email to their assessment, and forwards them
// into the report flow. Doing it here rather than in the browser means the
// buyer can pay on a different device to the one they browsed on.
app.get("/api/checkout-return", async (c) => {
  const SITE = "https://emigrationpro.com";
  const fail = (why: string) =>
    c.redirect(`${SITE}/?payment_success=true&report_error=${encodeURIComponent(why)}`, 302);

  try {
    const sessionId = c.req.query("session_id");
    if (!sessionId) return fail("missing_session");

    const stripeKey = c.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error("checkout-return: STRIPE_SECRET_KEY is not set");
      return fail("not_configured");
    }

    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      { headers: { Authorization: `Bearer ${stripeKey}` } }
    );

    if (!stripeRes.ok) {
      console.error("checkout-return: Stripe lookup failed", stripeRes.status, await stripeRes.text());
      return fail("session_lookup_failed");
    }

    const session = await stripeRes.json() as any;

    // Only unlock the report for a session Stripe considers paid.
    if (session.payment_status !== "paid") {
      console.warn(`checkout-return: session ${sessionId} payment_status=${session.payment_status}`);
      return fail("not_paid");
    }

    const email: string | undefined =
      session.customer_details?.email || session.customer_email || undefined;

    if (!email) {
      console.error(`checkout-return: no email on session ${sessionId}`);
      return fail("no_email");
    }

    // The email capture step immediately before checkout writes email_leads,
    // so the most recent row for this address is the assessment just purchased.
    let assessmentId: number | null = null;

    const lead = await c.env.DB.prepare(
      `SELECT assessment_id FROM email_leads
        WHERE lower(email) = lower(?) AND assessment_id IS NOT NULL
        ORDER BY id DESC LIMIT 1`
    ).bind(email).first();

    if (lead?.assessment_id) {
      assessmentId = Number(lead.assessment_id);
    } else {
      // Returning buyers may only exist on a prior hub access record.
      const access = await c.env.DB.prepare(
        `SELECT assessment_id FROM relocation_hub_access
          WHERE lower(email) = lower(?) AND assessment_id IS NOT NULL
          ORDER BY id DESC LIMIT 1`
      ).bind(email).first();

      if (access?.assessment_id) assessmentId = Number(access.assessment_id);
    }

    if (!assessmentId) {
      console.error(`checkout-return: no assessment found for ${email}`);
      return c.redirect(
        `${SITE}/?payment_success=true&report_error=no_assessment&email=${encodeURIComponent(email)}`,
        302
      );
    }

    return c.redirect(
      `${SITE}/checkout-report?payment_success=true&assessment_id=${assessmentId}&email=${encodeURIComponent(email)}&session_id=${encodeURIComponent(sessionId)}`,
      302
    );
  } catch (error) {
    console.error("checkout-return failed:", error);
    return fail("unexpected_error");
  }
});

// Persist one generated report section.
//
// Called as each section finishes rather than once at the end, so a buyer who
// closes the tab keeps everything generated so far. The UNIQUE constraint on
// (assessment_id, concern_id) makes this an upsert: regenerating a section
// replaces it instead of creating a duplicate.
app.post("/api/reports/:assessmentId/sections", async (c) => {
  try {
    const assessmentId = parseInt(c.req.param("assessmentId"), 10);
    if (!Number.isFinite(assessmentId)) {
      return c.json({ error: "Invalid assessment id" }, 400);
    }

    const body = await c.req.json();
    const { concern_id, title, content, sources, profile_fingerprint } = body || {};

    if (!concern_id || !title || !content || !profile_fingerprint) {
      return c.json({ error: "concern_id, title, content and profile_fingerprint are required" }, 400);
    }

    await c.env.DB.prepare(
      `INSERT INTO report_sections (assessment_id, concern_id, title, content, sources, profile_fingerprint)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(assessment_id, concern_id) DO UPDATE SET
          title = excluded.title,
          content = excluded.content,
          sources = excluded.sources,
          profile_fingerprint = excluded.profile_fingerprint,
          updated_at = CURRENT_TIMESTAMP`
    ).bind(
      assessmentId,
      concern_id,
      title,
      content,
      sources ? JSON.stringify(sources) : null,
      profile_fingerprint
    ).run();

    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving report section:", error);
    return c.json({ error: "Failed to save report section" }, 500);
  }
});

// Return every section stored for an assessment, oldest first.
//
// Used on load to resume a part-finished report, and by the hub to re-serve a
// completed one, so a buyer can come back to it indefinitely.
app.get("/api/reports/:assessmentId/sections", async (c) => {
  try {
    const assessmentId = parseInt(c.req.param("assessmentId"), 10);
    if (!Number.isFinite(assessmentId)) {
      return c.json({ error: "Invalid assessment id" }, 400);
    }

    const profileFingerprint = c.req.query("profile_fingerprint");
    if (!profileFingerprint) {
      return c.json({ error: "profile_fingerprint is required" }, 400);
    }

    const result = await c.env.DB.prepare(
      `SELECT concern_id, title, content, sources, updated_at
         FROM report_sections
        WHERE assessment_id = ? AND profile_fingerprint = ?
        ORDER BY id ASC`
    ).bind(assessmentId, profileFingerprint).all();

    const sections = (result.results || []).map((row: any) => ({
      id: row.concern_id,
      title: row.title,
      content: row.content,
      sources: (() => {
        try {
          const parsed = row.sources ? JSON.parse(row.sources) : [];
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })()
    }));

    // Older reports may contain citations saved before link-health validation
    // was introduced. Validate all unique URLs as one bounded batch, then
    // remove confirmed failures while preserving section and source order.
    const uniqueSources = Array.from(new Map(
      sections.flatMap(section => section.sources)
        .filter((source: any) => source && typeof source.uri === 'string')
        .map((source: ReportSource) => [source.uri, source])
    ).values()) as ReportSource[];
    const reachableSources = await filterReachableSources(uniqueSources, c.env.REPORTS_KV);
    const reachableUris = new Set(reachableSources.map(source => source.uri));
    const validatedSections = sections.map(section => ({
      ...section,
      sources: section.sources.filter((source: ReportSource) => reachableUris.has(source.uri))
    }));

    return c.json({ success: true, sections: validatedSections });
  } catch (error) {
    console.error("Error fetching report sections:", error);
    return c.json({ error: "Failed to fetch report sections" }, 500);
  }
});

// Send a one-time "your report is ready" recovery email carrying a direct
// link back to /checkout-report. Report content already survives a closed
// tab (report_sections + the resume logic above); this closes the remaining
// gap, which is that the buyer has no way to find their way back to it.
//
// Idempotent by design: the UPDATE only succeeds once per assessment
// (recovery_email_sent_at starts NULL and is set atomically), so calling
// this endpoint repeatedly — e.g. because the buyer reloads a finished
// report — never sends a second copy.
const SendRecoveryEmailSchema = z.object({
  email: z.string().trim().email()
});

async function assessmentBelongsToEmail(env: Env, assessmentId: number, email: string): Promise<boolean> {
  const owner = await env.DB.prepare(
    `SELECT 1 FROM email_leads
      WHERE assessment_id = ? AND lower(email) = lower(?)
     UNION ALL
     SELECT 1 FROM relocation_hub_access
      WHERE assessment_id = ? AND lower(email) = lower(?)
     LIMIT 1`
  ).bind(assessmentId, email, assessmentId, email).first();
  return Boolean(owner);
}

app.post("/api/reports/:assessmentId/send-recovery-email", zValidator("json", SendRecoveryEmailSchema), async (c) => {
  try {
    const assessmentId = parseInt(c.req.param("assessmentId"), 10);
    if (!Number.isFinite(assessmentId)) {
      return c.json({ error: "Invalid assessment id" }, 400);
    }
    const { email } = c.req.valid("json");

    const claim = await c.env.DB.prepare(
      `UPDATE assessments
          SET recovery_email_sent_at = CURRENT_TIMESTAMP
        WHERE id = ? AND recovery_email_sent_at IS NULL`
    ).bind(assessmentId).run();

    if (!claim.meta || claim.meta.changes === 0) {
      // Already sent (or the assessment doesn't exist) — no-op either way.
      return c.json({ success: true, alreadySent: true });
    }

    const result = await sendReportRecoveryEmail(email, assessmentId, c.env.RESEND_API_KEY);
    if (!result.success) {
      // The claim is already set, so we won't retry automatically. Log for
      // manual follow-up rather than failing the request — the buyer's
      // report itself is unaffected either way.
      console.warn('Failed to send report recovery email:', result.error);
    }

    return c.json({ success: true, alreadySent: false, emailSent: result.success });
  } catch (error) {
    console.error("Error sending report recovery email:", error);
    return c.json({ error: "Failed to send recovery email" }, 500);
  }
});

// One-time notice sent when all automatic generation retries are exhausted.
// It reassures the buyer that no second payment is required and gives them a
// direct resume link. The ownership check prevents this endpoint being used as
// an arbitrary email sender.
app.post("/api/reports/:assessmentId/send-generation-failure-email", zValidator("json", SendRecoveryEmailSchema), async (c) => {
  try {
    const assessmentId = parseInt(c.req.param("assessmentId"), 10);
    if (!Number.isFinite(assessmentId)) return c.json({ error: "Invalid assessment id" }, 400);

    const { email } = c.req.valid("json");
    if (!await assessmentBelongsToEmail(c.env, assessmentId, email)) {
      return c.json({ error: "Assessment and email do not match" }, 403);
    }

    const claim = await c.env.DB.prepare(
      `UPDATE assessments
          SET generation_failure_email_sent_at = CURRENT_TIMESTAMP
        WHERE id = ? AND generation_failure_email_sent_at IS NULL`
    ).bind(assessmentId).run();

    if (!claim.meta || claim.meta.changes === 0) {
      return c.json({ success: true, alreadySent: true });
    }

    const result = await sendGenerationFailureEmail(email, assessmentId, c.env.RESEND_API_KEY);
    if (!result.success) {
      // Release the claim so a later failure can retry delivery.
      await c.env.DB.prepare(
        `UPDATE assessments SET generation_failure_email_sent_at = NULL WHERE id = ?`
      ).bind(assessmentId).run();
      console.warn('Failed to send generation failure email:', result.error);
      return c.json({ error: "Email delivery failed" }, 502);
    }

    return c.json({ success: true, alreadySent: false });
  } catch (error) {
    console.error("Error sending generation failure email:", error);
    return c.json({ error: "Failed to send generation failure email" }, 500);
  }
});

// GET report preview summary
app.get("/api/assessments/:id/report-preview", async (c) => {
  try {
    const id = c.req.param("id");
    const assessment = await c.env.DB.prepare(
      "SELECT * FROM assessments WHERE id = ?"
    ).bind(id).first() as any;

    if (!assessment) {
      return c.json({ error: "Assessment not found" }, 404);
    }

    const GEMINI_API_KEY = c.env.GEMINI_API_KEY;
    let summary = "";

    if (GEMINI_API_KEY) {
      try {
        const prompt = `Generate a professional, encouraging paragraph summary (about 3-4 sentences) for an emigration report for someone moving from the US to ${assessment.preferred_country}${assessment.preferred_city ? ` (${assessment.preferred_city})` : ''}. 
        The user's overall compatibility score is ${assessment.overall_score}/100. 
        The report will cover subjects like immigration policies, healthcare, safety, and local acceptance.
        Focus on how the report will help them navigate these specific areas. 
        Do not include any placeholders like [Name]. Start directly with the summary.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const res = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          }),
        });

        if (res.ok) {
          const data: any = await res.json();
          summary = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      } catch (err) {
        console.error("Gemini summary error:", err);
      }
    }

    // Fallback if Gemini fails or is missing
    if (!summary) {
      summary = `Your personalized emigration report for ${assessment.preferred_country} is ready for generation. With a compatibility score of ${assessment.overall_score}/100, we've identified key areas where this destination aligns with your goals. The full report will cover detailed immigration requirements, healthcare transition plans, cost of living breakdowns for your budget, and specific steps to ensure a smooth relocation for you and your family.`;
    }

    return c.json({
      success: true,
      summary: summary.trim()
    });
  } catch (error) {
    console.error("Error generating preview:", error);
    return c.json({ error: "Failed to generate preview" }, 500);
  }
});

// Email sending helper function for relocation hub access
async function sendRelocationHubAccessEmail(
  email: string,
  sessionCode: string,
  resendApiKey: string | undefined,
  assessmentId: number
): Promise<{ success: boolean; error?: string }> {
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured, skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  // Determine the base URL based on deployment
  const baseUrl = 'https://emigration-pro.aiservices4biz.workers.dev';
  const hubAccessUrl = `${baseUrl}/access-hub`;

  const emailBody = {
    from: 'Emigration Pro <noreply@emigrationpro.com>',
    to: email,
    subject: 'Your Emigration Pro Relocation Hub Access Information',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #2563eb, #7c3aed); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Emigration Pro</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #1f2937; margin-top: 0;">
            Congratulations on your purchase of the personalized Emigration Pro Report. Here is your Relocation Hub access information, save it for future use.
          </p>
          
          <div style="background: white; border: 2px solid #2563eb; border-radius: 8px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 20px;">Your Relocation Hub Access Details</h3>
            
            <div style="margin-bottom: 20px;">
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px; font-weight: bold;">URL:</div>
              <div style="font-size: 16px; color: #2563eb;">
                <a href="${hubAccessUrl}" style="color: #2563eb; text-decoration: none; word-break: break-all;">${hubAccessUrl}</a>
              </div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px; font-weight: bold;">Email (ID):</div>
              <div style="font-size: 16px; color: #1f2937; font-family: monospace;">${email}</div>
            </div>
            
            <div style="margin-bottom: 0;">
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px; font-weight: bold;">Password (Session Code):</div>
              <div style="font-size: 18px; color: #2563eb; font-weight: bold; font-family: monospace; letter-spacing: 1px;">${sessionCode}</div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${hubAccessUrl}" 
               style="background: linear-gradient(to right, #2563eb, #7c3aed); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Access Your Relocation Hub
            </a>
          </div>
          
          <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin: 25px 0;">
            <p style="margin: 0; color: #991b1b;">
              <strong>⚠️ DO NOT REPLY TO THIS EMAIL</strong><br>
              This is an automated message from an unmonitored email address. 
              If you need assistance, please contact us at <a href="mailto:info@emigrationpro.com" style="color: #991b1b; text-decoration: underline;">info@emigrationpro.com</a>
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This access code provides 2 years of access to your relocation hub. Keep this information safe for future reference.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>© 2024 Emigration Pro. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `
Congratulations on your purchase of the personalized Emigration Pro Report. Here is your Relocation Hub access information, save it for future use.

Your Relocation Hub Access Details:

URL: ${hubAccessUrl}

Email (ID): ${email}

Password (Session Code): ${sessionCode}

Access Your Relocation Hub: ${hubAccessUrl}

⚠️ DO NOT REPLY TO THIS EMAIL
This is an automated message from an unmonitored email address. 
If you need assistance, please contact us at info@emigrationpro.com

This access code provides 2 years of access to your relocation hub. Keep this information safe for future reference.

© 2024 Emigration Pro. All rights reserved.
    `
  };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
    });

    const data = await response.json() as any;

    if (!response.ok) {
      console.error('Resend API error:', data);
      return { success: false, error: data.message || 'Failed to send email' };
    }

    console.log('Email sent successfully:', data.id);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Email sending helper: a direct link back to the buyer's finished report.
//
// report_sections persists every section as it's generated, and reloading
// /checkout-report with the same assessment_id + email resumes/re-shows the
// report at no extra cost (see the /api/reports/:assessmentId/sections
// routes). The only thing missing if a buyer closes the tab before
// downloading is a way back to that URL — this email is that way back.
async function sendReportRecoveryEmail(
  email: string,
  assessmentId: number,
  resendApiKey: string | undefined
): Promise<{ success: boolean; error?: string }> {
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured, skipping recovery email send');
    return { success: false, error: 'Email service not configured' };
  }

  const reportUrl = `https://emigrationpro.com/checkout-report?assessment_id=${assessmentId}&email=${encodeURIComponent(email)}&payment_success=true`;

  const emailBody = {
    from: 'Emigration Pro <noreply@emigrationpro.com>',
    to: email,
    subject: 'Your Emigration Pro Report Is Ready',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #2563eb, #7c3aed); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Emigration Pro</h1>
        </div>

        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #1f2937; margin-top: 0;">
            Your personalized relocation report has finished generating and is saved to your account. You can return to this link any time to view or download it &mdash; it does not expire.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${reportUrl}"
               style="background: linear-gradient(to right, #2563eb, #7c3aed); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              View Your Report
            </a>
          </div>

          <p style="color: #6b7280; font-size: 13px; word-break: break-all;">
            Or copy this link: <a href="${reportUrl}" style="color: #2563eb;">${reportUrl}</a>
          </p>

          <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin: 25px 0;">
            <p style="margin: 0; color: #991b1b;">
              <strong>⚠️ DO NOT REPLY TO THIS EMAIL</strong><br>
              This is an automated message from an unmonitored email address.
              If you need assistance, please contact us at <a href="mailto:info@emigrationpro.com" style="color: #991b1b; text-decoration: underline;">info@emigrationpro.com</a>
            </p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>© 2024 Emigration Pro. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `
Your personalized relocation report has finished generating and is saved to your account. You can return to this link any time to view or download it — it does not expire.

View Your Report: ${reportUrl}

⚠️ DO NOT REPLY TO THIS EMAIL
This is an automated message from an unmonitored email address.
If you need assistance, please contact us at info@emigrationpro.com

© 2024 Emigration Pro. All rights reserved.
    `
  };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
    });

    const data = await response.json() as any;

    if (!response.ok) {
      console.error('Resend API error (recovery email):', data);
      return { success: false, error: data.message || 'Failed to send email' };
    }

    console.log('Report recovery email sent successfully:', data.id);
    return { success: true };
  } catch (error) {
    console.error('Error sending recovery email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function sendGenerationFailureEmail(
  email: string,
  assessmentId: number,
  resendApiKey: string | undefined
): Promise<{ success: boolean; error?: string }> {
  if (!resendApiKey) return { success: false, error: 'Email service not configured' };

  const reportUrl = `https://emigrationpro.com/checkout-report?assessment_id=${assessmentId}&email=${encodeURIComponent(email)}&payment_success=true`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Emigration Pro <noreply@emigrationpro.com>',
      to: email,
      subject: 'Your report is saved — resume without paying again',
      html: `<p>We encountered a temporary problem while generating your Emigration Pro report.</p>
        <p><strong>You have already paid and will not be charged again.</strong> Every successfully completed section was saved.</p>
        <p><a href="${reportUrl}">Resume your report generation</a></p>
        <p>If the issue continues, contact <a href="mailto:info@emigrationpro.com">info@emigrationpro.com</a> and include assessment ${assessmentId}.</p>`,
      text: `We encountered a temporary problem while generating your Emigration Pro report. You have already paid and will not be charged again. Every successfully completed section was saved. Resume here: ${reportUrl}\n\nIf the issue continues, contact info@emigrationpro.com and include assessment ${assessmentId}.`
    })
  });

  if (!response.ok) {
    const body = await response.text();
    return { success: false, error: `Resend ${response.status}: ${body}` };
  }
  return { success: true };
}

// Diagnostic endpoint backing /admin/email-test. That page has existed and
// pointed at this exact path since it was built, but this route never did —
// every "Send Test Email" click has been hitting a 404, which is also why it
// never surfaced *why* purchase emails (sendRelocationHubAccessEmail /
// sendReportRecoveryEmail) weren't arriving: the one tool built to check that
// was itself broken. Deliberately unauthenticated to match how the frontend
// already calls it (SystemLogin's gate is client-side only); tighten this if
// abuse becomes a concern before public launch.
const TestSendEmailSchema = z.object({
  email: z.string().trim().email()
});

app.post("/api/test/send-email", zValidator("json", TestSendEmailSchema), async (c) => {
  const resendApiKey = c.env.RESEND_API_KEY;
  if (!resendApiKey) {
    // This is almost certainly why no purchase email has ever arrived.
    return c.json({ error: 'RESEND_API_KEY is not configured on this environment (wrangler secret put RESEND_API_KEY).' }, 500);
  }

  const { email } = c.req.valid("json");

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Emigration Pro <noreply@emigrationpro.com>',
        to: email,
        subject: 'Emigration Pro — Test Email',
        html: '<p>This is a test email from the Emigration Pro email diagnostics page. If you received this, Resend delivery is working.</p>',
        text: 'This is a test email from the Emigration Pro email diagnostics page. If you received this, Resend delivery is working.'
      }),
    });

    const data = await response.json() as any;

    if (!response.ok) {
      // Surface Resend's actual error (e.g. unverified sending domain,
      // invalid key, from-address not allowed) rather than swallowing it.
      console.error('Resend API error (test email):', data);
      return c.json({ error: data.message || `Resend API error: ${response.status}` }, 500);
    }

    return c.json({ success: true, messageId: data.id });
  } catch (error) {
    console.error('Error sending test email:', error);
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// Email gateway endpoint - For report generation app access
// Creates CRM record and returns a relative /checkout-report URL (staying on
// the caller's origin keeps sessionStorage, and so affiliate attribution, intact)
const EmailLeadSchema = z.object({
  email: z.string().email(),
  assessment_id: z.number().optional(),
  affiliate_code: z.string().optional().nullable()
});

app.post("/api/subscribe-for-permanent-access", zValidator("json", EmailLeadSchema), async (c) => {
  try {
    const { email, assessment_id, affiliate_code } = c.req.valid("json");
    const normalizedEmail = email.toLowerCase();

    // 1. Store email lead in email_leads table for tracking
    try {
      await c.env.DB.prepare(`
        INSERT INTO email_leads (email, assessment_id, source, affiliate_code)
        VALUES (?, ?, 'report_generation_gateway', ?)
      `).bind(
        normalizedEmail,
        assessment_id || null,
        affiliate_code || null
      ).run();
    } catch (leadError) {
      // Continue even if email_leads insert fails
      console.warn("Could not save to email_leads:", leadError);
    }

    // 2. Check if relocation_hub_access (CRM record) already exists for this email
    // If no assessment_id, we'll need to create a placeholder assessment or use null
    let existingAccess = null;

    if (assessment_id) {
      existingAccess = await c.env.DB.prepare(`
        SELECT * FROM relocation_hub_access 
        WHERE email = ? AND assessment_id = ?
      `).bind(normalizedEmail, assessment_id).first();
    }

    let sessionCode: string;
    let accessId: number = 0;
    let finalAssessmentId: number = assessment_id || 0;

    if (existingAccess) {
      // Use existing CRM record
      sessionCode = (existingAccess as any).session_code;
      accessId = (existingAccess as any).id;
      finalAssessmentId = (existingAccess as any).assessment_id;
      // Store affiliate code if not already set
      if (affiliate_code && !(existingAccess as any).affiliate_code) {
        await c.env.DB.prepare(
          "UPDATE relocation_hub_access SET affiliate_code = ? WHERE id = ?"
        ).bind(affiliate_code, accessId).run();
      }
      console.log(`Using existing CRM record for ${normalizedEmail}, session: ${sessionCode}`);
    } else {
      // 3. Generate unique session code (format: XXXX-XXXX-XXXX)
      const generateSessionCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const segments = [];
        for (let i = 0; i < 3; i++) {
          let segment = '';
          for (let j = 0; j < 4; j++) {
            segment += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          segments.push(segment);
        }
        return segments.join('-');
      };

      sessionCode = generateSessionCode();
      let attempts = 0;
      const maxAttempts = 10;

      // Ensure session code is unique
      while (attempts < maxAttempts) {
        const existing = await c.env.DB.prepare(
          "SELECT id FROM relocation_hub_access WHERE session_code = ?"
        ).bind(sessionCode).first();

        if (!existing) break;
        sessionCode = generateSessionCode();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        return c.json({ error: "Failed to generate unique session code" }, 500);
      }

      // 4. Create or find an assessment for CRM record
      // For report generation, we may not have an assessment yet, so create a minimal one if needed
      if (!finalAssessmentId || finalAssessmentId === 0) {
        // Create a minimal assessment record for CRM tracking (assessment_id is required)
        const newAssessment = await c.env.DB.prepare(`
          INSERT INTO assessments (created_at)
          VALUES (CURRENT_TIMESTAMP)
        `).run();

        finalAssessmentId = newAssessment.meta?.last_row_id || 0;

        if (!finalAssessmentId) {
          return c.json({ error: "Failed to create assessment record" }, 500);
        }
      }

      // 5. Set expiration (1 year from now)
      const expires_at = new Date();
      expires_at.setFullYear(expires_at.getFullYear() + 1);

      // 6. Create relocation_hub_access record in CRM (this is what CRM reads from)
      const result = await c.env.DB.prepare(`
        INSERT INTO relocation_hub_access (
          assessment_id, email, session_code, is_active, purchase_confirmed, expires_at, affiliate_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        finalAssessmentId,
        normalizedEmail,
        sessionCode,
        0, // is_active (inactive until purchase confirmed)
        0, // purchase_confirmed (false - they're accessing report generation)
        expires_at.toISOString(),
        affiliate_code || null
      ).run();

      accessId = result.meta?.last_row_id || 0;

      console.log(`Email gateway: Created CRM record for ${normalizedEmail}, session: ${sessionCode}, assessment: ${finalAssessmentId}`);
    }

    // 7. Return success with redirect URL to internal report generation route
    let reportAppUrl = "/checkout-report";
    const urlParams = new URLSearchParams();
    if (affiliate_code) {
      urlParams.append('ref', affiliate_code);
    }
    urlParams.append('assessment_id', finalAssessmentId.toString());
    urlParams.append('email', normalizedEmail);
    reportAppUrl += `?${urlParams.toString()}`;

    return c.json({
      success: true,
      message: "Email captured successfully. Redirecting to report generation...",
      session_code: sessionCode,
      access_id: accessId,
      email: normalizedEmail,
      // Redirect URL to report generation app
      report_url: reportAppUrl
    });
  } catch (error) {
    console.error("Error in email gateway:", error);
    return c.json({
      error: "Failed to process email",
      details: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// Admin cleanup endpoint
app.post("/api/admin/cleanup", async (c) => {
  try {
    const result = await runScheduledCleanup(c.env);
    return result;
  } catch (error) {
    console.error("Manual cleanup error:", error);
    return c.json({
      success: false,
      error: "Cleanup failed"
    }, 500);
  }
});

// Create permanent relocation hub access after purchase
const PermanentAccessSchema = z.object({
  assessment_id: z.number(),
  email: z.string().email(),
  stripe_session_id: z.string().startsWith('cs_')
});

app.post("/api/relocation-hub/create-access", zValidator("json", PermanentAccessSchema), async (c) => {
  try {
    const { assessment_id, email, stripe_session_id } = c.req.valid("json");
    const normalizedEmail = email.toLowerCase();

    // Never trust the browser to declare a purchase. Verify the Checkout
    // Session directly with Stripe and require its customer email to match.
    if (!c.env.STRIPE_SECRET_KEY) {
      return c.json({ error: 'Stripe verification is not configured' }, 503);
    }
    const stripeResponse = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(stripe_session_id)}`,
      { headers: { Authorization: `Bearer ${c.env.STRIPE_SECRET_KEY}` } }
    );
    if (!stripeResponse.ok) {
      return c.json({ error: 'Unable to verify Stripe checkout' }, 400);
    }
    const stripeSession = await stripeResponse.json() as any;
    const stripeEmail = String(stripeSession.customer_details?.email || stripeSession.customer_email || '').toLowerCase();
    if (stripeSession.payment_status !== 'paid' || stripeEmail !== normalizedEmail) {
      return c.json({ error: 'Stripe payment confirmation did not match this customer' }, 403);
    }

    // Log relocation hub access creation/update for monitoring
    console.log('Creating/updating relocation hub access:', {
      assessment_id,
      email: normalizedEmail,
      stripe_session_id,
      timestamp: new Date().toISOString()
    });

    // Check if access record already exists (from email capture)
    const existingAccess = await c.env.DB.prepare(`
      SELECT * FROM relocation_hub_access 
      WHERE email = ? AND assessment_id = ?
    `).bind(normalizedEmail, assessment_id).first();

    let sessionCode: string;

    if (existingAccess) {
      // UPDATE existing CRM record - activate it and confirm purchase
      sessionCode = (existingAccess as any).session_code;

      // Set expiration (2 years from now for permanent access)
      const expires_at = new Date();
      expires_at.setFullYear(expires_at.getFullYear() + 2);

      await c.env.DB.prepare(`
        UPDATE relocation_hub_access
        SET is_active = ?,
            purchase_confirmed = ?,
            stripe_session_id = ?,
            stripe_confirmed_at = CURRENT_TIMESTAMP,
            expires_at = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE email = ? AND assessment_id = ?
      `).bind(
        1, // is_active (activate it - purchase confirmed)
        1,
        stripe_session_id,
        expires_at.toISOString(),
        normalizedEmail,
        assessment_id
      ).run();

      console.log(`Updated existing CRM record for ${normalizedEmail}, session: ${sessionCode}, activated: true`);
    } else {
      // Create new record (if no existing record found - edge case)
      const generateSessionCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const segments = [];
        for (let i = 0; i < 3; i++) {
          let segment = '';
          for (let j = 0; j < 4; j++) {
            segment += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          segments.push(segment);
        }
        return segments.join('-');
      };

      sessionCode = generateSessionCode();
      let attempts = 0;
      const maxAttempts = 10;

      // Ensure session code is unique
      while (attempts < maxAttempts) {
        const existing = await c.env.DB.prepare(
          "SELECT id FROM relocation_hub_access WHERE session_code = ?"
        ).bind(sessionCode).first();

        if (!existing) break;
        sessionCode = generateSessionCode();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        return c.json({ error: "Failed to generate unique session code" }, 500);
      }

      // Set expiration (2 years from now for permanent access)
      const expires_at = new Date();
      expires_at.setFullYear(expires_at.getFullYear() + 2);

      // Create permanent access record
      await c.env.DB.prepare(`
        INSERT INTO relocation_hub_access (
          assessment_id, email, session_code, is_active, purchase_confirmed,
          stripe_session_id, stripe_confirmed_at, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
      `).bind(
        assessment_id,
        normalizedEmail,
        sessionCode,
        1, // is_active (active because purchase is confirmed)
        1,
        stripe_session_id,
        expires_at.toISOString()
      ).run();

      console.log('Created new relocation hub access record:', {
        assessment_id,
        session_code: sessionCode,
        email: normalizedEmail,
        timestamp: new Date().toISOString()
      });
    }

    // Extend assessment retention period to 2 years if purchase is confirmed
    // This ensures assessment data remains available for the full 2-year relocation hub access period
    {
      // Get current retention expiry date for the assessment
      const currentAssessment = await c.env.DB.prepare(
        "SELECT retention_expires_at FROM assessments WHERE id = ?"
      ).bind(assessment_id).first();

      if (currentAssessment) {
        // Calculate 2 years from now
        const twoYearsFromNow = new Date();
        twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);

        // Update assessment retention to 2 years (matching relocation hub access period)
        await c.env.DB.prepare(`
          UPDATE assessments 
          SET retention_expires_at = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(twoYearsFromNow.toISOString(), assessment_id).run();

        console.log(`Extended assessment ${assessment_id} retention period to 2 years for purchase`);
      }
    }

    // Affiliate conversions are recorded by the Stripe webhook in the affiliates
    // app (pages/api/webhooks/stripe.js), which is the only path with signed
    // proof of payment, the real payment intent ID, and the real amount charged.
    // Recording here as well would double-book every referred sale: this path
    // wrote a synthetic emipro_<timestamp>_<code> payment intent ID, so the
    // webhook's idempotency check could never match it.

    // Send email with relocation hub access information (only if purchase is confirmed)
    {
      const emailResult = await sendRelocationHubAccessEmail(
        normalizedEmail,
        sessionCode,
        c.env.RESEND_API_KEY,
        assessment_id
      );

      if (!emailResult.success) {
        // Log but don't fail the request - access is already created
        console.warn('Failed to send email to purchaser:', emailResult.error);
      } else {
        console.log('Purchase confirmation email sent successfully to:', normalizedEmail);
      }
    }

    return c.json({
      success: true,
      session_code: sessionCode,
      assessment_id: assessment_id,
      message: "Permanent relocation hub access created successfully"
    });
  } catch (error) {
    console.error("Error creating permanent access:", error);

    // Return detailed error for debugging
    if (error instanceof z.ZodError) {
      return c.json({
        error: "Validation failed",
        details: error.errors,
        message: "The access request data does not match the required schema"
      }, 400);
    }

    return c.json({
      error: "Failed to create permanent access",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// Access permanent relocation hub with email and session code
const AccessRequestSchema = z.object({
  email: z.string().email(),
  session_code: z.string().min(1)
});

app.post("/api/relocation-hub/access", zValidator("json", AccessRequestSchema), async (c) => {
  try {
    const { email, session_code } = c.req.valid("json");

    const access = await c.env.DB.prepare(`
      SELECT * FROM relocation_hub_access 
      WHERE email = ? AND session_code = ? AND is_active = 1
    `).bind(email.toLowerCase(), session_code.toUpperCase()).first();

    if (!access) {
      return c.json({
        error: "Invalid email or session code",
        success: false
      }, 404);
    }

    // Check if access has expired
    if (access.expires_at) {
      const expiryDate = new Date(access.expires_at as string);
      const now = new Date();

      if (now > expiryDate) {
        return c.json({
          error: "Access has expired",
          success: false
        }, 403);
      }
    }

    // Generate temporary access token (valid for this session)
    const accessToken = btoa(
      `${access.id}:${Date.now()}:${Math.random().toString(36).substring(7)}`
    );

    return c.json({
      success: true,
      assessment_id: access.assessment_id,
      access_token: accessToken,
      email: access.email,
      is_permanent: true
    });
  } catch (error) {
    console.error("Error accessing relocation hub:", error);
    return c.json({ error: "Failed to access relocation hub" }, 500);
  }
});

// Get videos for a relocation hub
app.get("/api/relocation-hub/:assessmentId/videos", async (c) => {
  try {
    const assessmentId = parseInt(c.req.param("assessmentId"));

    if (!assessmentId || isNaN(assessmentId)) {
      return c.json({ error: "Invalid assessment ID" }, 400);
    }

    // Fetch videos from database
    const videos = await c.env.DB.prepare(`
      SELECT 
        video_slot,
        video_id,
        title,
        channel_name,
        thumbnail_url,
        description,
        youtube_url,
        last_updated
      FROM relocation_hub_videos
      WHERE assessment_id = ?
      ORDER BY video_slot ASC
    `).bind(assessmentId).all();

    if (!videos.results || videos.results.length === 0) {
      // No videos stored yet, return empty array
      return c.json({
        success: true,
        videos: [],
        message: "No videos found. Videos will be generated on first access."
      });
    }

    return c.json({
      success: true,
      videos: videos.results
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return c.json({ error: "Failed to fetch videos" }, 500);
  }
});

// Initialize or update videos for a relocation hub (with Gemini smart curation)
app.post("/api/relocation-hub/:assessmentId/videos/update", async (c) => {
  try {
    const assessmentId = parseInt(c.req.param("assessmentId"));

    if (!assessmentId || isNaN(assessmentId)) {
      return c.json({ error: "Invalid assessment ID" }, 400);
    }

    // Get assessment details
    const assessment = await c.env.DB.prepare(
      "SELECT * FROM assessments WHERE id = ?"
    ).bind(assessmentId).first();

    if (!assessment) {
      return c.json({ error: "Assessment not found" }, 404);
    }

    const country = (assessment.preferred_country as string) || '';
    const city = assessment.preferred_city as string | undefined;

    // Check if YouTube and Gemini APIs are configured
    if (!c.env.YOUTUBE_API_KEY) {
      return c.json({ error: "YouTube API key not configured" }, 500);
    }

    const youtubeService = new YouTubeAPIService(c.env.YOUTUBE_API_KEY);

    // Video slot definitions matching RelocationHub.tsx structure
    const videoSlots = [
      {
        slot: 1,
        query: `american living in ${country}${city ? ` ${city}` : ''} expat experience`,
        title: `Living in ${country} as an American - My Experience`,
        description: `Personal story of relocating from the US to ${country}. Covers visa process, culture shock, and daily life.`
      },
      {
        slot: 2,
        query: `cost of living ${country}${city ? ` ${city}` : ''} vs USA comparison`,
        title: `Cost of Living in ${country} vs USA - Complete Breakdown`,
        description: `Detailed comparison of housing, food, transportation, and healthcare costs between ${country} and the United States.`
      },
      {
        slot: 3,
        query: `${country}${city ? ` ${city}` : ''} visa immigration process guide US citizen`,
        title: `${country} Immigration Process - Step by Step Guide`,
        description: `Complete walkthrough of visa requirements, documentation, and immigration process for US citizens moving to ${country}.`
      },
      {
        slot: 4,
        query: `healthcare system ${country}${city ? ` ${city}` : ''} expat guide`,
        title: `Healthcare System in ${country} - Expat Guide`,
        description: `Everything you need to know about healthcare, insurance, and medical services in ${country} for American expats.`
      },
      {
        slot: 5,
        query: `cultural differences ${country}${city ? ` ${city}` : ''} what Americans should know`,
        title: `Cultural Differences: What Americans Should Know About ${country}`,
        description: `Important cultural insights, social norms, and etiquette tips for Americans adapting to life in ${country}.`
      }
    ];

    // Add city-specific video if city is provided
    if (city) {
      videoSlots.push({
        slot: 6,
        query: `living in ${city} ${country} neighborhood guide expat`,
        title: `Living in ${city}, ${country} - Neighborhood Guide`,
        description: `Detailed guide to the best neighborhoods, amenities, and lifestyle in ${city} for international residents.`
      });
    }

    const updatedVideos = [];
    const errors = [];

    for (const slot of videoSlots) {
      try {
        // Get current video from database (if exists)
        const currentVideo = await c.env.DB.prepare(`
          SELECT * FROM relocation_hub_videos
          WHERE assessment_id = ? AND video_slot = ?
        `).bind(assessmentId, slot.slot).first();

        // Search YouTube for new videos
        const searchResults = await youtubeService.searchVideos({
          query: slot.query,
          maxResults: 10,
          order: 'relevance'
        });

        if (searchResults.length === 0) {
          errors.push(`No videos found for slot ${slot.slot}`);
          continue;
        }

        // Use Gemini to find best replacement
        let selectedVideo;

        if (currentVideo && c.env.GEMINI_API_KEY) {
          // Smart curation with Gemini
          const curated = await findBestVideoReplacement(
            {
              assessment_id: assessmentId,
              currentVideo: {
                video_id: currentVideo.video_id as string,
                title: currentVideo.title as string,
                channel_name: currentVideo.channel_name as string,
                description: currentVideo.description as string,
                video_slot: slot.slot
              },
              country,
              city
            },
            searchResults,
            c.env.GEMINI_API_KEY
          );

          if (curated && curated.confidence_score >= 60) {
            selectedVideo = curated;
          } else {
            // Confidence too low, use fallback (first result)
            selectedVideo = searchResults[0];
          }
        } else {
          // No Gemini or no current video - use first result
          selectedVideo = searchResults[0];
        }

        // Calculate next update date (6 months from now)
        const nextUpdateDate = new Date();
        nextUpdateDate.setMonth(nextUpdateDate.getMonth() + 6);

        // Insert or update video in database
        await c.env.DB.prepare(`
          INSERT INTO relocation_hub_videos (
            assessment_id, video_slot, video_id, title, channel_name, channel_id,
            thumbnail_url, description, youtube_url, last_updated, next_update_date, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(assessment_id, video_slot) DO UPDATE SET
            video_id = excluded.video_id,
            title = excluded.title,
            channel_name = excluded.channel_name,
            channel_id = excluded.channel_id,
            thumbnail_url = excluded.thumbnail_url,
            description = excluded.description,
            youtube_url = excluded.youtube_url,
            last_updated = CURRENT_TIMESTAMP,
            next_update_date = excluded.next_update_date,
            updated_at = CURRENT_TIMESTAMP
        `).bind(
          assessmentId,
          slot.slot,
          selectedVideo.video_id,
          selectedVideo.title,
          selectedVideo.channel_name,
          selectedVideo.channel_id,
          selectedVideo.thumbnail_url,
          selectedVideo.description,
          selectedVideo.youtube_url,
          nextUpdateDate.toISOString()
        ).run();

        updatedVideos.push({
          slot: slot.slot,
          title: selectedVideo.title,
          confidence: (selectedVideo as any).confidence_score || 100
        });
      } catch (error) {
        console.error(`Error updating video slot ${slot.slot}:`, error);
        errors.push(`Failed to update slot ${slot.slot}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return c.json({
      success: true,
      updated: updatedVideos.length,
      videos: updatedVideos,
      errors: errors.length > 0 ? errors : undefined,
      message: `Updated ${updatedVideos.length} video(s) for relocation hub`
    });
  } catch (error) {
    console.error("Error updating videos:", error);
    return c.json({
      error: "Failed to update videos",
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});



// Get all email leads
app.get("/api/admin/email-leads", async (c) => {
  try {
    const leads = await c.env.DB.prepare(`
      SELECT 
        el.id,
        el.email,
        el.assessment_id,
        el.source,
        el.created_at,
        a.preferred_country,
        a.preferred_city,
        a.overall_score
      FROM email_leads el
      LEFT JOIN assessments a ON el.assessment_id = a.id
      ORDER BY el.created_at DESC
    `).all();

    return c.json({
      success: true,
      leads: leads.results,
      total: leads.results.length
    });
  } catch (error) {
    console.error("Error fetching email leads:", error);
    return c.json({ error: "Failed to fetch email leads" }, 500);
  }
});

// The blog CRUD and image-management routes use the same server-issued bearer
// session as the rest of the protected admin API.

// Helper function for image generation
async function handleGenerateImage(c: any) {
  const env = c.env;

  // Accept JSON body: { prompt: string, size?: string, format?: "data_url"|"url" }
  const body = await c.req.json().catch(() => ({}));
  const prompt = body?.prompt ?? body?.text ?? "";
  const size = body?.size ?? "1024x1024";
  const outFormat = body?.format ?? "data_url"; // data_url or url

  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    return c.json({ error: "Missing 'prompt' in request body" }, 400);
  }

  // Prefer GEMINI_API_KEY (env secrets in Mocha). If missing, try OpenAI key fallback.
  const GEMINI_API_KEY = env.GEMINI_API_KEY;
  const OPENAI_API_KEY = env.OPENAI_API_KEY;

  // If Gemini key present, call Gemini image generation and return data URL (base64) by default
  if (GEMINI_API_KEY) {
    try {
      // Gemini image generation endpoint (v1beta example)
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`;

      const geminiPayload = {
        // This payload matches the generativelanguage image generation style (2024-2025 era)
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        // Add rudimentary controls if needed (not all versions accept these fields)
        // You can extend with guidance, safety settings, style etc if your key supports it.
      };

      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload),
      });

      if (!res.ok) {
        const text = await res.text();
        return c.json({ error: `Gemini API error: ${text}` }, res.status || 500);
      }

      const data: any = await res.json();

      // Attempt to find inline base64 data (Gemini often returns inlineData)
      const base64 =
        data?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;

      // Some Gemini configs may instead return URLs (rare) or a different shape:
      const maybeUrl = data?.candidates?.[0]?.content?.parts?.find((p: any) => p.url)?.url;

      if (!base64 && !maybeUrl) {
        // Debug: return the whole response (trim large fields) if nothing was found
        return c.json({
          error: "Gemini response did not contain an image in expected fields.",
          raw: data,
        }, 500);
      }

      if (outFormat === "url" && maybeUrl) {
        return c.json({ imageUrl: maybeUrl });
      }

      // Default: return data URL
      const dataUrl = base64 ? `data:image/jpeg;base64,${base64}` : maybeUrl;
      return c.json({ url: dataUrl });
    } catch (err: any) {
      return c.json({ error: `Gemini image error: ${err?.message ?? err}` }, 500);
    }
  }

  // If Gemini key missing but OpenAI key exists, attempt OpenAI DALL·E fallback
  if (OPENAI_API_KEY) {
    try {
      // Using the older "images/generations" style endpoint for compatibility; you may prefer /v1/images or new models
      const openaiUrl = `https://api.openai.com/v1/images/generations`;

      const payload: any = {
        prompt: prompt,
        n: 1,
        size: size,
        response_format: outFormat === "url" ? "url" : "b64_json",
      };

      const res = await fetch(openaiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.text();
        return c.json({ error: `OpenAI image error: ${errData}` }, res.status || 500);
      }

      const data: any = await res.json();
      // if response_format = "url", then get data[0].url
      if (payload.response_format === "url") {
        const imageUrl = data?.data?.[0]?.url;
        if (!imageUrl) {
          return c.json({ error: "OpenAI returned no image URL." }, 500);
        }
        return c.json({ imageUrl });
      }

      // response_format = "b64_json"
      const b64 = data?.data?.[0]?.b64_json;
      if (!b64) {
        return c.json({ error: "OpenAI returned no base64 image." }, 500);
      }
      const dataUrl = `data:image/png;base64,${b64}`;
      return c.json({ url: dataUrl });
    } catch (err: any) {
      return c.json({ error: `OpenAI image fallback error: ${err?.message ?? err}` }, 500);
    }
  }

  // Neither Gemini nor OpenAI keys were present
  return c.json({ error: "No GEMINI_API_KEY or OPENAI_API_KEY configured in env." }, 500);
}

// Admin: Generate image for blog post
app.post("/api/admin/blog/generate-image", adminAuth, async (c) => {
  return handleGenerateImage(c);
});

// Admin: Upload image for blog post
app.post("/api/admin/blog/upload-image", adminAuth, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('image') as any as File;

    if (!file || typeof file.name === 'undefined') {
      return c.json({ error: "No image provided" }, 400);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: "Invalid file type. Only images are allowed." }, 400);
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return c.json({ error: "Image size exceeds 5MB limit" }, 400);
    }

    const key = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    await c.env.R2_BUCKET.put(`blog-images/${key}`, file, {
      httpMetadata: { contentType: file.type }
    });

    return c.json({
      success: true,
      url: `/api/blog/images/${key}`
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return c.json({ error: "Failed to upload image" }, 500);
  }
});

// Serve blog images from R2
app.get('/api/blog/images/:key', async (c) => {
  const key = c.req.param('key');
  try {
    const object = await c.env.R2_BUCKET.get(`blog-images/${key}`);

    if (!object) {
      return c.notFound();
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new Response(object.body, {
      headers
    });
  } catch (error) {
    return c.json({ error: "Failed to fetch image" }, 500);
  }
});

// File Converter API Endpoints

// Upload and convert file
app.post('/api/file-converter/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const fileEntry = formData.get('file');

    if (!fileEntry) {
      return c.json({ success: false, error: 'No file provided' }, 400);
    }

    // Check if it's a File object
    const file = fileEntry as any as File;
    if (!file || typeof file.name === 'undefined' || typeof file.size === 'undefined') {
      return c.json({ success: false, error: 'Invalid file provided' }, 400);
    }

    // Validate file type
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    if (fileExtension !== 'md' && fileExtension !== 'pdf') {
      return c.json({
        success: false,
        error: 'Invalid file type. Only .md and .pdf files are supported.'
      }, 400);
    }

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return c.json({
        success: false,
        error: 'File size exceeds 10MB limit'
      }, 400);
    }

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const fileType = fileExtension as 'md' | 'pdf';

    // Convert file to HTML
    let htmlContent: string;
    if (fileType === 'md') {
      const markdown = new TextDecoder().decode(arrayBuffer);
      htmlContent = await convertMarkdownToHTML(markdown);
    } else {
      htmlContent = await convertPDFToHTML(arrayBuffer);
    }

    // Generate unique file ID and R2 key
    const fileId = crypto.randomUUID();
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const r2Key = `file-converter/${fileId}-${timestamp}-${sanitizedFileName}.html`;

    // Upload converted HTML to R2
    await c.env.R2_BUCKET.put(r2Key, htmlContent, {
      httpMetadata: {
        contentType: 'text/html',
      },
    });

    // Store metadata in database
    try {
      await c.env.DB.prepare(`
        INSERT INTO converted_files (id, original_name, file_name, file_type, file_size, r2_key, converted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        fileId,
        fileName,
        `${sanitizedFileName}.html`,
        fileType,
        htmlContent.length,
        r2Key,
        new Date().toISOString()
      ).run();
    } catch (dbError) {
      // If database insert fails, still keep the file in R2 but log the error
      console.error('Database insert failed:', dbError);
      // Check if it's a table missing error
      const errorMsg = dbError instanceof Error ? dbError.message : String(dbError);
      if (errorMsg.includes('no such table') || errorMsg.includes('converted_files')) {
        throw new Error('Database table not found. Please run migration 12: npx wrangler d1 migrations apply emigration-pro-db');
      }
      throw dbError;
    }

    return c.json({
      success: true,
      fileId,
      message: 'File converted successfully'
    });
  } catch (error) {
    console.error('File conversion error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to convert file';
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Log detailed error for debugging
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      errorType: error?.constructor?.name
    });

    return c.json({
      success: false,
      error: errorMessage,
      details: errorStack
    }, 500);
  }
});

// List all converted files
app.get('/api/file-converter/files', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT id, original_name, file_name, file_type, file_size, converted_at
      FROM converted_files
      ORDER BY converted_at DESC
    `).all();

    return c.json({
      success: true,
      files: results
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch files'
    }, 500);
  }
});

// Download converted file
app.get('/api/file-converter/download/:id', async (c) => {
  try {
    const fileId = c.req.param('id');

    // Get file metadata
    const file = await c.env.DB.prepare(`
      SELECT * FROM converted_files WHERE id = ?
    `).bind(fileId).first();

    if (!file) {
      return c.json({ success: false, error: 'File not found' }, 404);
    }

    // Get file from R2
    const r2Key = file.r2_key as string;
    const object = await c.env.R2_BUCKET.get(r2Key);

    if (!object) {
      return c.json({ success: false, error: 'File not found in storage' }, 404);
    }

    // Return file with appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', 'text/html');
    headers.set('Content-Disposition', `attachment; filename="${file.file_name}"`);

    return new Response(object.body, { headers });
  } catch (error) {
    console.error('Error downloading file:', error);
    return c.json({
      success: false,
      error: 'Failed to download file'
    }, 500);
  }
});

// Delete single file
app.delete('/api/file-converter/delete/:id', async (c) => {
  try {
    const fileId = c.req.param('id');

    // Get file metadata
    const file = await c.env.DB.prepare(`
      SELECT r2_key FROM converted_files WHERE id = ?
    `).bind(fileId).first();

    if (!file) {
      return c.json({ success: false, error: 'File not found' }, 404);
    }

    // Delete from R2
    const r2Key = file.r2_key as string;
    await c.env.R2_BUCKET.delete(r2Key);

    // Delete from database
    await c.env.DB.prepare(`
      DELETE FROM converted_files WHERE id = ?
    `).bind(fileId).run();

    return c.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return c.json({
      success: false,
      error: 'Failed to delete file'
    }, 500);
  }
});

// Delete multiple files
app.delete('/api/file-converter/delete-multiple', async (c) => {
  try {
    const body = await c.req.json();
    const { fileIds } = body;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return c.json({ success: false, error: 'No file IDs provided' }, 400);
    }

    // Get file metadata for all files
    const placeholders = fileIds.map(() => '?').join(',');
    const files = await c.env.DB.prepare(`
      SELECT id, r2_key FROM converted_files WHERE id IN (${placeholders})
    `).bind(...fileIds).all();

    if (files.results.length === 0) {
      return c.json({ success: false, error: 'No files found' }, 404);
    }

    // Delete from R2
    for (const file of files.results) {
      const r2Key = file.r2_key as string;
      try {
        await c.env.R2_BUCKET.delete(r2Key);
      } catch (error) {
        console.error(`Error deleting R2 object ${r2Key}:`, error);
      }
    }

    // Delete from database
    await c.env.DB.prepare(`
      DELETE FROM converted_files WHERE id IN (${placeholders})
    `).bind(...fileIds).run();

    return c.json({
      success: true,
      message: `${files.results.length} file(s) deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting files:', error);
    return c.json({
      success: false,
      error: 'Failed to delete files'
    }, 500);
  }
});

// Add missing ping endpoint for health checks
app.get('/ping', async (c) => {
  return c.json({
    pong: true,
    timestamp: new Date().toISOString(),
    status: 'ok'
  });
});

// Serve robots.txt to allow search engine crawling
app.get('/robots.txt', (c) => {
  const url = new URL(c.req.url);
  const baseUrl = url.origin;

  return c.text(`User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`, 200, {
    'Content-Type': 'text/plain'
  });
});

// Dynamic sitemap.xml generation
app.get('/sitemap.xml', async (c) => {
  // Hard-coded rather than derived from the request origin. emigrationpro.com is served
  // by Netlify, which proxies /sitemap.xml here — so the request arrives with the
  // workers.dev host and url.origin would emit workers.dev <loc> URLs that search
  // engines reject as cross-domain.
  const baseUrl = 'https://emigrationpro.com';

  try {
    const { results } = await c.env.DB.prepare(`
      SELECT slug, updated_at, published_date 
      FROM blog_posts 
      WHERE is_published = 1 
      ORDER BY published_date DESC
    `).all();

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/assessment</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/best-countries</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/sample-report</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/earn-abroad</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/living-wage-business</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/moving-abroad-glossary</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;

    for (const post of results) {
      const date = post.updated_at || post.published_date || new Date().toISOString();
      const encodedSlug = encodeURIComponent(String(post.slug));
      sitemap += `
  <url>
    <loc>${baseUrl}/blog/${encodedSlug}</loc>
    <lastmod>${new Date(date as string).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    sitemap += `\n</urlset>`;

    return c.text(sitemap, 200, {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return c.text('Error generating sitemap', 500);
  }
});
// Perplexity API endpoint for Report Generation
const ReportUserInputSchema = z.object({
  destinationCountry: z.string().trim().min(1),
  destinationCity: z.string().trim().min(1),
  profession: z.string().trim().min(1),
  age: z.string().trim().min(1),
  lifestyle: z.string().trim().min(1),
  monthlyBudget: z.number().nonnegative(),
  locationPreference: z.string().trim().min(1),
  climatePreference: z.string().trim().min(1),
  familyProfile: z.object({
    childrenCount: z.number().int().min(0).max(10),
    childrenAges: z.string().trim().min(1),
    educationPreferences: z.string().trim().min(1)
  }),
  priorities: z.object({
    immigrationPolicies: z.number().min(0).max(5),
    healthcare: z.number().min(0).max(5),
    safety: z.number().min(0).max(5),
    internet: z.number().min(0).max(5),
    emigrationProcess: z.number().min(0).max(5),
    easeOfImmigration: z.number().min(0).max(5),
    localAcceptance: z.number().min(0).max(5)
  })
});

// Domains that repeatedly show up as low-authority sources (social media,
// forums, crowd-sourced travel sites) for legal/regulatory/statistical
// claims. Video platforms are deliberately NOT excluded here — they're
// allowed as a last resort (see VIDEO_PLATFORM_HOSTNAME_PATTERNS below) with
// a mandatory caveat, since no other source may cover certain hyper-local or
// firsthand details. Perplexity's `search_domain_filter` accepts at most 10
// entries, so this list is capped to the highest-value excludes; broader
// pattern matching is applied separately when we filter returned citations.
const PERPLEXITY_EXCLUDED_SEARCH_DOMAINS = [
  'reddit.com',
  'quora.com',
  'facebook.com',
  'instagram.com',
  'pinterest.com',
  'wikivoyage.org',
  'tripadvisor.com',
  'internations.org',
  'expatforum.com',
  'expatexchange.com',
];

// Broader, uncapped set of hostname substrings used to strip out low-authority
// citations after the fact, even if Perplexity's own search filter missed one
// or the model cited something from outside the excluded search domains.
// Video platforms are intentionally excluded from this blacklist — see
// VIDEO_PLATFORM_HOSTNAME_PATTERNS, which flags rather than removes them.
const WEAK_SOURCE_HOSTNAME_PATTERNS = [
  'reddit.com', 'quora.com', 'facebook.com', 'instagram.com', 'pinterest.com',
  'twitter.com', 'x.com', 'wikivoyage.org', 'tripadvisor.com', 'internations.org',
  'expatforum.com', 'expatexchange.com', 'city-data.com', 'nomadlist.com',
  'blogspot.com', 'wordpress.com', 'medium.com', 'wikihow.com', 'substack.com',
];

// Video platforms are allowed as a source of last resort — some firsthand or
// hyper-local detail genuinely isn't published anywhere else. When a citation
// comes from one of these, we don't strip it, but we do flag it so the report
// can carry a caveat that the claim wasn't independently verifiable and should
// be confirmed with the video's producer (or the relevant official body).
const VIDEO_PLATFORM_HOSTNAME_PATTERNS = ['youtube.com', 'youtu.be', 'tiktok.com'];

const isWeakSource = (hostname: string): boolean => {
  const h = hostname.toLowerCase();
  return WEAK_SOURCE_HOSTNAME_PATTERNS.some(pattern => h === pattern || h.endsWith(`.${pattern}`));
};

const isVideoPlatformSource = (hostname: string): boolean => {
  const h = hostname.toLowerCase();
  return VIDEO_PLATFORM_HOSTNAME_PATTERNS.some(pattern => h === pattern || h.endsWith(`.${pattern}`));
};

// Concerns where the content is inherently legal/regulatory/tax rather than
// lifestyle or comparative pricing: US departure obligations + destination
// residency pathways, US Social Security/Medicare + destination senior
// benefits eligibility, and work authorization/employment law. For these,
// video and general secondary sources are not an acceptable fallback — the
// customer can be materially harmed by an unofficial claim about eligibility,
// fees, or deadlines, so only official/government-grade sources are kept.
const HIGH_STAKES_CONCERN_IDS = new Set(['visa', 'senior_benefits', 'situation']);

// A handful of non-government multilateral/treaty bodies that are still
// authoritative enough to stand alongside official government sources for
// high-stakes legal/regulatory topics (e.g., SSA totalization agreements,
// ILO labor standards).
const TRUSTED_MULTILATERAL_DOMAINS = ['worldbank.org', 'imf.org', 'oecd.org', 'who.int', 'un.org', 'ilo.org', 'unhcr.org'];

// Heuristic: does this hostname look like an official government domain?
// Covers common government TLD/subdomain conventions across countries
// (.gov, .gob., .gouv., .gc.ca, europa.eu institutions, .mil) rather than
// hardcoding every country's specific agency, since destination country
// varies per report.
const isOfficialLookingDomain = (hostname: string): boolean => {
  const h = hostname.toLowerCase();
  if (/(^|\.)gov(\.[a-z]{2})?$/.test(h)) return true; // x.gov, x.gov.uk, x.gov.pa, etc.
  if (h.includes('.gov.')) return true;
  if (h.includes('.gob.') || h.endsWith('.gob')) return true; // Spanish-speaking countries
  if (h.includes('.gouv.') || h.endsWith('.gouv.fr')) return true; // French-speaking countries
  if (h.endsWith('.mil') || h.includes('.mil.')) return true;
  if (h.endsWith('.gc.ca')) return true; // Canada
  if (h === 'europa.eu' || h.endsWith('.europa.eu')) return true;
  if (h === 'usembassy.gov' || h.endsWith('.usembassy.gov') || h === 'travel.state.gov' || h === 'state.gov') return true;
  return TRUSTED_MULTILATERAL_DOMAINS.some(d => h === d || h.endsWith(`.${d}`));
};

type ReportSource = { title: string; uri: string; isVideo?: boolean };
type LinkHealth = 'working' | 'broken' | 'unknown';
type LinkHealthResult = { health: LinkHealth; finalUrl?: string };

const LINK_HEALTH_CACHE_PREFIX = 'report-link-health:v1:';
const LINK_CHECK_TIMEOUT_MS = 7000;
const LINK_CHECK_CONCURRENCY = 5;
const MAX_LINK_REDIRECTS = 5;

/**
 * Prevent citation checking from becoming an SSRF primitive. Redirect targets
 * are checked with the same rules before they are followed.
 */
const isSafePublicCitationUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return false;
    if (url.port && url.port !== '443') return false;

    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
    if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost') ||
        hostname.endsWith('.local') || hostname.endsWith('.internal') ||
        hostname.endsWith('.lan') || hostname.endsWith('.home')) return false;

    // Reject IPv6 loopback, unspecified, link-local, unique-local and
    // IPv4-mapped literals. Public DNS hostnames remain eligible.
    // Literal IP citations are unnecessary for reports. Rejecting all IPv6
    // literals is safer than attempting to enumerate every reserved range.
    if (hostname.includes(':')) return false;

    const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (!ipv4) return true;
    const octets = ipv4.slice(1).map(Number);
    if (octets.some(n => n > 255)) return false;
    const [a, b, c] = octets;
    return !(
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0 && (c === 0 || c === 2)) ||
      (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
      (a === 203 && b === 0 && c === 113)
    );
  } catch {
    return false;
  }
};

const linkHealthCacheKey = async (url: string): Promise<string> => {
  const bytes = new TextEncoder().encode(url);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  return `${LINK_HEALTH_CACHE_PREFIX}${hash}`;
};

const fetchCitationHop = async (url: string, method: 'HEAD' | 'GET'): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LINK_CHECK_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method,
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'User-Agent': 'EmigrationPro-LinkValidator/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.5',
        ...(method === 'GET' ? { Range: 'bytes=0-1023' } : {})
      }
    });
  } finally {
    clearTimeout(timer);
  }
};

const requestCitation = async (startUrl: string, method: 'HEAD' | 'GET'): Promise<{ response: Response; finalUrl: string }> => {
  let currentUrl = startUrl;
  for (let redirectCount = 0; redirectCount <= MAX_LINK_REDIRECTS; redirectCount++) {
    if (!isSafePublicCitationUrl(currentUrl)) throw new Error('Unsafe citation URL');
    const response = await fetchCitationHop(currentUrl, method);
    if (response.status < 300 || response.status >= 400) return { response, finalUrl: currentUrl };

    const location = response.headers.get('Location');
    if (!location) return { response, finalUrl: currentUrl };
    if (response.body) await response.body.cancel();
    currentUrl = new URL(location, currentUrl).toString();
  }
  throw new Error('Too many citation redirects');
};

const checkCitationHealth = async (url: string, cache: KVNamespace): Promise<LinkHealthResult> => {
  if (!isSafePublicCitationUrl(url)) return { health: 'broken' };
  const cacheKey = await linkHealthCacheKey(url);

  try {
    const cached = await cache.get<LinkHealthResult>(cacheKey, 'json');
    if (cached?.health) return cached;
  } catch (error) {
    console.warn('Citation health cache read failed:', error);
  }

  let result: LinkHealthResult = { health: 'unknown' };
  try {
    let checked = await requestCitation(url, 'HEAD');

    // Some origins reject HEAD or incorrectly return a missing status for it.
    // Confirm those statuses with a very small GET before excluding the link.
    if ([404, 405, 410].includes(checked.response.status)) {
      if (checked.response.body) await checked.response.body.cancel();
      checked = await requestCitation(checked.finalUrl, 'GET');
    }

    const status = checked.response.status;
    if (checked.response.body) await checked.response.body.cancel();
    result = {
      health: status === 404 || status === 410 ? 'broken' : 'working',
      finalUrl: checked.finalUrl
    };
  } catch (error) {
    // A timeout, TLS failure, bot block, or transient network error is not proof
    // that a human reader cannot open the source. Retain it, but do not cache it
    // long enough to mask a later definitive result.
    console.warn(`Citation check inconclusive for ${url}:`, error);
  }

  try {
    await cache.put(cacheKey, JSON.stringify(result), {
      expirationTtl: result.health === 'working' ? 604800 : result.health === 'broken' ? 86400 : 900
    });
  } catch (error) {
    console.warn('Citation health cache write failed:', error);
  }
  return result;
};

const filterReachableSources = async (sources: ReportSource[], cache: KVNamespace): Promise<ReportSource[]> => {
  const results: Array<ReportSource | null> = new Array(sources.length).fill(null);
  let cursor = 0;

  const worker = async () => {
    while (cursor < sources.length) {
      const index = cursor++;
      const source = sources[index];
      const health = await checkCitationHealth(source.uri, cache);
      if (health.health !== 'broken') results[index] = source;
    }
  };

  await Promise.all(Array.from({ length: Math.min(LINK_CHECK_CONCURRENCY, sources.length) }, worker));
  return results.filter((source): source is ReportSource => source !== null);
};

app.post("/api/perplexity", async (c) => {
  const apiKey = c.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return c.json({ error: 'PERPLEXITY_API_KEY not configured in environment' }, 500);
  }

  const { action, payload } = await c.req.json();
  const modelName = 'sonar';

  try {
    if (action === 'generateSection') {
      const { input, concern } = payload;
      const inputResult = ReportUserInputSchema.safeParse(input);
      if (!inputResult.success) {
        return c.json({ error: 'Complete customer assessment data is required', details: inputResult.error.flatten() }, 400);
      }
      const customer = inputResult.data;
      const isFinance = concern.id === 'finance';
      const isHighStakes = HIGH_STAKES_CONCERN_IDS.has(concern.id);
      const researchDate = new Date().toISOString().slice(0, 10);

      let prompt = `
        ${concern.promptText}

        AUTHORITATIVE CUSTOMER ASSESSMENT (do not substitute or infer a different destination):
        - Destination: ${customer.destinationCity}, ${customer.destinationCountry}
        - Age: ${customer.age}
        - Occupation: ${customer.profession}
        - Monthly budget: USD ${customer.monthlyBudget}
        - Lifestyle: ${customer.lifestyle}
        - Location preference: ${customer.locationPreference}
        - Climate preference: ${customer.climatePreference}
        - Relocating children: ${customer.familyProfile.childrenCount}
        - Children's ages: ${customer.familyProfile.childrenAges}
        - Education preferences/support needs: ${customer.familyProfile.educationPreferences}
        - Priority ratings (0-5): ${JSON.stringify(customer.priorities)}
        Every recommendation must be specific to this destination and profile. Do not discuss another country except for a clearly labeled comparison that directly helps this customer.

        REPORT RESEARCH STANDARD — AS OF ${researchDate}:
        - SOURCE HIERARCHY (STRICT, in order of preference):
          1. TIER 1 — PRIMARY/OFFICIAL: government ministries and agencies (e.g., immigration/migration authority, labor ministry, tax authority, national statistics institute, central bank), regulators, public utilities, embassies/consulates, and official operator/hospital/school sites for the DESTINATION country, plus relevant US federal agencies where the topic touches US obligations (IRS.gov, SSA.gov, Medicare.gov, FinCEN.gov, travel.state.gov). Name the specific agency next to any fact sourced from it.
          2. TIER 2 — REPUTABLE SECONDARY (use only when no Tier 1 source exists): established cost-of-living/statistics aggregators (e.g., Numbeo, Mercer), major international organizations (World Bank, IMF, OECD, WHO), accredited news organizations, established relocation/immigration law firms, and .edu/.gov-adjacent research bodies.
          3. TIER 3 — LAST RESORT, VIDEO PLATFORMS ONLY (YouTube, TikTok): use a video source only when no Tier 1 or Tier 2 source covers that specific fact, and only for firsthand/hyper-local detail (e.g., what a specific neighborhood or office actually looks like) rather than for legal, regulatory, tax, eligibility, or statistical claims. Whenever a video source is used, say explicitly in the text that this information is not otherwise independently verifiable and should be confirmed with the video's producer (or the relevant official body) before the customer acts on it.
          4. FORBIDDEN AS EVIDENCE (ALL OTHER SOCIAL/FORUM/CROWD SOURCES): social media posts (Reddit, Facebook, Instagram, X/Twitter, Pinterest), forums (expat forums, city-data, Quora), crowd-edited travel sites (Wikivoyage, TripAdvisor), and unverified personal blogs. NEVER cite these for any claim, and do not use them to fill a gap when no Tier 1/Tier 2 source exists — instead state that verifiable data was not found and tell the customer how to confirm it directly with the relevant official body.
        - Give the source organization and publication/effective date next to every material statistic, price, eligibility rule, processing time, schedule, and safety claim.
        - For rapidly changing facts, prefer evidence from the last 24 months and explicitly identify older evidence.
        - Distinguish city-specific, regional, and national information. Never present national averages as city facts without labeling the limitation.
        - Never fabricate rankings, prices, processing times, program eligibility, addresses, operating status, or numerical scores. If reliable information is unavailable or conflicting, say so and explain how the customer should verify it.
        - Separate verified facts, reasonable estimates, and recommendations. State calculation assumptions and uncertainty ranges.
        - Use absolute dates rather than vague phrases such as "currently" or "recently."
        - End with a short "Verification Before Acting" checklist naming the official agencies or providers the customer should reconfirm.

        FORMATTING DIRECTIVE:
        - Use clear, professional headers (#, ##, ###).
        - Use bullet points for lists.
        - DO NOT output empty table headers.
      `;

      if (isHighStakes) {
        prompt += `

        HIGH-STAKES TOPIC — GOVERNMENT SOURCES REQUIRED, NO TIER 2/3 FALLBACK:
        This section covers legal, tax, immigration, or employment-law facts where an unofficial claim could cost the customer money or legal status. For every eligibility rule, fee, tax obligation, filing requirement, processing time, deadline, work-authorization rule, or benefit calculation:
        - You MUST identify and name the specific official government agency (by its real name and, where you know it, its official domain) — e.g., for the United States: IRS.gov, SSA.gov, Medicare.gov, FinCEN.gov, USCIS, travel.state.gov; for the destination country: its immigration/migration authority, its labor ministry, and/or its tax authority, by their actual names.
        - Tier 2 reputable secondary sources (news, law firm summaries) may only ADD context, never REPLACE an official source, for these fact types.
        - Video platforms, social media, and forums MUST NOT be used for any legal, regulatory, tax, eligibility, or employment-law claim in this section, even as a last resort.
        - If you cannot find or confirm a fact through an official government source, say so explicitly rather than presenting an estimate as settled fact, and tell the customer exactly which agency to contact to confirm it.
        `;
      }

      if (isFinance && concern.responseSchema) {
        prompt += `\n\nCRITICAL: You MUST respond with ONLY a complete, valid JSON object matching this schema: ${JSON.stringify(concern.responseSchema)}. Do not include markdown fences or any other text. Keep each budget-item notes field under 35 words so the complete object is returned. Never stop mid-object.`;
      }

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: 'You are an elite research analyst specializing in international relocation and global mobility.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          // Finance uses a large structured budget. The previous 2,000-token
          // limit cut JSON off mid-row, which made the UI display raw JSON.
          max_tokens: isFinance ? 8000 : 2000,
          search_domain_filter: PERPLEXITY_EXCLUDED_SEARCH_DOMAINS.map(d => `-${d}`)
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return c.json({ error: `Perplexity API Error: ${response.status}`, details: errorText }, response.status);
      }

      const data = await response.json();
      const rawText = data.choices[0].message.content;
      
      const candidateSources = (Array.isArray(data.citations) ? data.citations.slice(0, 30) : []).map((url: string) => {
        try {
            const domain = new URL(url).hostname.replace('www.', '');
            // Keep the title as a plain domain so the UI's single-line,
            // truncated source chip still displays cleanly; the video caveat
            // is surfaced separately via isVideo so the frontend can show a
            // badge/note instead of silently truncating a long sentence.
            return { title: domain, uri: url, isVideo: isVideoPlatformSource(domain) };
        } catch {
            return { title: 'Source', uri: url };
        }
      })
        // Defense-in-depth: even though search_domain_filter steers Perplexity's
        // own retrieval away from weak sources, strip any that slip through
        // (or that the model cites from memory) before they reach the report.
        .filter((s: { title: string; uri: string }) => {
          try {
            return !isWeakSource(new URL(s.uri).hostname);
          } catch {
            return true;
          }
        })
        // High-stakes legal/tax/immigration/labor topics: no video, and no
        // fallback to unofficial secondary sources — keep only government
        // and trusted-multilateral domains so every citation the customer
        // sees for these sections is authoritative.
        .filter((s: { title: string; uri: string }) => {
          if (!isHighStakes) return true;
          try {
            const hostname = new URL(s.uri).hostname;
            return isOfficialLookingDomain(hostname);
          } catch {
            return false;
          }
        })
        .filter((s: any, i: number, a: any[]) => a.findIndex(t => t.uri === s.uri) === i);

      const sources = await filterReachableSources(candidateSources, c.env.REPORTS_KV);
      if (sources.length !== candidateSources.length) {
        console.log(`Removed ${candidateSources.length - sources.length} confirmed broken or unsafe citation(s) from ${concern.id}`);
      }

      return c.json({ content: rawText, sources }, 200);
    }

    return c.json({ error: 'Invalid action' }, 400);
  } catch (error: any) {
    console.error('Perplexity Function Error:', error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

// Serve static files for React app using ASSETS binding
app.get('*', async (c) => {
  try {
    const url = new URL(c.req.url);

    if (decodeURIComponent(url.pathname) === '/blog/Avoid Mistakes When Leaving') {
      return c.redirect(`${SITE_ORIGIN}/blog/avoid-mistakes-when-leaving`, 301);
    }

    // Explicitly handle favicon and other standard assets that might be missing
    // to prevent them from falling through to index.html and causing SSL issues
    if (url.pathname.includes('favicon') || url.pathname.includes('.ico')) {
      const assetResponse = await c.env.ASSETS.fetch(c.req.raw);
      if (assetResponse.status === 404) {
        return new Response(null, { status: 204 });
      }
      return assetResponse;
    }

    // Try fetching the asset
    const response = await c.env.ASSETS.fetch(c.req.raw);

    // If asset not found and it's not an API call, serve index.html (for SPA routing)
    if (response.status === 404 && !url.pathname.startsWith('/api/')) {
      const indexResponse = await c.env.ASSETS.fetch(new URL('/', url.origin).toString());
      
      // HTMLRewriter for blog posts SEO
      const blogMatch = url.pathname.match(/^\/blog\/([^/]+)$/);
      if (blogMatch) {
        const slug = blogMatch[1];
        try {
          const post = await c.env.DB.prepare(`
            SELECT title, excerpt, featured_image, author, published_date, updated_at
            FROM blog_posts
            WHERE slug = ? AND is_published = 1
          `).bind(slug).first();
          
          if (post) {
            const jsonLd = {
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": post.title,
              "image": [post.featured_image || "https://mocha-cdn.com/og.png"],
              "datePublished": post.published_date,
              "dateModified": post.updated_at || post.published_date,
              "author": [{
                  "@type": "Person",
                  "name": post.author || "Emigration Pro"
              }]
            };

            const rewriter = new HTMLRewriter()
              .on('title', {
                element(e) { e.setInnerContent(`${post.title} | Emigration Pro`); }
              })
              .on('meta[property="og:title"]', {
                element(e) { e.setAttribute('content', post.title as string); }
              })
              .on('meta[property="twitter:title"]', {
                element(e) { e.setAttribute('content', post.title as string); }
              })
              .on('head', {
                element(e) {
                  e.append(`<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`, { html: true });
                  if (post.excerpt) {
                    const safeExcerpt = (post.excerpt as string).replace(/"/g, '&quot;');
                    e.append(`<meta name="description" content="${safeExcerpt}" />`, { html: true });
                  }
                }
              });

            if (post.excerpt) {
              const safeExcerpt = (post.excerpt as string).replace(/"/g, '&quot;');
              rewriter.on('meta[property="og:description"]', {
                element(e) { e.setAttribute('content', safeExcerpt); }
              })
              .on('meta[property="twitter:description"]', {
                element(e) { e.setAttribute('content', safeExcerpt); }
              });
            }

            if (post.featured_image) {
              rewriter.on('meta[property="og:image"]', {
                element(e) { e.setAttribute('content', post.featured_image as string); }
              })
              .on('meta[property="twitter:image"]', {
                element(e) { e.setAttribute('content', post.featured_image as string); }
              });
            }

            return rewriter.transform(indexResponse);
          }
        } catch (dbError) {
          console.error("Error fetching post for SEO:", dbError);
        }
      }

      return indexResponse;
    }

    return response;
  } catch (error) {
    // If anything fails, try to return index.html as a last resort
    try {
      return await c.env.ASSETS.fetch(new URL('/', c.req.url).toString());
    } catch (innerError) {
      return new Response("Internal Server Error", { status: 500 });
    }
  }
});

// Handle scheduled events (cron jobs)
// Wrap fetch handler to catch any unhandled errors and prevent SSL protocol errors
export default {
  fetch: async (request: Request, env: any, ctx: ExecutionContext) => {
    return await app.fetch(request, env, ctx);
  },
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('Scheduled event triggered:', event.cron);

    // Run retention cleanup daily at 2 AM UTC
    if (event.cron === '0 2 * * *') {
      console.log('Running scheduled retention cleanup...');
      ctx.waitUntil(runScheduledCleanup(env));
    }

    // Run video updates quarterly (every 3 months) on the 1st at 3 AM UTC
    if (event.cron === '0 3 1 */3 *') {
      console.log('Running scheduled video updates (quarterly)...');
      ctx.waitUntil(runScheduledVideoUpdates(env));
    }
  }
};
