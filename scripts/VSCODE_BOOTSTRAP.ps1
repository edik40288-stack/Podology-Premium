$ErrorActionPreference = "SilentlyContinue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$mobile = Join-Path $root "mobile_flutter"
$pubspec = Join-Path $mobile "pubspec.yaml"
$packageConfig = Join-Path $mobile ".dart_tool\package_config.json"
if (!(Test-Path $pubspec)) { exit 0 }
function Add-ToolPath {
    $items = @(
        "C:\dev\flutter\bin",
        "C:\flutter\bin",
        "C:\src\flutter\bin",
        "C:\tools\flutter\bin"
    )
    foreach ($item in $items) {
        if ($item -and (Test-Path $item) -and ($env:Path -notlike "*$item*")) { $env:Path += ";$item" }
    }
}
Add-ToolPath
$flutterCmd = Get-Command flutter -ErrorAction SilentlyContinue
if (!$flutterCmd) { exit 0 }
$needPubGet = $true
if (Test-Path $packageConfig) {
    try {
        $needPubGet = ((Get-Item $packageConfig).LastWriteTime -lt (Get-Item $pubspec).LastWriteTime)
    } catch { $needPubGet = $true }
}
if ($needPubGet) {
    Set-Location $mobile
    flutter pub get | Out-Host
}
exit 0
