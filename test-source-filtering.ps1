# One-off manual test for the Perplexity source-filtering changes.
# Run from the project root: .\test-source-filtering.ps1
# Requires .dev.vars to contain a real PERPLEXITY_API_KEY.

$env:WRANGLER_SEND_METRICS = "false"

Write-Host "Starting wrangler dev on port 8787..." -ForegroundColor Cyan
$job = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npx wrangler dev --port 8787
}

# Wait for the server to come up
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    try {
        Invoke-WebRequest -Uri "http://127.0.0.1:8787/" -UseBasicParsing -TimeoutSec 2 | Out-Null
        $ready = $true
        break
    } catch {
        # Still starting up (or 404s until assets exist) — keep polling.
        if ($_.Exception.Response) { $ready = $true; break }
    }
}

if (-not $ready) {
    Write-Host "Server did not come up in time. Job output:" -ForegroundColor Red
    Receive-Job $job
    Stop-Job $job; Remove-Job $job
    exit 1
}

Write-Host "Server is up. Running test requests..." -ForegroundColor Cyan

$userInput = @{
    destinationCountry = "Panama"
    destinationCity = "Panama City"
    profession = "Software Engineer"
    age = "45"
    lifestyle = "moderate"
    monthlyBudget = 3000
    locationPreference = "urban"
    climatePreference = "tropical"
    familyProfile = @{ childrenCount = 0; childrenAges = "N/A"; educationPreferences = "N/A" }
    priorities = @{ immigrationPolicies = 5; healthcare = 4; safety = 4; internet = 3; emigrationProcess = 5; easeOfImmigration = 5; localAcceptance = 3 }
}

function Test-Section($concernId, $concernTitle, $promptText) {
    Write-Host "`n=== Testing concern: $concernId ===" -ForegroundColor Yellow
    $body = @{
        action = "generateSection"
        payload = @{
            input = $userInput
            concern = @{
                id = $concernId
                title = $concernTitle
                description = "test"
                promptText = $promptText
            }
        }
    } | ConvertTo-Json -Depth 10

    try {
        $resp = Invoke-RestMethod -Uri "http://127.0.0.1:8787/api/perplexity" -Method Post -ContentType "application/json" -Body $body -TimeoutSec 60
        Write-Host "Sources returned ($($resp.sources.Count)):" -ForegroundColor Green
        $resp.sources | ForEach-Object { Write-Host " - $($_.title)  ->  $($_.uri)" }
    } catch {
        Write-Host "Request failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails) { Write-Host $_.ErrorDetails.Message }
    }
}

Test-Section "visa" "Steps to Take to Leave America" `
  "GEOGRAPHIC CONTEXT: Departing the United States for Panama City, Panama. TASK: Generate a departure and entry dossier covering IRS filing, foreign-account reporting (FBAR/FATCA), Social Security/Medicare implications, and Panama residency/visa pathways for a 45-year-old Software Engineer."

Test-Section "finance" "Cost of Living" `
  "GEOGRAPHIC CONTEXT: Panama City, Panama. TASK: Create an itemized monthly cost of living budget for a Software Engineer with a moderate lifestyle and monthly budget of USD 3000."

Write-Host "`nStopping dev server..." -ForegroundColor Cyan
Stop-Job $job
Remove-Job $job
Write-Host "Done." -ForegroundColor Cyan
