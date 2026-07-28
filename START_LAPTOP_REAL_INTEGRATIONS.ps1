param(
    [switch]$NoUninstall
)
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\SWITCH_TO_LAPTOP_REAL_INTEGRATIONS.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\CHECK_LAPTOP_REAL_READY.ps1
if ($NoUninstall) {
  powershell -NoProfile -ExecutionPolicy Bypass -File .\START_MARKETPLACE_PHONE.ps1 -StrictBackend -NoUninstall
} else {
  powershell -NoProfile -ExecutionPolicy Bypass -File .\START_MARKETPLACE_PHONE.ps1 -StrictBackend
}
