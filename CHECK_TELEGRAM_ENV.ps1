$ErrorActionPreference = "Stop"

[Console]::InputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$envPath = Join-Path $PSScriptRoot ".env"

if (!(Test-Path $envPath)) {
    throw "root .env not found. Copy .env.example to .env and fill Telegram variables."
}

$vars = @{}

Get-Content $envPath -Encoding UTF8 | ForEach-Object {
    $line = $_.Trim()
    if ($line -and !$line.StartsWith("#") -and $line.Contains("=")) {
        $k, $v = $line.Split("=", 2)
        $vars[$k.Trim()] = $v.Trim().Trim('"').Trim("'")
    }
}

function Is-RealValue([string]$v) {
    if ([string]::IsNullOrWhiteSpace($v)) { return $false }
    if ($v.StartsWith("put_")) { return $false }
    if ($v.Contains("_here")) { return $false }
    if ($v.Contains("xxxxxxxx")) { return $false }
    if ($v.Contains("your-")) { return $false }
    if ($v.Contains("your_")) { return $false }
    return $true
}

function Print-Check([string]$name, [string]$value) {
    if (Is-RealValue $value) {
        Write-Host "${name}: OK length=$($value.Length)" -ForegroundColor Green
    } else {
        Write-Host "${name}: MISSING/PLACEHOLDER" -ForegroundColor Yellow
    }
}

function Invoke-TelegramJsonPost([string]$url, [hashtable]$payload) {
    $json = $payload | ConvertTo-Json -Depth 20 -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)

    Invoke-RestMethod `
        -Method Post `
        -Uri $url `
        -ContentType "application/json; charset=utf-8" `
        -Body $bytes
}

$adminToken = $vars["TELEGRAM_ADMIN_BOT_TOKEN"]
$adminIds = $vars["TELEGRAM_ADMIN_IDS"]
$chatToken = $vars["TELEGRAM_CHAT_BOT_TOKEN"]
$groupId = $vars["TELEGRAM_CHAT_GROUP_ID"]

Write-Host "=== PODOLOG KUTSYTOI Telegram env check ===" -ForegroundColor Cyan

Print-Check "admin token" $adminToken
Print-Check "admin ids" $adminIds
Print-Check "chat token" $chatToken
Print-Check "chat group" $groupId

if (!(Is-RealValue $chatToken)) { throw "TELEGRAM_CHAT_BOT_TOKEN is empty or placeholder." }
if (!(Is-RealValue $groupId)) { throw "TELEGRAM_CHAT_GROUP_ID is empty or placeholder." }

if (!$groupId.StartsWith("-100")) {
    Write-Host "WARNING: group id usually starts with -100. Current: $groupId" -ForegroundColor Yellow
}

Write-Host "`n[1] getMe chat bot" -ForegroundColor Green
$me = Invoke-RestMethod "https://api.telegram.org/bot$chatToken/getMe"
$me | ConvertTo-Json -Depth 10

Write-Host "`n[2] getChat group" -ForegroundColor Green
$chat = Invoke-RestMethod "https://api.telegram.org/bot$chatToken/getChat?chat_id=$groupId"
$chat | ConvertTo-Json -Depth 10

Write-Host "`n[3] send UTF-8 test message" -ForegroundColor Green
Invoke-TelegramJsonPost "https://api.telegram.org/bot$chatToken/sendMessage" @{
    chat_id = $groupId
    text = "PODOLOG KUTSYTOI: проверка чат-бота из CHECK_TELEGRAM_ENV.ps1"
} | ConvertTo-Json -Depth 10

Write-Host "`n[4] create UTF-8 test topic" -ForegroundColor Green
try {
    Invoke-TelegramJsonPost "https://api.telegram.org/bot$chatToken/createForumTopic" @{
        chat_id = $groupId
        name = "Тест PODOLOG KUTSYTOI"
    } | ConvertTo-Json -Depth 10
} catch {
    Write-Host "createForumTopic failed. Check that topics are enabled and chat bot has 'manage topics' admin right." -ForegroundColor Red
    if ($_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message -ForegroundColor Red }
    throw
}

Write-Host "`nTelegram env is OK." -ForegroundColor Green
