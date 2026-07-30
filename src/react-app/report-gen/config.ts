// src/config.ts
// Centralized app configuration constants.

export const CONFIG = {
  // --- STRIPE CONFIGURATION (LIVE PAYMENT LINK) ---
  // Replace with your actual Stripe Payment Link URL.
  // This is the modern, serverless way to handle payments and is fully supported by Stripe.
  // 1. Create a Product in your Stripe Dashboard.
  // 2. Create a Price for that Product.
  // 3. Click "Create payment link" and copy the URL here.
  // 4. In the payment link settings, set the confirmation page to redirect back to this app's URL
  //    with a query parameter: `?payment_success=true`
  STRIPE_PAYMENT_LINK_URL: 'https://buy.stripe.com/00w9AL79L9lqcTD4tTefC05',
  // Optional: For direct Stripe integration (not used when using payment links)
  STRIPE_PUBLISHABLE_KEY: undefined as string | undefined,
  STRIPE_PRICE_ID: undefined as string | undefined
};