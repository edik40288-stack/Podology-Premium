$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$envFile = Join-Path $root ".env"
if (!(Test-Path $envFile)) { throw ".env not found. Copy .env.example to .env and fill production values." }

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
    if (!(Is-Real $envMap[$name])) { throw "Missing or placeholder env: $name" }
}

if ($envMap['APP_ENV'] -ne 'production') { throw "APP_ENV must be production" }
if ($envMap['AUTH_MODE'] -ne 'sms_ru') { throw "AUTH_MODE must be sms_ru" }
if ($envMap['STORAGE_DRIVER'] -ne 'postgres') { throw "STORAGE_DRIVER must be postgres" }
$thinMode = $envMap['APP_OPERATING_MODEL'] -eq 'thin_proxy' -or $envMap['APP_OPERATING_MODEL'] -eq 'yclients_telegram_thin'
if ($thinMode) {
    if ($envMap['FILE_STORAGE_DRIVER'] -notin @('telegram','s3')) { throw "FILE_STORAGE_DRIVER must be telegram or s3 in thin production" }
} elseif ($envMap['FILE_STORAGE_DRIVER'] -ne 's3') { throw "FILE_STORAGE_DRIVER must be s3 in full production" }
if ($envMap['API_BASE_URL'] -notlike 'https://*') { throw "API_BASE_URL must be HTTPS" }
if ($envMap['APP_PUBLIC_BASE_URL'] -notlike 'https://*') { throw "APP_PUBLIC_BASE_URL must be HTTPS" }
if ($envMap['CORS_ORIGIN'] -eq '*' -or $envMap['CORS_ORIGIN'] -notlike 'https://*') { throw "CORS_ORIGIN must be HTTPS and cannot be wildcard in production" }

@(
 'API_BASE_URL',
 'APP_PUBLIC_BASE_URL',
 'CORS_ORIGIN',
 'APP_JWT_SECRET',
 'DATABASE_URL',
 'SMS_RU_API_ID',
 'CONTENT_ADMIN_TOKEN',
 'TELEGRAM_CHAT_BOT_TOKEN',
 'TELEGRAM_CHAT_GROUP_ID',
 'YCLIENTS_PARTNER_TOKEN',
 'YCLIENTS_USER_TOKEN',
 'YCLIENTS_COMPANY_ID',
 'YCLIENTS_FORM_ID',
 'PRIVACY_POLICY_URL',
 'TERMS_URL',
 'ACCOUNT_DELETION_URL',
 'SUPPORT_EMAIL'
) | ForEach-Object { Need $_ }

if ($envMap['APP_JWT_SECRET'].Length -lt 32) { throw "APP_JWT_SECRET must be at least 32 chars" }
if ($envMap['TEST_MODE_ENABLED'] -eq 'true') {
    @('TEST_MODE_FIRST_NAME','TEST_MODE_LAST_NAME','TEST_MODE_PHONE') | ForEach-Object { Need $_ }
}
if ($envMap['FILE_STORAGE_DRIVER'] -eq 's3') {
    @('S3_ENDPOINT','S3_BUCKET','S3_ACCESS_KEY_ID','S3_SECRET_ACCESS_KEY','S3_PUBLIC_BASE_URL') | ForEach-Object { Need $_ }
}

Write-Host "Production env preflight: OK" -ForegroundColor Green
