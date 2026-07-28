$ErrorActionPreference = "Stop"

function Get-NodeMajorVersion {
  try {
    $raw = (node --version).Trim()
    if ($raw -match '^v(\d+)\.') { return [int]$Matches[1] }
    return $null
  } catch { return $null }
}

Write-Host "[1/4] Backend dependencies/build" -ForegroundColor Cyan
Push-Location ".\backend"
$nodeMajor = Get-NodeMajorVersion
$depsReady = (Test-Path ".\node_modules\@nestjs\cli\bin\nest.js") -and (Test-Path ".\node_modules\@nestjs\core") -and (Test-Path ".\node_modules\typescript\bin\tsc")
$distReady = Test-Path ".\dist\main.js"

if ($depsReady -and $distReady -and $nodeMajor -and $nodeMajor -gt 22) {
  Write-Host "Node $nodeMajor detected. Bundled backend deps/dist are present, so skipping npm install/build for quick local check." -ForegroundColor Yellow
} else {
  if (-not $depsReady) {
    powershell -NoProfile -ExecutionPolicy Bypass -File "..\scripts\INSTALL_BACKEND_DEPS_SAFE.ps1" -BackendPath (Get-Location).Path
  }
  if (-not (Test-Path ".\dist\main.js")) {
    npm run build
  } else {
    Write-Host "Backend dist already present. Skipping rebuild." -ForegroundColor Green
  }
}
Pop-Location

Write-Host "[2/4] Flutter dependencies" -ForegroundColor Cyan
Push-Location ".\mobile_flutter"
flutter pub get
Pop-Location

Write-Host "[3/4] VS Code note" -ForegroundColor Cyan
Write-Host "If Problems panel still shows old errors: Ctrl+Shift+P -> Dart: Restart Analysis Server"

Write-Host "[4/4] Done" -ForegroundColor Green
