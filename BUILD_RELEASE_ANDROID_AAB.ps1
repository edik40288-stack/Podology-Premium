$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$buildScript = Join-Path $root "BUILD_MARKETPLACE_ANDROID_AAB.ps1"
if (!(Test-Path $buildScript)) { throw "BUILD_MARKETPLACE_ANDROID_AAB.ps1 not found." }
& powershell -NoProfile -ExecutionPolicy Bypass -File $buildScript
exit $LASTEXITCODE
