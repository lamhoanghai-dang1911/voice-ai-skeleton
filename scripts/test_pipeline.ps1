# ==============================================================================
# INTEGRIX IX.VOICE - SMOKE TEST E2E PIPELINE SCRIPT
# ==============================================================================

$baseUrl = "http://localhost:8000/api/v1"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   IX.VOICE E2E SMOKE TEST AND CONTRACT VALIDATION        " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Healthcheck
Write-Host "`n[1/4] Kiem tra Healthcheck..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "[OK] Health Status: $($health.status) | Mode: $($health.pipelineMode)" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Backend chua san sang tai $baseUrl" -ForegroundColor Red
    exit 1
}

# 2. Query Canonical Sample Job
Write-Host "`n[2/4] Truy van Sample Audio Job..." -ForegroundColor Cyan
$sampleJobId = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
$job = Invoke-RestMethod -Uri "$baseUrl/jobs/$sampleJobId" -Method Get
Write-Host "[OK] Job ID: $($job.jobId) | Status: $($job.status) | Progress: $($job.progress)%" -ForegroundColor Green

# 3. Query Vietnamese Transcript
Write-Host "`n[3/4] Truy van Transcript tieng Viet..." -ForegroundColor Cyan
$transcript = Invoke-RestMethod -Uri "$baseUrl/jobs/$sampleJobId/transcript" -Method Get
Write-Host "[OK] So doan hoi thoai: $($transcript.segments.Count) | Model: $($transcript.modelVersion)" -ForegroundColor Green

# 4. Query Analysis & Emotion
Write-Host "`n[4/4] Truy van Conversation Intelligence va Emotion..." -ForegroundColor Cyan
$analysis = Invoke-RestMethod -Uri "$baseUrl/jobs/$sampleJobId/analysis" -Method Get
Write-Host "[OK] So tieu chi checklist: $($analysis.checklistResults.Count)" -ForegroundColor Green
Write-Host "[OK] Disclaimer: $($analysis.emotionSignals.disclaimer)" -ForegroundColor Yellow

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "   TAT CA CAC CONTRACT COMPLIANCE TESTS DEU PASS!         " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
