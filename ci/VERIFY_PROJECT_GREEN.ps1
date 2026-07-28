$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $root
Set-Location $root

$env:Path += ";C:\dev\flutter\bin;$env:LOCALAPPDATA\Android\Sdk\platform-tools"

function Require-Tool([string]$Name) {
    if (!(Get-Command $Name -ErrorAction SilentlyContinue)) { throw "Required tool not found: $Name" }
}

Require-Tool "flutter"
Require-Tool "java"

Write-Host "[1/5] Backend dependencies" -ForegroundColor Green
Set-Location (Join-Path $root "backend")
powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root "scripts\INSTALL_BACKEND_DEPS_SAFE.ps1") -BackendPath (Join-Path $root "backend")
if ($LASTEXITCODE -ne 0) { throw "backend dependencies failed" }

Write-Host "[2/5] Backend build" -ForegroundColor Green
npm run build
if ($LASTEXITCODE -ne 0) { throw "backend build failed" }

Write-Host "[3/5] Android project" -ForegroundColor Green
powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root "scripts\PREPARE_ANDROID.ps1") -MarketplaceSdk
if ($LASTEXITCODE -ne 0) { throw "Android project failed" }

Write-Host "[4/5] Flutter analyze" -ForegroundColor Green
Set-Location (Join-Path $root "mobile_flutter")
flutter pub get
if ($LASTEXITCODE -ne 0) { throw "flutter pub get failed" }
flutter analyze
if ($LASTEXITCODE -ne 0) { throw "flutter analyze failed" }

Write-Host "[5/5] Debug APK build" -ForegroundColor Green
flutter build apk --debug --dart-define=API_BASE_URL=http://127.0.0.1:3000
if ($LASTEXITCODE -ne 0) { throw "flutter build apk failed" }

Write-Host "GREEN CHECK PASSED" -ForegroundColor Green
