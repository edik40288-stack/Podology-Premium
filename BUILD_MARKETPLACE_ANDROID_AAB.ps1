$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$env:Path += ";C:\dev\flutter\bin;$env:LOCALAPPDATA\Android\Sdk\platform-tools"

function Import-DotEnv([string]$Path) {
    if (!(Test-Path $Path)) { return }
    [System.IO.File]::ReadAllLines((Resolve-Path $Path), [System.Text.Encoding]::UTF8) | ForEach-Object {
        $line = $_.Trim()
        if (!$line -or $line.StartsWith('#') -or !$line.Contains('=')) { return }
        $parts = $line.Split('=', 2)
        $name = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"').Trim("'")
        if ($name) { [System.Environment]::SetEnvironmentVariable($name, $value, 'Process') }
    }
}

function Is-RealValue([string]$Value) {
    if ([string]::IsNullOrWhiteSpace($Value)) { return $false }
    if ($Value.StartsWith('put_') -or $Value.StartsWith('CHANGE_') -or $Value.StartsWith('change_')) { return $false }
    if ($Value.Contains('_here')) { return $false }
    if ($Value.Contains('your-domain') -or $Value.Contains('your_') -or $Value.Contains('your-')) { return $false }
    return $true
}

function Require-Env([string]$Name) {
    $value = [System.Environment]::GetEnvironmentVariable($Name, 'Process')
    if (!(Is-RealValue $value)) { throw "Release env is missing or placeholder: $Name" }
}

Import-DotEnv (Join-Path $root ".env")

if ($env:APP_ENV -ne "production") { throw "Release build requires APP_ENV=production in .env" }
if ($env:AUTH_MODE -ne "sms_ru") { throw "Release build requires AUTH_MODE=sms_ru in .env" }
if ($env:STORAGE_DRIVER -ne "postgres") { throw "Release build requires STORAGE_DRIVER=postgres in .env" }
$thinMode = $env:APP_OPERATING_MODEL -eq "thin_proxy" -or $env:APP_OPERATING_MODEL -eq "yclients_telegram_thin"
if ($thinMode) {
  if ($env:FILE_STORAGE_DRIVER -ne "telegram" -and $env:FILE_STORAGE_DRIVER -ne "s3") { throw "Release build requires FILE_STORAGE_DRIVER=telegram or s3 in thin mode" }
} elseif ($env:FILE_STORAGE_DRIVER -ne "s3") { throw "Release build requires FILE_STORAGE_DRIVER=s3 in full mode" }
if ($env:API_BASE_URL -like "http://127.0.0.1*" -or $env:API_BASE_URL -like "http://localhost*" -or $env:API_BASE_URL -notlike "https://*") { throw "Release API_BASE_URL must be HTTPS and cannot be localhost" }
if ($env:CORS_ORIGIN -eq "*" -or $env:CORS_ORIGIN -like "http://127.0.0.1*" -or $env:CORS_ORIGIN -like "http://localhost*" -or $env:CORS_ORIGIN -notlike "https://*") { throw "Release CORS_ORIGIN must be HTTPS and cannot be wildcard/localhost" }

@(
  "API_BASE_URL",
  "APP_PUBLIC_BASE_URL",
  "CORS_ORIGIN",
  "APP_JWT_SECRET",
  "DATABASE_URL",
  "SMS_RU_API_ID",
  "YCLIENTS_PARTNER_TOKEN",
  "YCLIENTS_USER_TOKEN",
  "YCLIENTS_COMPANY_ID",
  "YCLIENTS_FORM_ID",
  "TELEGRAM_CHAT_BOT_TOKEN",
  "TELEGRAM_CHAT_GROUP_ID",
  "PRIVACY_POLICY_URL",
  "TERMS_URL",
  "ACCOUNT_DELETION_URL",
  "SUPPORT_EMAIL"
) | ForEach-Object { Require-Env $_ }
if ($env:FILE_STORAGE_DRIVER -eq "s3") {
  @("S3_ENDPOINT", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_PUBLIC_BASE_URL") | ForEach-Object { Require-Env $_ }
}

powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root "scripts\PREPARE_ANDROID.ps1") -MarketplaceSdk
Set-Location (Join-Path $root "mobile_flutter")
flutter pub get
if ($LASTEXITCODE -ne 0) { throw "flutter pub get failed" }
flutter analyze
if ($LASTEXITCODE -ne 0) { throw "flutter analyze failed" }
flutter build appbundle --release `
  --dart-define=APP_ENV=production `
  --dart-define=API_BASE_URL=$env:API_BASE_URL `
  --dart-define=PRIVACY_POLICY_URL=$env:PRIVACY_POLICY_URL `
  --dart-define=TERMS_URL=$env:TERMS_URL `
  --dart-define=ACCOUNT_DELETION_URL=$env:ACCOUNT_DELETION_URL `
  --dart-define=SUPPORT_EMAIL=$env:SUPPORT_EMAIL
if ($LASTEXITCODE -ne 0) { throw "flutter build appbundle failed" }
Write-Host "AAB: mobile_flutter\build\app\outputs\bundle\release\app-release.aab" -ForegroundColor Green
