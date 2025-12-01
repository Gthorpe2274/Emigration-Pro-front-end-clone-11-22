import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

import { runScheduledCleanup } from './retention-cleanup';

// Initialize Hono app
const app = new Hono<{ Bindings: Env }>();

// Enable CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  maxAge: 86400,
  credentials: false
}));

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
  climate_preference: z.enum(['tropical', 'seasonal', 'dry', 'mediterranean', 'temperate', 'northern']).optional(),
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
      assessment.user_age,
      assessment.user_job,
      assessment.monthly_budget || 2000,
      assessment.preferred_country,
      assessment.preferred_city || null,
      assessment.location_preference,
      assessment.climate_preference || null,
      assessment.immigration_policies_importance,
      assessment.healthcare_importance,
      assessment.safety_importance,
      assessment.internet_importance,
      assessment.emigration_process_importance,
      assessment.ease_of_immigration_importance,
      assessment.local_acceptance_importance,
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
      message: error instanceof Error ? error.message : "Unknown error"
    }, 500);
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

// Email gateway endpoint - For report generation app access
// Creates CRM record and redirects to report.emigrationpro.com
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
    let accessId: number;
    let finalAssessmentId: number | null = assessment_id || null;

    if (existingAccess) {
      // Use existing CRM record
      sessionCode = existingAccess.session_code;
      accessId = existingAccess.id;
      finalAssessmentId = existingAccess.assessment_id;
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
      if (!finalAssessmentId) {
        // Create a minimal assessment record for CRM tracking (assessment_id is required)
        const newAssessment = await c.env.DB.prepare(`
          INSERT INTO assessments (created_at)
          VALUES (CURRENT_TIMESTAMP)
        `).run();
        
        finalAssessmentId = newAssessment.meta?.last_row_id || null;
        
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
        1, // is_active
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

    // Log relocation hub access creation for monitoring
    console.log('Creating relocation hub access:', {
      assessment_id,
      email,
      purchase_confirmed,
      timestamp: new Date().toISOString()
    });

    // Generate unique session code (format: XXXX-XXXX-XXXX)
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

    let sessionCode = generateSessionCode();
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

    // Set expiration (5 years from now for permanent access)
    const expires_at = new Date();
    expires_at.setFullYear(expires_at.getFullYear() + 5);

    // Create permanent access record
    await c.env.DB.prepare(`
      INSERT INTO relocation_hub_access (
        assessment_id, email, session_code, is_active, purchase_confirmed, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      assessment_id,
      email.toLowerCase(),
      sessionCode,
      1,
      purchase_confirmed ? 1 : 0,
      expires_at.toISOString()
    ).run();

    console.log('Relocation hub access created successfully:', {
      assessment_id,
      session_code: sessionCode,
      email,
      timestamp: new Date().toISOString()
    });

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
  featured_image: z.string().optional().or(z.literal('')),
  body: z.string().min(1),
  excerpt: z.string().optional().or(z.literal('')),
  published_date: z.string().optional().or(z.literal('')),
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
  author: z.string().optional().or(z.literal(''))
});

// Get all published blog posts
app.get("/api/blog/posts", async (c) => {
  try {
    const posts = await c.env.DB.prepare(`
      SELECT id, title, slug, featured_image, excerpt, published_date, author
      FROM blog_posts
      WHERE is_published = 1
      ORDER BY published_date DESC, created_at DESC
    `).all();

    return c.json({
      success: true,
      posts: posts.results
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return c.json({ error: "Failed to fetch blog posts" }, 500);
  }
});

// Get single blog post by slug
app.get("/api/blog/posts/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const post = await c.env.DB.prepare(`
      SELECT * FROM blog_posts
      WHERE slug = ? AND is_published = 1
    `).bind(slug).first();

    if (!post) {
      return c.json({ error: "Post not found", success: false }, 404);
    }

    return c.json({
      success: true,
      post
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return c.json({ error: "Failed to fetch blog post" }, 500);
  }
});

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
app.post("/api/admin/blog/posts", blogAdminAuth, zValidator("json", BlogPostSchema), async (c) => {
  try {
    const postData = c.req.valid("json");

    // Check if slug already exists
    const existing = await c.env.DB.prepare(
      "SELECT id FROM blog_posts WHERE slug = ?"
    ).bind(postData.slug).first();

    if (existing) {
      return c.json({ error: "A post with this slug already exists" }, 400);
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
    return c.json({ error: "Failed to create blog post" }, 500);
  }
});

// Admin: Update blog post
app.put("/api/admin/blog/posts/:id", blogAdminAuth, zValidator("json", BlogPostSchema), async (c) => {
  try {
    const id = c.req.param("id");
    const postData = c.req.valid("json");

    // Check if another post has the same slug
    const existing = await c.env.DB.prepare(
      "SELECT id FROM blog_posts WHERE slug = ? AND id != ?"
    ).bind(postData.slug, id).first();

    if (existing) {
      return c.json({ error: "Another post with this slug already exists" }, 400);
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
    return c.json({ error: "Failed to update blog post" }, 500);
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

// Add missing ping endpoint for health checks
app.get('/ping', async (c) => {
  return c.json({
    pong: true,
    timestamp: new Date().toISOString(),
    status: 'ok'
  });
});

// Serve robots.txt to block all search engines (TESTING MODE)
app.get('/robots.txt', async (c) => {
  return c.text(`# TESTING MODE - Prevent all search engine crawling
# This Cloudflare Workers site is in testing phase
# Remove these directives when ready to go live

User-agent: *
Disallow: /`, 200, {
    'Content-Type': 'text/plain',
    'X-Robots-Tag': 'noindex, nofollow'
  });
});

// Serve static files for React app using ASSETS binding
app.get('*', async (c) => {
  try {
    const url = new URL(c.req.url);
    
    // Try to serve from ASSETS binding (the built React app)
    const assetResponse = await c.env.ASSETS.fetch(c.req.raw);

    // If asset found, add noindex headers for HTML responses (TESTING MODE)
    if (assetResponse.status !== 404) {
      const contentType = assetResponse.headers.get('content-type') || '';
      
      // Add noindex headers to HTML responses to prevent indexing
      if (contentType.includes('text/html')) {
        const clonedResponse = new Response(assetResponse.body, {
          status: assetResponse.status,
          statusText: assetResponse.statusText,
          headers: new Headers(assetResponse.headers)
        });
        
        // Add multiple headers to prevent indexing
        clonedResponse.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
        clonedResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        
        return clonedResponse;
      }
      
      // Add cache-busting headers to JavaScript and CSS assets to ensure fresh deployment
      if (contentType.includes('application/javascript') || contentType.includes('text/css') || contentType.includes('application/json')) {
        const clonedResponse = new Response(assetResponse.body, {
          status: assetResponse.status,
          statusText: assetResponse.statusText,
          headers: new Headers(assetResponse.headers)
        });
        
        clonedResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        
        return clonedResponse;
      }
      
      return assetResponse;
    }

    // For SPA routing, serve index.html for non-API routes
    if (!url.pathname.startsWith('/api/')) {
      const indexResponse = await c.env.ASSETS.fetch(new Request(new URL('/', url.origin)));
      
      // Add noindex headers to index.html
      if (indexResponse.status !== 404) {
        const clonedResponse = new Response(indexResponse.body, {
          status: indexResponse.status,
          statusText: indexResponse.statusText,
          headers: new Headers(indexResponse.headers)
        });
        
        // Add multiple headers to prevent indexing
        clonedResponse.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
        clonedResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        
        return clonedResponse;
      }
      
      return indexResponse;
    }

    return assetResponse;
  } catch (error) {
    console.error('Asset serving error:', error);
    return c.json({ error: 'Page not found' }, 404);
  }
});

// Handle scheduled events (cron jobs)
export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // Run retention cleanup daily at 2 AM UTC
    if (event.cron === '0 2 * * *') {
      console.log('Running scheduled retention cleanup...');
      ctx.waitUntil(runScheduledCleanup(env));
    }
  }
};
