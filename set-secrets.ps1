# PowerShell script to set Cloudflare Worker secrets

# Read the .env file and extract API keys
$envContent = Get-Content .env
$youtubeKey = ($envContent | Select-String "YOUTUBE_API_KEY").Line.Split('=')[1].Trim()
$geminiKey = ($envContent | Select-String "GEMINI_API_KEY").Line.Split('=')[1].Trim()

Write-Host "Setting YOUTUBE_API_KEY..."
$youtubeKey | npx wrangler secret put YOUTUBE_API_KEY

Write-Host "`nSetting GEMINI_API_KEY..."
$geminiKey | npx wrangler secret put GEMINI_API_KEY

Write-Host "`nSecrets have been set successfully!"
