# Stripe Payment Link Redirect Setup

> **OUTDATED — do not follow the success URL below.**
>
> This document describes a browser-side contract
> (`?payment_success=true&customer_email={CHECKOUT_EMAIL}`) that the app no
> longer implements. The live redirect is resolved server-side by the Worker and
> requires the session id instead:
>
> ```
> https://emigrationpro.com/api/checkout-return?session_id={CHECKOUT_SESSION_ID}
> ```
>
> See **ROTATING_THE_STRIPE_LINK.md** for the current procedure. The rest of
> this file is kept only for historical context.

## Overview

After payment completion, Stripe needs to redirect users to your report generation app with payment confirmation and customer email.

## Stripe Payment Link Configuration

### Success URL Format

Your Stripe Payment Link success URL should be:

```
https://your-report-app.netlify.app/?payment_success=true&customer_email={CHECKOUT_EMAIL}
```

Replace `your-report-app.netlify.app` with your actual domain.

### How to Configure in Stripe

1. Log in to your Stripe Dashboard
2. Navigate to Payment Links
3. Select your payment link or create a new one
4. In the "After payment" section:
   - Select "Redirect to a page"
   - Enter your success URL with the parameters above
5. Save the payment link

### URL Parameters Explained

- `payment_success=true` - Indicates successful payment
- `{CHECKOUT_EMAIL}` - Stripe variable that gets replaced with the actual customer email

**Important:** Use `{CHECKOUT_EMAIL}` exactly as shown - Stripe will automatically replace this with the customer's actual email address.

## What Happens After Redirect

1. User completes payment on Stripe
2. Stripe redirects to: `https://your-app.com/?payment_success=true&customer_email=john@example.com`
3. Your app detects the payment success
4. Your app extracts the customer email from the URL
5. Your app calls Emigration Pro APIs:
   - `POST /api/assessments` → creates assessment
   - `POST /api/relocation-hub/create-access` → creates permanent access
6. Your app displays the `session_code` to the user
7. User can now access their permanent hub at `emigrationpro.com/access-hub`

## Example: Extracting Parameters in Your App

```javascript
// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const paymentSuccess = urlParams.get('payment_success');
const customerEmail = urlParams.get('customer_email');

if (paymentSuccess === 'true' && customerEmail) {
  // Payment successful, proceed with Emigration Pro integration
  createEmigrationProAccess(userFormData, customerEmail);
}
```

## Testing

### Test Mode (Stripe Test Environment)

1. Create a test payment link with test mode enabled
2. Use test card: `4242 4242 4242 4242`
3. Complete test payment
4. Verify redirect includes correct parameters
5. Check that email is correctly extracted

### Production Mode

1. Make a small real payment
2. Verify full flow works end-to-end
3. Confirm session code is generated and displayed
4. Test logging into access hub with email and session code

## Troubleshooting

### Issue: Email parameter is empty or `{CHECKOUT_EMAIL}` literal
**Cause:** Stripe variable not configured correctly
**Solution:** Ensure you're using `{CHECKOUT_EMAIL}` exactly (with curly braces)

### Issue: Redirect URL not working
**Cause:** Invalid URL format or missing HTTPS
**Solution:** Ensure URL uses HTTPS and is properly formatted

### Issue: User sees blank page after payment
**Cause:** Your app isn't handling the redirect parameters
**Solution:** Add code to detect and process `payment_success` parameter

## Additional Stripe Features

### Optional: Add More Parameters

You can add additional parameters to track conversion sources:

```
https://your-app.com/?payment_success=true&customer_email={CHECKOUT_EMAIL}&source=landing_page_a&campaign=summer_2025
```

### Optional: Cancel URL

Configure what happens if user cancels payment:

```
https://your-app.com/checkout?cancelled=true
```

## Security Notes

- The email in the URL is visible to the user
- Don't include sensitive information in URL parameters
- Validate the email format before using it
- Consider implementing server-side payment verification via Stripe webhooks for production

## Next Steps

After configuring Stripe redirect:

1. ✅ Update Stripe Payment Link success URL
2. ✅ Test with Stripe test mode
3. ✅ Review data mapping in your integration code
4. ✅ Test full integration flow
5. ✅ Go live with production payment link
