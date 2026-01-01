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
const blogAdminAuth = async (c: any, next: any) => {
  // No authentication check - relying on frontend password protection
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

// Assessment submission schema - aligned with shared types
const AssessmentSchema = z.object({
  user_age: z.number().min(18).max(100),
  user_job: z.string().min(1).max(200),
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
function calculateScore(assessment: any): { score: number; matchLevel: string; budgetCompatibility: string } | { error: boolean; message: string; details: string; climateConflict: any } {
  // Country scoring data
  const countryScores: { [key: string]: any } = {
    'Portugal': {
      immigration_policies: 4,
      healthcare: 4,
      safety: 4,
      internet: 4,
      emigration_process: 4,
      ease_of_immigration: 4,
      local_acceptance: 4,
      climate_type: 'mediterranean',
    },
    'Spain': {
      immigration_policies: 4,
      healthcare: 4,
      safety: 4,
      internet: 3,
      emigration_process: 4,
      ease_of_immigration: 4,
      local_acceptance: 4,
      climate_type: 'mediterranean',
    },
    'Mexico': {
      immigration_policies: 3,
      healthcare: 3,
      safety: 2,
      internet: 3,
      emigration_process: 4,
      ease_of_immigration: 4,
      local_acceptance: 4,
      climate_type: 'tropical',
    },
    'Costa Rica': {
      immigration_policies: 4,
      healthcare: 3,
      safety: 3,
      internet: 3,
      emigration_process: 4,
      ease_of_immigration: 4,
      local_acceptance: 4,
      climate_type: 'tropical',
    },
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

  factors.forEach(factor => {
    const importance = assessment[`${factor}_importance`];
    const countryScore = countryData[factor];

    const importanceWeight = Math.pow(importance, 1.5);
    const factorScore = (countryScore / 4) * importanceWeight;

    weightedScore += factorScore;
    totalImportanceWeight += importanceWeight;
  });

  // Add climate scoring
  let climateScore = 0;
  if (climateMatchType === 'perfect') {
    climateScore = 5;
  } else if (climateMatchType === 'partial') {
    climateScore = 3;
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

  return { score: finalScore, matchLevel, budgetCompatibility };
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

    const { score, matchLevel, budgetCompatibility } = scoreResult;

    // Set retention period (2 years from now)
    const retention_expires_at = new Date();
    retention_expires_at.setFullYear(retention_expires_at.getFullYear() + 2);

    const result = await c.env.DB.prepare(`
      INSERT INTO assessments (
        user_age, user_job, monthly_budget, preferred_country, preferred_city, location_preference,
        climate_preference, immigration_policies_importance, healthcare_importance, safety_importance,
        internet_importance, emigration_process_importance, ease_of_immigration_importance,
        local_acceptance_importance, overall_score, match_level, budget_compatibility, retention_expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      assessment.user_age ?? 30,
      assessment.user_job ?? 'Test User',
      assessment.monthly_budget || 2000,
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
      matchLevel
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
app.get('/api/admin/crm/purchasers', async (c) => {
  try {
    // In a real app, we would verify the admin session/token here
    // For now, we rely on the frontend password protection (low security)

    const { results } = await c.env.DB.prepare(`
      SELECT 
        r.id, r.email, r.session_code, r.assessment_id, r.purchase_confirmed, r.is_active, r.created_at, r.expires_at,
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

// CRM - Update purchaser
app.put('/api/admin/crm/purchasers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { email, session_code, is_active, purchase_confirmed } = body;

    if (!email || !session_code) {
      return c.json({
        success: false,
        error: 'Email and session code are required'
      }, 400);
    }

    // Update the purchaser record
    await c.env.DB.prepare(`
      UPDATE relocation_hub_access
      SET email = ?,
          session_code = ?,
          is_active = ?,
          purchase_confirmed = ?
      WHERE id = ?
    `).bind(
      email.toLowerCase(),
      session_code,
      is_active ? 1 : 0,
      purchase_confirmed ? 1 : 0,
      id
    ).run();

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

// Blog Endpoints

// Public: Get all published posts
app.get('/api/blog/posts', async (c) => {
  try {
    let { results } = await c.env.DB.prepare(`
      SELECT id, title, slug, featured_image, excerpt, published_date, author
      FROM blog_posts 
      WHERE is_published = 1 
      ORDER BY published_date DESC, created_at DESC
    `).all();

    // Check if ANY posts exist (published or draft) to decide on seeding
    // This prevents seeding conflicts if only drafts exist
    const totalCountResult = await c.env.DB.prepare('SELECT COUNT(*) as count FROM blog_posts').first();
    const totalCount = totalCountResult ? (totalCountResult.count as number) : 0;

    // Auto-seed only if database is completely empty
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

      // Re-fetch
      const newResults = await c.env.DB.prepare(`
        SELECT id, title, slug, featured_image, excerpt, published_date, author
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
app.get('/api/admin/blog/posts', async (c) => {
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
app.post('/api/admin/blog/posts', async (c) => {
  try {
    const body = await c.req.json();
    const { title, slug, featured_image, body: content, excerpt, published_date, is_published, allow_comments, author } = body;

    await c.env.DB.prepare(`
      INSERT INTO blog_posts (title, slug, featured_image, body, excerpt, published_date, is_published, allow_comments, author)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      title, slug, featured_image, content, excerpt,
      published_date, is_published ? 1 : 0, allow_comments ? 1 : 0, author
    ).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Error creating post:', error);
    return c.json({ success: false, error: 'Failed to create post' }, 500);
  }
});

// Admin: Update post
app.put('/api/admin/blog/posts/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { title, slug, featured_image, body: content, excerpt, published_date, is_published, allow_comments, author } = body;

    await c.env.DB.prepare(`
      UPDATE blog_posts 
      SET title = ?, slug = ?, featured_image = ?, body = ?, excerpt = ?, published_date = ?, is_published = ?, allow_comments = ?, author = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      title, slug, featured_image, content, excerpt,
      published_date, is_published ? 1 : 0, allow_comments ? 1 : 0, author, id
    ).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating post:', error);
    return c.json({ success: false, error: 'Failed to update post' }, 500);
  }
});

// Admin: Delete post
app.delete('/api/admin/blog/posts/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM blog_posts WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return c.json({ success: false, error: 'Failed to delete post' }, 500);
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

    return c.json({
      success: true,
      assessment: result
    });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return c.json({ error: "Failed to fetch assessment" }, 500);
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

// Email gateway endpoint - For report generation app access
// Creates CRM record and redirects to https://report.emigrationpro.com
const EmailLeadSchema = z.object({
  email: z.string().email(),
  assessment_id: z.number().optional()
});

app.post("/api/subscribe-for-permanent-access", zValidator("json", EmailLeadSchema), async (c) => {
  try {
    const { email, assessment_id } = c.req.valid("json");
    const normalizedEmail = email.toLowerCase();

    // 1. Store email lead in email_leads table for tracking
    try {
      await c.env.DB.prepare(`
        INSERT INTO email_leads (email, assessment_id, source)
        VALUES (?, ?, 'report_generation_gateway')
      `).bind(
        normalizedEmail,
        assessment_id || null
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
          assessment_id, email, session_code, is_active, purchase_confirmed, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        finalAssessmentId,
        normalizedEmail,
        sessionCode,
        0, // is_active (inactive until purchase confirmed)
        0, // purchase_confirmed (false - they're accessing report generation)
        expires_at.toISOString()
      ).run();

      accessId = result.meta?.last_row_id || 0;

      console.log(`Email gateway: Created CRM record for ${normalizedEmail}, session: ${sessionCode}, assessment: ${finalAssessmentId}`);
    }

    // 7. Return success with redirect URL to report generation app
    const reportAppUrl = `https://report.emigrationpro.com/?email=${encodeURIComponent(normalizedEmail)}&session_code=${sessionCode}`;

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
  purchase_confirmed: z.boolean().default(true)
});

app.post("/api/relocation-hub/create-access", zValidator("json", PermanentAccessSchema), async (c) => {
  try {
    const { assessment_id, email, purchase_confirmed } = c.req.valid("json");
    const normalizedEmail = email.toLowerCase();

    // Log relocation hub access creation/update for monitoring
    console.log('Creating/updating relocation hub access:', {
      assessment_id,
      email: normalizedEmail,
      purchase_confirmed,
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
            expires_at = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE email = ? AND assessment_id = ?
      `).bind(
        1, // is_active (activate it - purchase confirmed)
        purchase_confirmed ? 1 : 0,
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
          assessment_id, email, session_code, is_active, purchase_confirmed, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        assessment_id,
        normalizedEmail,
        sessionCode,
        1, // is_active (active because purchase is confirmed)
        purchase_confirmed ? 1 : 0,
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
    if (purchase_confirmed) {
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

    // Send email with relocation hub access information (only if purchase is confirmed)
    if (purchase_confirmed) {
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

// CRM endpoint - Get all purchaser records
app.get("/api/admin/crm/purchasers", async (c) => {
  try {
    const purchasers = await c.env.DB.prepare(`
      SELECT 
        rha.id,
        rha.email,
        rha.session_code,
        rha.assessment_id,
        rha.purchase_confirmed,
        rha.is_active,
        rha.created_at,
        rha.expires_at,
        a.preferred_country,
        a.preferred_city,
        a.overall_score
      FROM relocation_hub_access rha
      LEFT JOIN assessments a ON rha.assessment_id = a.id
      ORDER BY rha.created_at DESC
    `).all();

    return c.json({
      success: true,
      purchasers: purchasers.results,
      total: purchasers.results.length
    });
  } catch (error) {
    console.error("Error fetching purchasers:", error);
    return c.json({ error: "Failed to fetch purchaser data" }, 500);
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

// Blog post schema
const BlogPostSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(200),
  featured_image: z.string().optional().nullable().transform(val => val || null),
  body: z.string().min(1),
  excerpt: z.string().optional().nullable().transform(val => val || null),
  published_date: z.string().optional().nullable().transform(val => {
    // Handle empty strings, null, undefined
    if (!val || val.trim() === '') return null;
    return val;
  }),
  is_published: z.union([z.boolean(), z.number(), z.string()]).transform(val => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val === 1;
    if (typeof val === 'string') return val === 'true' || val === '1';
    return false;
  }),
  allow_comments: z.union([z.boolean(), z.number(), z.string()]).transform(val => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val === 1;
    if (typeof val === 'string') return val === 'true' || val === '1';
    return true;
  }),
  author: z.string().optional().nullable().transform(val => val || null)
});

// Duplicate routes removed - using the ones defined above at lines 809 and 889

// Admin: Get all blog posts (including drafts)
app.get("/api/admin/blog/posts", blogAdminAuth, async (c) => {
  try {
    const posts = await c.env.DB.prepare(`
      SELECT * FROM blog_posts
      ORDER BY created_at DESC
    `).all();

    return c.json({
      success: true,
      posts: posts.results
    });
  } catch (error) {
    console.error("Error fetching all blog posts:", error);
    return c.json({ error: "Failed to fetch blog posts" }, 500);
  }
});

// Admin: Create blog post
app.post("/api/admin/blog/posts", blogAdminAuth, async (c) => {
  try {
    // Parse request body
    const body = await c.req.json();

    // Validate manually to provide better error messages
    const validation = BlogPostSchema.safeParse(body);

    if (!validation.success) {
      console.error("Blog post validation failed:", validation.error);
      return c.json({
        error: "Validation failed",
        details: validation.error.errors,
        success: false
      }, 400);
    }

    const postData = validation.data;

    // Check if slug already exists
    const existing = await c.env.DB.prepare(
      "SELECT id FROM blog_posts WHERE slug = ?"
    ).bind(postData.slug).first();

    if (existing) {
      return c.json({ error: "A post with this slug already exists", success: false }, 400);
    }

    const result = await c.env.DB.prepare(`
      INSERT INTO blog_posts (
        title, slug, featured_image, body, excerpt, published_date,
        is_published, allow_comments, author
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      postData.title,
      postData.slug,
      postData.featured_image || null,
      postData.body,
      postData.excerpt || null,
      postData.published_date || null,
      postData.is_published ? 1 : 0,
      postData.allow_comments ? 1 : 0,
      postData.author || null
    ).run();

    return c.json({
      success: true,
      id: result.meta.last_row_id,
      message: "Blog post created successfully"
    });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return c.json({
      error: "Failed to create blog post",
      details: error instanceof Error ? error.message : String(error),
      success: false
    }, 500);
  }
});

// Admin: Update blog post
app.put("/api/admin/blog/posts/:id", blogAdminAuth, async (c) => {
  try {
    const id = c.req.param("id");

    // Parse request body
    const body = await c.req.json();

    // Validate manually to provide better error messages
    const validation = BlogPostSchema.safeParse(body);

    if (!validation.success) {
      console.error("Blog post validation failed:", validation.error);
      return c.json({
        error: "Validation failed",
        details: validation.error.errors,
        success: false
      }, 400);
    }

    const postData = validation.data;

    // Check if another post has the same slug
    const existing = await c.env.DB.prepare(
      "SELECT id FROM blog_posts WHERE slug = ? AND id != ?"
    ).bind(postData.slug, id).first();

    if (existing) {
      return c.json({ error: "Another post with this slug already exists", success: false }, 400);
    }

    await c.env.DB.prepare(`
      UPDATE blog_posts SET
        title = ?,
        slug = ?,
        featured_image = ?,
        body = ?,
        excerpt = ?,
        published_date = ?,
        is_published = ?,
        allow_comments = ?,
        author = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      postData.title,
      postData.slug,
      postData.featured_image || null,
      postData.body,
      postData.excerpt || null,
      postData.published_date || null,
      postData.is_published ? 1 : 0,
      postData.allow_comments ? 1 : 0,
      postData.author || null,
      id
    ).run();

    return c.json({
      success: true,
      message: "Blog post updated successfully"
    });
  } catch (error) {
    console.error("Error updating blog post:", error);
    return c.json({
      error: "Failed to update blog post",
      details: error instanceof Error ? error.message : String(error),
      success: false
    }, 500);
  }
});

// Admin: Delete blog post
app.delete("/api/admin/blog/posts/:id", blogAdminAuth, async (c) => {
  try {
    const id = c.req.param("id");

    await c.env.DB.prepare(
      "DELETE FROM blog_posts WHERE id = ?"
    ).bind(id).run();

    return c.json({
      success: true,
      message: "Blog post deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return c.json({ error: "Failed to delete blog post" }, 500);
  }
});

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
app.post("/api/admin/blog/generate-image", blogAdminAuth, async (c) => {
  return handleGenerateImage(c);
});

// Admin: Upload image for blog post
app.post("/api/admin/blog/upload-image", blogAdminAuth, async (c) => {
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

// Serve robots.txt to block all search engines (TESTING MODE)
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

// Serve static files for React app using ASSETS binding
app.get('*', async (c) => {
  try {
    const url = new URL(c.req.url);
    
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
      return await c.env.ASSETS.fetch(new URL('/', url.origin).toString());
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
