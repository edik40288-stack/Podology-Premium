param(
    [switch]$SkipBackend,
    [switch]$StrictBackend,
    [switch]$NoUninstall
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$startScript = Join-Path $scriptRoot "START_MARKETPLACE_PHONE.ps1"
if (!(Test-Path $startScript)) { throw "START_MARKETPLACE_PHONE.ps1 not found in project root." }

$argsList = @()
if ($SkipBackend) { $argsList += "-SkipBackend" }
if ($StrictBackend) { $argsList += "-StrictBackend" }
if ($NoUninstall) { $argsList += "-NoUninstall" }

& powershell -NoProfile -ExecutionPolicy Bypass -File $startScript @argsList
exit $LASTEXITCODE
