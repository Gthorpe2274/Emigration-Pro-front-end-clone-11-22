# Favicon Setup Instructions

## Required Favicon Files and Dimensions

Add the following favicon files to the `public` folder:

### 1. **favicon.ico** (Required)
- **Dimensions:** 16x16, 32x32, or 48x48 pixels (multi-size ICO format)
- **Format:** ICO (can contain multiple sizes)
- **Location:** `public/favicon.ico`
- **Purpose:** Standard browser favicon

### 2. **favicon-16x16.png** (Recommended)
- **Dimensions:** 16x16 pixels
- **Format:** PNG
- **Location:** `public/favicon-16x16.png`
- **Purpose:** Small browser tab icon

### 3. **favicon-32x32.png** (Recommended)
- **Dimensions:** 32x32 pixels
- **Format:** PNG
- **Location:** `public/favicon-32x32.png`
- **Purpose:** Standard browser tab icon

### 4. **apple-touch-icon.png** (Required for iOS)
- **Dimensions:** 180x180 pixels
- **Format:** PNG
- **Location:** `public/apple-touch-icon.png`
- **Purpose:** iOS home screen icon

## How to Add Your Favicon Files

### Step 1: Prepare Your Favicon Images

1. Create or obtain your favicon image
2. Resize/create versions in the required dimensions:
   - **favicon.ico**: 16x16, 32x32, or 48x48 (multi-size ICO)
   - **favicon-16x16.png**: 16x16 pixels
   - **favicon-32x32.png**: 32x32 pixels
   - **apple-touch-icon.png**: 180x180 pixels

### Step 2: Add Files to Public Folder

Copy your favicon files directly into the `public` folder:

```
public/
  ├── favicon.ico
  ├── favicon-16x16.png
  ├── favicon-32x32.png
  ├── apple-touch-icon.png
  ├── images/
  └── robots.txt
```

### Step 3: Verify Files Are Added

After adding the files, your `public` folder should contain:
- ✅ `favicon.ico`
- ✅ `favicon-16x16.png` (optional but recommended)
- ✅ `favicon-32x32.png` (optional but recommended)
- ✅ `apple-touch-icon.png`

### Step 4: Rebuild and Deploy

After adding the favicon files:

```bash
# 1. Build the project
npx vite build

# 2. Deploy to Cloudflare
npx wrangler deploy --config wrangler.json
```

## Favicon Creation Tools

You can create favicons using:
- **Online Tools:**
  - [Favicon.io](https://favicon.io/) - Free favicon generator
  - [RealFaviconGenerator](https://realfavicongenerator.net/) - Comprehensive favicon generator
  - [Favicon Generator](https://www.favicon-generator.org/) - Simple generator

- **Image Requirements:**
  - Start with a square image (at least 512x512 pixels recommended)
  - Use PNG format for best quality
  - Keep design simple (details get lost at small sizes)
  - Use high contrast colors

## Testing Your Favicon

1. **Local Testing:**
   - Run `npm run dev` or `npx vite`
   - Check browser tab for favicon
   - Hard refresh (Ctrl+F5 or Cmd+Shift+R) if you don't see it

2. **After Deployment:**
   - Visit your site
   - Check browser tab for favicon
   - Test on mobile devices (iOS Safari for apple-touch-icon)

## Notes

- The `index.html` file has already been updated to reference these local files
- Files in the `public` folder are automatically copied to `dist` during build
- Browsers cache favicons aggressively - you may need to clear cache or use incognito mode to see changes immediately
- The favicon will be served from the root path (`/favicon.ico`) after deployment



