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
}
