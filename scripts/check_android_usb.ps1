$ErrorActionPreference = "Stop"
$env:Path += ";$env:LOCALAPPDATA\Android\Sdk\platform-tools"
if (!(Get-Command adb -ErrorAction SilentlyContinue)) { throw "adb not found" }
& adb kill-server
& adb start-server
Start-Sleep -Seconds 2
$list = & adb devices
$list | Write-Host
$device = $list | Select-String "`tdevice$" | Select-Object -First 1
if (!$device) { throw "No authorized Android device. Unlock phone and allow USB debugging." }
Write-Host "Android device OK: $device" -ForegroundColor Green
