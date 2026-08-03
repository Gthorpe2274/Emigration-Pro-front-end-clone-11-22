interface Env {
  DB: D1Database;
  REPORTS_KV: KVNamespace;
  R2_BUCKET: R2Bucket;
  ASSETS: Fetcher;
  MOCHA_USERS_SERVICE_API_KEY?: string;
  MOCHA_USERS_SERVICE_API_URL?: string;
  RAGATOUILLE_API_URL?: string;
  RAGATOUILLE_API_KEY?: string;
  BLOG_ADMIN_API_KEY: string;
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  PERPLEXITY_API_KEY?: string;
  RESEND_API_KEY?: string;
  YOUTUBE_API_KEY?: string;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  // Affiliate system (Supabase) — set via wrangler secret put
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  REPORT_PRICE_USD?: string;
  // Read-only use: resolving a Stripe Checkout Session on return from payment.
  // Set via `wrangler secret put STRIPE_SECRET_KEY`.
  STRIPE_SECRET_KEY?: string;
}
