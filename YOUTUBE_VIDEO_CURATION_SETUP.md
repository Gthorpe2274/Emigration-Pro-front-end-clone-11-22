# YouTube Video Curation Setup

The Worker can periodically refresh relocation-hub videos with the YouTube Data API and optionally use Gemini to rank replacements.

## Production credentials

Store both credentials as encrypted Cloudflare Worker secrets. Never place their values in `wrangler.json`, documentation, shell arguments, or committed files.

```powershell
npx wrangler secret put YOUTUBE_API_KEY
npx wrangler secret put GEMINI_API_KEY
```

Enter each value only at Wrangler's secure prompt. Verify names—not values—with:

```powershell
npx wrangler secret list
```

Recommended Google Cloud restrictions:

- Use a dedicated key for YouTube and restrict it to **YouTube Data API v3**.
- Use a separate dedicated key for Gemini and restrict it to the **Generative Language API**.
- Do not use HTTP-referrer restrictions for these keys: they are called server-side from Cloudflare Workers, whose requests do not carry the site's browser referrer.
- Set conservative quotas and billing alerts in Google Cloud.

## Local development

Copy `.dev.vars.example` to `.dev.vars` and add local-only credentials there. `.dev.vars*` and `.env*` are ignored except for their committed example templates.

```dotenv
YOUTUBE_API_KEY=
GEMINI_API_KEY=
```

Do not generate `secrets.json` or copy local credentials into Wrangler configuration. If a credential is ever committed, rotate and revoke it; deleting the current file alone does not remove historical copies.

## Verification

After rotating credentials:

1. Run `npm run check`.
2. Deploy the Worker.
3. Exercise an authenticated video-refresh workflow or scheduled-job test.
4. Confirm successful YouTube and Gemini calls in Cloudflare logs without logging credential material.
5. Revoke the exposed keys only after both replacements work.

The Worker intentionally has no public credential-test endpoints. Configuration checks must remain authenticated or be performed from deployment tooling.
