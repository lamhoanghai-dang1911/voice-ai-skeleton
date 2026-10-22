# ==============================================================================
# INTEGRIX IX.VOICE - POWERSHELL LOCAL RUNTIME LAUNCHER
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   INTEGRIX IX.VOICE - LOCAL RUNTIME CONTROLLER           " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check .env file
if (-not (Test-Path ".env")) {
    Write-Host "[!] .env chua ton tai. Dang tao tu .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "[✓] Da tao .env thanh cong voi safe defaults!" -ForegroundColor Green
}

# 2. Check Docker
Write-Host "`n[*] Kiem tra Docker daemon..." -ForegroundColor Cyan
try {
    $dockerVersion = docker --version
    Write-Host "[✓] Tim thay: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "[X] Khong the ket noi Docker daemon. Vui long bat Docker Desktop!" -ForegroundColor Red
    exit 1
}

# 3. Prompt user mode
Write-Host "`nChon che do khoi chay:" -ForegroundColor Yellow
Write-Host "  1. Chay Docker Compose (CPU Default - Khuyen dung)" -ForegroundColor White
Write-Host "  2. Chay Docker Compose voi tang toc GPU NVIDIA CUDA (--profile gpu)" -ForegroundColor White
Write-Host "  3. Dung toan bo he thong Docker Compose (down)" -ForegroundColor White
Write-Host "  4. Chay kiem thu backend (pytest)" -ForegroundColor White

$choice = Read-Host "Nhap lua chon (1/2/3/4) [Mac dinh: 1]"

if ($choice -eq "2") {
    Write-Host "`n[+] Dang khoi chay Docker Compose voi GPU profile..." -ForegroundColor Cyan
    docker compose --profile gpu up -d --build
} elseif ($choice -eq "3") {
    Write-Host "`n[-] Dang dung he thong..." -ForegroundColor Yellow
    docker compose down
    exit 0
} elseif ($choice -eq "4") {
    Write-Host "`n[*] Dang chay kiem thu backend..." -ForegroundColor Cyan
    Set-Location backend
    pytest tests -v
    Set-Location ..
    exit 0
} else {
    Write-Host "`n[+] Dang khoi chay Docker Compose (CPU mode)..." -ForegroundColor Cyan
    docker compose up -d --build
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "   HE THONG IX.VOICE DANG KHOI CHAY THANH CONG!           " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  - Frontend Dashboard:    http://localhost:3000" -ForegroundColor Cyan
Write-Host "  - Swagger API Docs:      http://localhost:8000/api/v1/docs" -ForegroundColor Cyan
Write-Host "  - Health Check:          http://localhost:8000/api/v1/health" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
