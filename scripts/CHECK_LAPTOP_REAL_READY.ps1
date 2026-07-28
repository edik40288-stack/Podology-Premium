$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$envFile = Join-Path $root ".env"
if (!(Test-Path $envFile)) { throw ".env not found. Run scripts\SWITCH_TO_LAPTOP_REAL_INTEGRATIONS.ps1 first." }

$envMap = @{}
[System.IO.File]::ReadAllLines((Resolve-Path $envFile), [System.Text.Encoding]::UTF8) | ForEach-Object {
    $line = $_.Trim()
    if (!$line -or $line.StartsWith('#') -or !$line.Contains('=')) { return }
    $parts = $line.Split('=', 2)
    $envMap[$parts[0].Trim()] = $parts[1].Trim().Trim('"').Trim("'")
}

function Is-Real([string]$v) {
    if ([string]::IsNullOrWhiteSpace($v)) { return $false }
    if ($v.StartsWith('put_') -or $v.StartsWith('CHANGE_') -or $v.StartsWith('change_')) { return $false }
    if ($v.Contains('_here') -or $v.Contains('your-domain') -or $v.Contains('your_') -or $v.Contains('your-') -or $v.Contains('example.com')) { return $false }
    return $true
}
function Need([string]$name) {
    if (!(Is-Real $envMap[$name])) { throw "Laptop-real env missing or placeholder: $name" }
}
function Expect([string]$name, [string]$value) {
    if ($envMap[$name] -ne $value) { throw "Laptop-real env requires $name=$value, current=$($envMap[$name])" }
}

Expect 'APP_ENV' 'local'
Expect 'AUTH_MODE' 'local_demo'
Expect 'STORAGE_DRIVER' 'json'
Expect 'FILE_STORAGE_DRIVER' 'telegram'
Expect 'BOOKING_PROVIDER' 'yclients'
Expect 'PROFILE_PROVIDER' 'app_cache'
Expect 'CHAT_PROVIDER' 'telegram'
Expect 'ALLOW_DEMO_YCLIENTS' 'false'
Expect 'SMS_DEMO_MODE' 'true'
if ($envMap['API_BASE_URL'] -notlike 'http://127.0.0.1*' -and $envMap['API_BASE_URL'] -notlike 'http://localhost*') { throw "Laptop-real API_BASE_URL must be localhost" }
if ($envMap['APP_PUBLIC_BASE_URL'] -notlike 'http://127.0.0.1*' -and $envMap['APP_PUBLIC_BASE_URL'] -notlike 'http://localhost*') { throw "Laptop-real APP_PUBLIC_BASE_URL must be localhost" }

@(
 'APP_JWT_SECRET',
 'CONTENT_ADMIN_TOKEN',
 'TELEGRAM_ADMIN_BOT_TOKEN',
 'TELEGRAM_ADMIN_IDS',
 'TELEGRAM_CHAT_BOT_TOKEN',
 'TELEGRAM_CHAT_GROUP_ID',
 'YCLIENTS_PARTNER_TOKEN',
 'YCLIENTS_USER_TOKEN',
 'YCLIENTS_COMPANY_ID',
 'YCLIENTS_FORM_ID'
) | ForEach-Object { Need $_ }

if ($envMap['APP_JWT_SECRET'].Length -lt 32) { throw "APP_JWT_SECRET must be at least 32 chars" }
Write-Host "Laptop-real preflight: OK" -ForegroundColor Green
Write-Host "Real: YCLIENTS + Telegram. Demo/local: SMS 1111, domains, push, DB." -ForegroundColor Green
