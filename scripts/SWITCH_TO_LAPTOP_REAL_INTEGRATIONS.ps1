$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$envPath = Join-Path $root ".env"
$templatePath = Join-Path $root ".env.laptop-real.example"
if (!(Test-Path $templatePath)) { throw ".env.laptop-real.example not found" }

function Read-DotEnv([string]$Path) {
    $map = [ordered]@{}
    if (!(Test-Path $Path)) { return $map }
    [System.IO.File]::ReadAllLines((Resolve-Path $Path), [System.Text.Encoding]::UTF8) | ForEach-Object {
        $line = $_.Trim()
        if (!$line -or $line.StartsWith('#') -or !$line.Contains('=')) { return }
        $parts = $line.Split('=', 2)
        $map[$parts[0].Trim()] = $parts[1].Trim().Trim('"').Trim("'")
    }
    return $map
}

function Is-Real([string]$v) {
    if ([string]::IsNullOrWhiteSpace($v)) { return $false }
    if ($v.StartsWith('put_') -or $v.StartsWith('CHANGE_') -or $v.StartsWith('change_')) { return $false }
    if ($v.Contains('_here') -or $v.Contains('your-domain') -or $v.Contains('your_') -or $v.Contains('your-') -or $v.Contains('example.com')) { return $false }
    return $true
}

function New-Secret {
    $bytes = New-Object byte[] 64
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($bytes)
        return [Convert]::ToBase64String($bytes)
    } finally {
        if ($rng) { $rng.Dispose() }
    }
}

$current = Read-DotEnv $envPath
$template = Read-DotEnv $templatePath

# Preserve real secrets that the user already entered.
$preserve = @(
    'YCLIENTS_PARTNER_TOKEN',
    'YCLIENTS_USER_TOKEN',
    'YCLIENTS_COMPANY_ID',
    'YCLIENTS_FORM_ID',
    'TELEGRAM_ADMIN_BOT_TOKEN',
    'TELEGRAM_ADMIN_IDS',
    'TELEGRAM_CHAT_BOT_TOKEN',
    'TELEGRAM_CHAT_GROUP_ID',
    'CONTENT_ADMIN_TOKEN',
    'APP_JWT_SECRET',
    'SUPPORT_EMAIL'
)

$final = [ordered]@{}
foreach ($key in $template.Keys) { $final[$key] = $template[$key] }
foreach ($key in $preserve) {
    if ($current.Contains($key) -and (Is-Real $current[$key])) { $final[$key] = $current[$key] }
}

# Force the exact laptop-real mode. These are intentionally not preserved from production.
$forced = [ordered]@{
    'APP_ENV'='local'
    'RUN_MODE'='laptop_real_integrations'
    'APP_OPERATING_MODEL'='thin_proxy'
    'AUTH_MODE'='local_demo'
    'LOCAL_DEMO_CODE'='1111'
    'STORAGE_DRIVER'='json'
    'FILE_STORAGE_DRIVER'='telegram'
    'BOOKING_PROVIDER'='yclients'
    'PROFILE_PROVIDER'='app_cache'
    'CHAT_PROVIDER'='telegram'
    'CHAT_WEBSOCKET_ENABLE'='false'
    'CHAT_HISTORY_MODE'='technical_index'
    'CHAT_MEDIA_PRIMARY'='telegram'
    'SMS_PROVIDER'='demo'
    'SMS_DEMO_MODE'='true'
    'SMS_RU_API_ID'='local_demo_sms_not_required_on_laptop'
    'API_BASE_URL'='http://127.0.0.1:3000'
    'APP_PUBLIC_BASE_URL'='http://127.0.0.1:3000'
    'MEDIA_PUBLIC_BASE_URL'='http://127.0.0.1:3000'
    'CORS_ORIGIN'='*'
    'DATABASE_URL'='postgresql://local_demo_not_used:local_demo_not_used@localhost:5432/local_demo_not_used'
    'DATABASE_SSL'='false'
    'RUN_DB_MIGRATIONS_ON_START'='false'
    'ALLOW_DEMO_YCLIENTS'='false'
    'YCLIENTS_SYNC_ENABLE'='true'
    'YCLIENTS_IMPORTANT_EVENTS_TO_TELEGRAM'='true'
    'YCLIENTS_CATALOG_EVENTS_TO_TELEGRAM'='false'
    'YCLIENTS_CACHE_LAST_GOOD'='true'
    'TELEGRAM_ENABLE_NOTIFICATIONS'='true'
    'TELEGRAM_SYSTEM_EVENTS_TO_TELEGRAM'='false'
    'TELEGRAM_CHAT_BRIDGE_ENABLE'='true'
    'TELEGRAM_CHAT_TOPICS_ENABLED'='true'
    'TELEGRAM_CHAT_REQUIRE_TOPICS'='true'
    'TELEGRAM_RETRY_UNDELIVERED_ENABLED'='true'
    'TEST_MODE_ENABLED'='false'
}
foreach ($key in $forced.Keys) { $final[$key] = $forced[$key] }

if (!(Is-Real $final['APP_JWT_SECRET']) -or $final['APP_JWT_SECRET'].Length -lt 32) {
    $final['APP_JWT_SECRET'] = New-Secret
}
if (!(Is-Real $final['CONTENT_ADMIN_TOKEN']) -or $final['CONTENT_ADMIN_TOKEN'].Length -lt 24) {
    $final['CONTENT_ADMIN_TOKEN'] = 'local-admin-' + (New-Secret).Replace('+','').Replace('/','').Replace('=','').Substring(0,40)
}

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add('# PODOLOG KUTSYTOI - GENERATED LAPTOP_REAL_INTEGRATIONS ENV')
$lines.Add('# Real now: YCLIENTS + Telegram. Demo/local now: SMS, domains, push, PostgreSQL.')
$lines.Add('# For store/server release, switch to .env.production.example and run CHECK_PRODUCTION_READY.ps1.')
$lines.Add('')
foreach ($key in $final.Keys) { $lines.Add("$key=$($final[$key])") }
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllLines($envPath, $lines, $utf8NoBom)

Write-Host "Mode switched: LAPTOP_REAL_INTEGRATIONS" -ForegroundColor Green
Write-Host "Real integrations expected: YCLIENTS + Telegram" -ForegroundColor Green
Write-Host "Local/demo expected: SMS code 1111, localhost URLs, JSON storage, no domain, no push" -ForegroundColor Yellow
Write-Host ".env updated: $envPath" -ForegroundColor DarkGray
