# YouTube Video Smart Curation Setup Guide

## Overview

This implementation adds Gemini-powered smart curation for YouTube videos in relocation hubs. Videos are automatically updated every 6 months with the best matching content using AI-powered selection.

## What Was Implemented

### 1. Database Migration
- **File:** `migrations/11.sql`
- **Table:** `relocation_hub_videos`
- Stores video metadata, YouTube IDs, and next update dates

### 2. Services Created
- **YouTube API Service** (`src/worker/youtube-api-service.ts`)
  - Searches YouTube for videos
  - Retrieves video details and statistics

- **Gemini Smart Curation** (`src/worker/youtube-video-curator.ts`)
  - Uses Gemini AI to intelligently match video replacements
  - Evaluates relevance, quality, channel match, and recency
  - Falls back to simple selection if Gemini unavailable

### 3. API Endpoints
- `GET /api/relocation-hub/:assessmentId/videos`
  - Fetches videos for a relocation hub
  
- `POST /api/relocation-hub/:assessmentId/videos/update`
  - Updates/initializes videos with smart curation

### 4. Scheduled Updates
- **Cron Job:** Runs daily at 3 AM UTC
- Automatically updates videos that are 6+ months old
- Processes in batches (50 assessments per run)

### 5. Frontend Integration
- **RelocationHub.tsx** updated to fetch videos from API
- Falls back to hardcoded videos if API unavailable
- Automatically initializes videos on first access

## Setup Instructions

### Step 1: Run Database Migration

```bash
# Apply migration 11
npx wrangler d1 migrations apply emigration-pro-db --local
npx wrangler d1 migrations apply emigration-pro-db
```

### Step 2: Configure API Keys

Set the following secrets in Cloudflare Workers:

```bash
# YouTube Data API v3 Key
npx wrangler secret put YOUTUBE_API_KEY=AQ.Ab8RN6INmY2m5Dl0Icky8Tk4AgEhjNd80lcyVfONILIYyvdmgQ

# Enter your YouTube API key when prompted

# Gemini API Key (optional but recommended for smart curation)
npx wrangler secret put GEMINI_API_KEY=AIzaSyBT2qs3VtQRU_Gv9YqZFSQA3ikEiQ0CCGg
# Enter your Gemini API key when prompted
```

**Get YouTube API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable "YouTube Data API v3"
4. Create credentials (API Key)
5. Restrict key to YouTube Data API v3

**Get Gemini API Key:**
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click "Get API Key"
3. Copy the key

### Step 3: Configure Cron Triggers

Cron triggers need to be configured in Cloudflare Dashboard:

1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your worker: `emigration-pro`
3. Go to **Settings** → **Triggers**
4. Under **Cron Triggers**, add:
   - **Cron Expression:** `0 3 * * *`
   - **Description:** "Daily video updates at 3 AM UTC"

Alternatively, you can add to `wrangler.json`:

```json
{
  "triggers": {
    "crons": ["0 3 * * *"]
  }
}
```

### Step 4: Deploy

```bash
npm run build
npx wrangler deploy
```

## How It Works

### Initial Video Setup
1. When a user accesses a relocation hub, videos are fetched from the database
2. If no videos exist, the frontend uses fallback hardcoded videos
3. Background API call initializes videos with smart curation
4. Videos are stored in the database with 6-month update dates

### Scheduled Updates (Every 6 Months)
1. Cron job runs daily at 3 AM UTC
2. Finds assessments with videos due for update (`next_update_date <= today`)
3. For each video:
   - Searches YouTube for new videos matching the topic
   - Uses Gemini to evaluate and select the best replacement
   - Updates database with new video and sets next update date (6 months later)

### Video Slot Structure
- **Slot 1:** Personal expat experience story
- **Slot 2:** Cost of living comparison
- **Slot 3:** Immigration/visa process guide
- **Slot 4:** Healthcare system guide
- **Slot 5:** Cultural differences guide
- **Slot 6:** City-specific neighborhood guide (if city provided)

## Cost Estimates

Based on 6-month update frequency:

| Pages | Annual Cost (Gemini) |
|-------|---------------------|
| 10,000 | ~$3.40/year |
| 50,000 | ~$17.00/year |
| 100,000 | ~$34.00/year |

**Note:** YouTube Data API is free (with quota limits). Gemini API has minimal cost for curation.

## API Quota Considerations

### YouTube Data API
- Default quota: 10,000 units/day
- Search request: 100 units
- ~100 searches/day available

**For scale:**
- 10K pages: ~55 searches/day (within free tier)
- 50K pages: ~274 searches/day (needs quota increase - still free)
- 100K pages: ~548 searches/day (needs quota increase - still free)

Request quota increase in [Google Cloud Console](https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas)

### Gemini API
- Very low token usage (~800 tokens per video update)
- Well within free tier limits for most use cases

## Testing

### Manual Video Update Test

```bash
curl -X POST https://emigration-pro.aiservices4biz.workers.dev/api/relocation-hub/{ASSESSMENT_ID}/videos/update
```

### Test Video Fetching

```bash
curl https://emigration-pro.aiservices4biz.workers.dev/api/relocation-hub/{ASSESSMENT_ID}/videos
```

## Troubleshooting

### Videos Not Updating
1. Check cron trigger is configured in Cloudflare Dashboard
2. Check logs in Cloudflare Dashboard → Workers → Logs
3. Verify API keys are set: `npx wrangler secret list`

### No Videos Returned
1. Videos may not be initialized yet - they're created on first access
2. Check database: `SELECT * FROM relocation_hub_videos WHERE assessment_id = ?`
3. Manually trigger update via API endpoint

### Gemini Curation Not Working
- System falls back to simple selection if Gemini unavailable
- Check `GEMINI_API_KEY` is set correctly
- Check logs for Gemini API errors

## Monitoring

Check video update status:

```sql
SELECT 
  assessment_id,
  COUNT(*) as video_count,
  MIN(next_update_date) as next_update,
  MAX(last_updated) as last_update
FROM relocation_hub_videos
GROUP BY assessment_id
ORDER BY next_update_date ASC
LIMIT 10;
```

## Next Steps

1. ✅ Run database migration
2. ✅ Set API keys (YouTube + Gemini)
3. ✅ Configure cron trigger in Cloudflare Dashboard
4. ✅ Deploy updated worker
5. Test with a single assessment
6. Monitor logs for first scheduled update

---

**Estimated Setup Time:** 15-20 minutes  
**Annual Maintenance:** Minimal (monitoring only)


