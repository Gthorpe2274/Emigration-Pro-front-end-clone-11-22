# Rotating the Stripe Payment Link

Stripe Payment Links are immutable in the ways that matter: change the price and
you get a **new URL**. This is the procedure for swapping it without breaking
checkout, report delivery, or affiliate commissions.

## Where the link lives

There is exactly **one** live definition:

- `src/react-app/report-gen/config.ts` — `CONFIG.STRIPE_PAYMENT_LINK_URL`,
  which reads `VITE_STRIPE_PAYMENT_LINK_URL` and falls back to a literal.

It is consumed by `ReportSummaryPreview.tsx` (via `buildCheckoutUrl`), which is
rendered only by `CheckoutReport.tsx`. Every purchase button on the site —
Home, Results, RelocationHub, BlogPost, Footer — opens `EmailCaptureModal`,
which routes to `/checkout-report`. So all paid traffic converges on this one
constant.

Stale copies exist in the **affiliates** repo but are **not live**: a git
worktree under `.claude/worktrees/` and compiled output under `.next/` and
`.netlify/` still contain the old hardcoded link. The live affiliate landing
page (`pages/go/[affiliateSlug].jsx`) correctly sends traffic to
`https://emigrationpro.com/?ref=SLUG` and never references Stripe. Do not
"fix" the build artifacts; they regenerate.

## To rotate

1. Create the new Payment Link in Stripe.
2. **Configure its post-payment redirect** (see the next section — this is the
   step that silently breaks things).
3. In Netlify, set `VITE_STRIPE_PAYMENT_LINK_URL` on the **emi-pro-frontend**
   site to the new URL.
4. Redeploy. Vite inlines `VITE_*` at build time, so an env change alone does
   nothing until the site rebuilds.
5. Verify with the checklist at the bottom.

Updating the fallback literal in `config.ts` is optional but keeps local dev
honest. The env var always wins when set.

## The redirect is the dangerous part

The post-payment redirect is configured **in the Stripe dashboard on the payment
link**, not in this repo. A newly created link defaults to Stripe's own hosted
confirmation page. If you leave that default, buyers are charged and never reach
their report — and nothing in the code will error.

The live contract, implemented by `src/worker/index.ts` at `/api/checkout-return`,
requires the session id:

```
https://emigrationpro.com/api/checkout-return?session_id={CHECKOUT_SESSION_ID}
```

The worker then looks the session up server-side, confirms `payment_status` is
`paid`, maps the buyer's email to their assessment, and forwards them to
`/checkout-report`. Resolving it server-side is deliberate: it lets someone pay
on their phone and still get the report tied to the assessment they filled in on
a laptop.

> **Note:** `STRIPE_REDIRECT_SETUP.md` documents an older contract
> (`?payment_success=true&customer_email={CHECKOUT_EMAIL}`). That format is no
> longer what the worker implements. Use the URL above.

## What rotation does *not* break

These adapt automatically and need no attention:

- **Affiliate attribution.** `client_reference_id` is appended at runtime by
  `buildCheckoutUrl`, not baked into the stored link.
- **Email prefill.** Same mechanism, via `prefilled_email`.
- **Commission amounts.** The affiliates webhook
  (`pages/api/webhooks/stripe.js`) computes from `session.amount_total`, so a
  price change flows through without a code edit.
- **Webhook routing.** The webhook is registered against the Stripe *account*,
  not a specific payment link.

## Display prices are separate

The `$69.99` / `$99.99` figures are hardcoded in the UI and will **not** follow
a price change in Stripe:

- `src/react-app/report-gen/components/ReportSummaryPreview.tsx`
- `src/react-app/pages/Home.tsx`
- `src/react-app/pages/Results.tsx`
- `src/react-app/pages/RelocationHub.tsx`
- `src/react-app/pages/BlogPost.tsx`

If the amount changes, update these too, or the site advertises one price and
charges another.

## Post-rotation checklist

- [ ] Buy button opens `buy.stripe.com` with the **new** link id.
- [ ] URL carries `prefilled_email` and, from an affiliate link, `client_reference_id`.
- [ ] Completing a test payment lands on `/checkout-report`, not Stripe's hosted page.
- [ ] The report generates for the correct assessment.
- [ ] A test purchase through `/go/<slug>` records a commission in the affiliates dashboard.
- [ ] Advertised price matches what Stripe charges.
