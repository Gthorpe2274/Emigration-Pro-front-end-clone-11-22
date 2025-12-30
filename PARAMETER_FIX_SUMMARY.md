# Query Parameter Fix Summary

## Changes Made

Reverted query parameter names to match the original working format.

### Files Modified: 2

---

## 1. EmailCaptureModal.tsx (Line 60)

**OLD CODE:**
```typescript
window.location.href = `https://emi-pro-report-584996805327.us-west1.run.app/?prefilled_email=${encodeURIComponent(email.toLowerCase())}&client_reference_id=${data.session_code || ''}`;
```

**NEW CODE:**
```typescript
window.location.href = `https://emi-pro-report-584996805327.us-west1.run.app/?email=${encodeURIComponent(email.toLowerCase())}&session_code=${data.session_code || ''}`;
```

**Changes:**
- `prefilled_email` → `email`
- `client_reference_id` → `session_code`

---

## 2. src/worker/index.ts (Line 1282)

**OLD CODE:**
```typescript
const reportAppUrl = `https://emi-pro-report-584996805327.us-west1.run.app/?prefilled_email=${encodeURIComponent(normalizedEmail)}&client_reference_id=${sessionCode}`;
```

**NEW CODE:**
```typescript
const reportAppUrl = `https://emi-pro-report-584996805327.us-west1.run.app/?email=${encodeURIComponent(normalizedEmail)}&session_code=${sessionCode}`;
```

**Changes:**
- `prefilled_email` → `email`
- `client_reference_id` → `session_code`

---

## Expected URL Format

The new backend will now receive parameters in the original working format:

```
https://emi-pro-report-584996805327.us-west1.run.app/?email=user@example.com&session_code=ABC1-DEF2-GHI3
```

## Status

✅ All occurrences updated
✅ URL encoding preserved (`encodeURIComponent`)
✅ Parameters now match original working format
✅ Ready for commit and push
