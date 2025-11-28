# Emigration Pro - Project Status & Handover

**Last Updated:** November 25, 2025
**Status:** Fully Functional / Deployed

## 1. Project Overview
This is a full-stack application built on **Cloudflare Workers** (backend) and **React** (frontend). It uses Cloudflare's serverless ecosystem for all data storage.

### Architecture
-   **Frontend:** React (Vite) - Served as static assets from the Worker.
-   **Backend:** Cloudflare Worker (Hono framework).
-   **Database:** Cloudflare D1 (`DB`) - Stores blog posts, users, etc.
-   **Storage:** Cloudflare R2 (`R2_BUCKET`) - Stores generated reports/files.
-   **Cache/Session:** Cloudflare KV (`REPORTS_KV`) - Stores temporary session data.

## 2. Key Features Implemented

### Blog System
-   **Public Blog:** Accessible at `/blog`. Renders posts with proper formatting.
-   **Admin Panel:** Accessible at `/admin/blog`.
    -   **Authentication:** Simple password protection (Client-side).
    -   **Formatting Toolbar:** Added Bold, Italic, Underline, Headers, Lists, and Links support.
    -   **Paragraphs:** Automatically preserves newlines as paragraphs.
    -   **Image Selection:** 
        -   Replaced complex AI generation with a robust **Category Selector**.
        -   Categories: ✈️ Airport/Travel, 🏠 Moving/House, 👨‍👩‍👧‍👦 People/Family, 🌍 Foreign Cities.
        -   Uses high-quality, curated Unsplash images to ensure reliability.

### Deployment
-   **Configuration:** `wrangler.json` is fully configured with all bindings.
-   **Assets:** Frontend assets are built to `dist/client` and served by the Worker.

## 3. How to Deploy
To deploy changes to the live site, run the following commands in your terminal:

```bash
# 1. Build the React Frontend
npx vite build

# 2. Deploy to Cloudflare
npx wrangler deploy --config wrangler.json
```

## 4. Environment Variables & Secrets
The following secrets are set in the Cloudflare Worker environment:

-   `BLOG_ADMIN_API_KEY`: Password for blog admin actions (set to `admin#123`).
-   `GEMINI_API_KEY`: (Optional) For AI features.
-   `OPENAI_API_KEY`: (Optional) Fallback for AI features.

To update a secret:
```bash
npx wrangler secret put SECRET_NAME
```

## 5. Troubleshooting

### "Image Failed to Load"
-   **Cause:** Old Rackspace CDN URLs or broken links.
-   **Fix:** Edit the post in Admin and use the new **Category Buttons** to pick a fresh, working image.

### "Changes not showing up"
-   **Cause:** Browser caching.
-   **Fix:** Perform a **Hard Refresh** (`Ctrl + Shift + R` or `Cmd + Shift + R`) to clear the cache and see the latest version.

### "404 Not Found"
-   **Cause:** Usually means the frontend assets weren't uploaded correctly.
-   **Fix:** Ensure `wrangler.json` points to `./dist/client` (which is currently set correctly) and run `npx vite build` before deploying.

## 6. Future Maintenance
-   **Database Migrations:** All migrations are in `migrations/` folder. Apply them with `npx wrangler d1 migrations apply DB`.
-   **Frontend Code:** Located in `src/react-app`.
-   **Backend Code:** Located in `src/worker`.
