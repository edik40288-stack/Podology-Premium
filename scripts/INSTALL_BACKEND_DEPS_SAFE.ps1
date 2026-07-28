param(
    [string]$BackendPath = ""
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Safe npm install for Windows.
# npm sometimes crashes on Windows with: "Exit handler never called!" even after installing packages.
# This script retries and only fails if required backend tools are actually missing.

function Write-Step([string]$Text) {
    Write-Host $Text -ForegroundColor Green
}


function Get-NodeMajorVersion {
    try {
        $raw = (node --version).Trim()
        if ($raw -match '^v(\d+)\.') { return [int]$Matches[1] }
        return $null
    } catch {
        return $null
    }
}

function Test-BackendDepsReady([string]$Path) {
    $checks = @(
        (Join-Path $Path "node_modules\@nestjs\cli\bin\nest.js"),
        (Join-Path $Path "node_modules\@nestjs\core"),
        (Join-Path $Path "node_modules\typescript\bin\tsc")
    )
    foreach ($item in $checks) {
        if (!(Test-Path $item)) { return $false }
    }
    return $true
}

if (!$BackendPath) {
    $BackendPath = (Get-Location).Path
}

if (!(Test-Path (Join-Path $BackendPath "package.json"))) {
    throw "backend package.json not found: $BackendPath"
}

Set-Location $BackendPath

Write-Host "Node: $(node --version)" -ForegroundColor DarkGray
Write-Host "npm:  $(npm --version)" -ForegroundColor DarkGray

# P59 quick-run mode: if bundled backend dependencies are already present,
# do not block on Node 24 and do not run npm install. This is only for local checking.
if (Test-BackendDepsReady $BackendPath) {
    Write-Host "Backend dependencies already installed. Skipping npm install." -ForegroundColor Green
    exit 0
}

$nodeMajor = Get-NodeMajorVersion
if ($nodeMajor -and $nodeMajor -gt 22) {
    Write-Host "Node $nodeMajor detected. V14 allows local dependency install on Node $nodeMajor for laptop-real mode. For final production builds, prefer Node 20/22 LTS." -ForegroundColor Yellow
}

$env:NPM_CONFIG_AUDIT = "false"
$env:NPM_CONFIG_FUND = "false"
$env:NPM_CONFIG_PROGRESS = "false"
$env:NPM_CONFIG_LOGLEVEL = "error"
$env:NPM_CONFIG_PREFER_OFFLINE = "false"

$failed = $false

if (Test-Path (Join-Path $BackendPath "package-lock.json")) {
    Write-Step "Trying npm ci --no-audit --no-fund"
    npm ci --no-audit --no-fund --legacy-peer-deps --loglevel=error
    if ($LASTEXITCODE -eq 0) { exit 0 }
    Write-Host "npm ci failed with ExitCode=$LASTEXITCODE. Retrying safely..." -ForegroundColor Yellow
    $failed = $true
}

if ($failed) {
    npm cache verify
    $global:LASTEXITCODE = 0
}

Write-Step "Trying npm install --no-audit --no-fund"
npm install --no-audit --no-fund --legacy-peer-deps --loglevel=error
if ($LASTEXITCODE -eq 0) { exit 0 }

Write-Host "npm install returned ExitCode=$LASTEXITCODE." -ForegroundColor Yellow

if (Test-BackendDepsReady $BackendPath) {
    Write-Host "npm returned an error, but required backend packages are present. Continuing." -ForegroundColor Yellow
    exit 0
}

Write-Host "Cleaning npm cache and retrying one last time..." -ForegroundColor Yellow
npm cache clean --force
$global:LASTEXITCODE = 0
npm install --no-audit --no-fund --legacy-peer-deps --loglevel=error
if ($LASTEXITCODE -eq 0) { exit 0 }

if (Test-BackendDepsReady $BackendPath) {
    Write-Host "npm returned an error after retry, but required backend packages are present. Continuing." -ForegroundColor Yellow
    exit 0
}

throw "backend dependencies failed after safe retries. The package also includes bundled backend/node_modules in V14; if this happens, delete backend/node_modules and retry, or run npm install inside backend manually."
