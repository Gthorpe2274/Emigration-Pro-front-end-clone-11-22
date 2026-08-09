// src/config.ts
// Centralized app configuration constants.

/**
 * The live Stripe Payment Link.
 *
 * Rotating this is expected — prices and promotions change, and a new Stripe
 * Payment Link gets a brand-new URL rather than updating in place. Set
 * VITE_STRIPE_PAYMENT_LINK_URL in the Netlify site environment to change it
 * without touching code; the literal below is only the fallback for local dev
 * and for builds where the variable was never set.
 *
 * Before switching to a new link, read ROTATING_THE_STRIPE_LINK.md. The URL
 * itself is the easy half — the new link must also be configured in Stripe with
 * the correct post-payment redirect, or buyers pay and never receive a report.
 */
const FALLBACK_PAYMENT_LINK_URL = 'https://buy.stripe.com/8x29ALbq1apu5rbe4tefC06';

export const CONFIG = {
  STRIPE_PAYMENT_LINK_URL:
    (import.meta.env.VITE_STRIPE_PAYMENT_LINK_URL as string | undefined)?.trim() ||
    FALLBACK_PAYMENT_LINK_URL,
  // Optional: For direct Stripe integration (not used when using payment links)
  STRIPE_PUBLISHABLE_KEY: undefined as string | undefined,
  STRIPE_PRICE_ID: undefined as string | undefined
};

/**
 * Whether the configured link is usable. Guards against an empty variable, a
 * placeholder that was never filled in, and a value that isn't a Stripe link at
 * all (a typo'd env var would otherwise send buyers somewhere arbitrary).
 */
export function isPaymentLinkConfigured(url: string = CONFIG.STRIPE_PAYMENT_LINK_URL): boolean {
  const value = (url || '').trim();
  if (!value || value.toLowerCase().includes('your_payment_link')) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && parsed.hostname === 'buy.stripe.com';
  } catch {
    return false;
  }
}

export interface CheckoutUrlOptions {
  /** Prefills the Stripe email field. */
  email?: string;
  /** Affiliate code, passed to Stripe as client_reference_id. */
  affiliateRef?: string | null;
}

/**
 * Build the checkout URL for a buyer.
 *
 * Both query parameters are appended at runtime rather than baked into the
 * stored link, which is what makes rotation safe: a replacement link keeps
 * affiliate attribution and email prefill working with no further changes.
 *
 * `client_reference_id` in particular is load-bearing — the affiliates app's
 * Stripe webhook reads it to decide which affiliate earned the commission, so
 * dropping it silently loses attribution rather than throwing.
 */
export function buildCheckoutUrl({ email, affiliateRef }: CheckoutUrlOptions = {}): string {
  const url = new URL(CONFIG.STRIPE_PAYMENT_LINK_URL);
  if (email) url.searchParams.set('prefilled_email', email);
  if (affiliateRef) url.searchParams.set('client_reference_id', affiliateRef);
  return url.toString();
}
