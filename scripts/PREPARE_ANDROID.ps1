param(
    [switch]$MarketplaceSdk
)

$ErrorActionPreference = "Stop"

$AppId = "ru.podology.moscow.client"
$FlutterOrg = "ru.podology.moscow"
$FlutterProjectName = "podology_premium_client"

function Write-Utf8NoBom([string]$Path, [string]$Text) {
    $enc = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Text, $enc)
}


function Set-AndroidStyleItem([string]$Xml, [string]$Name, [string]$Value) {
    $escapedName = [regex]::Escape($Name)
    $item = "        <item name=`"$Name`">$Value</item>"
    if ($Xml -match "<item\s+name=`"$escapedName`">[^<]*</item>") {
        return [regex]::Replace($Xml, "<item\s+name=`"$escapedName`">[^<]*</item>", $item)
    }
    return [regex]::Replace($Xml, '</style>', "$item`r`n    </style>")
}

function Patch-AndroidSystemBars([string]$MobileRoot) {
    $resRoot = Join-Path $MobileRoot "android\app\src\main\res"
    $styleFiles = @(
        (Join-Path $resRoot "values\styles.xml"),
        (Join-Path $resRoot "values-night\styles.xml")
    )
    foreach ($stylePath in $styleFiles) {
        if (!(Test-Path $stylePath)) { continue }
        $xml = Get-Content $stylePath -Raw
        $xml = Set-AndroidStyleItem $xml "android:windowNoTitle" "true"
        $xml = Set-AndroidStyleItem $xml "android:windowActionBar" "false"
        $xml = Set-AndroidStyleItem $xml "android:windowDrawsSystemBarBackgrounds" "true"
        $xml = Set-AndroidStyleItem $xml "android:statusBarColor" "#FAF8F1"
        $xml = Set-AndroidStyleItem $xml "android:navigationBarColor" "#FAF8F1"
        $xml = Set-AndroidStyleItem $xml "android:windowLightStatusBar" "true"
        $xml = Set-AndroidStyleItem $xml "android:windowLightNavigationBar" "true"
        $xml = Set-AndroidStyleItem $xml "android:enforceStatusBarContrast" "false"
        $xml = Set-AndroidStyleItem $xml "android:enforceNavigationBarContrast" "false"
        Write-Utf8NoBom $stylePath $xml
    }

    $launchXml = @"
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item>
        <shape android:shape="rectangle">
            <solid android:color="#FAF8F1" />
        </shape>
    </item>
</layer-list>
"@
    $launchXml = $launchXml.Trim()
    foreach ($drawablePath in @(
        (Join-Path $resRoot "drawable\launch_background.xml"),
        (Join-Path $resRoot "drawable-v21\launch_background.xml")
    )) {
        if (!(Test-Path (Split-Path -Parent $drawablePath))) {
            New-Item -ItemType Directory -Path (Split-Path -Parent $drawablePath) | Out-Null
        }
        Write-Utf8NoBom $drawablePath $launchXml
    }
}

function Get-HighestInstalledAndroidApi {
    $roots = @($env:ANDROID_HOME, $env:ANDROID_SDK_ROOT, "$env:LOCALAPPDATA\Android\Sdk") | Where-Object { $_ -and (Test-Path $_) }
    foreach ($sdkRoot in $roots) {
        $platforms = Join-Path $sdkRoot "platforms"
        if (Test-Path $platforms) {
            $apis = Get-ChildItem $platforms -Directory -ErrorAction SilentlyContinue |
                Where-Object { $_.Name -match '^android-\d+$' } |
                ForEach-Object { [int]($_.Name -replace 'android-', '') } |
                Sort-Object -Descending
            if ($apis -and $apis.Count -gt 0) { return $apis[0] }
        }
    }
    return $null
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $root
$mobile = Join-Path $root "mobile_flutter"
if (!(Test-Path $mobile)) { throw "mobile_flutter folder not found" }
Set-Location $mobile

if (!(Test-Path (Join-Path $mobile "android\app\build.gradle.kts"))) {
    Write-Host "Android native files: generating from Flutter template" -ForegroundColor Cyan
    & flutter create --org $FlutterOrg --project-name $FlutterProjectName --platforms=android .
    if ($LASTEXITCODE -ne 0) { throw "flutter create android failed" }
}

$gradlePath = Join-Path $mobile "android\app\build.gradle.kts"
$manifestPath = Join-Path $mobile "android\app\src\main\AndroidManifest.xml"
if (!(Test-Path $gradlePath)) { throw "Missing Gradle file: $gradlePath" }
if (!(Test-Path $manifestPath)) { throw "Missing AndroidManifest: $manifestPath" }

$gradle = Get-Content $gradlePath -Raw
$gradle = [regex]::Replace($gradle, 'namespace\s*=\s*"[^"]*"', "namespace = `"$AppId`"")
$gradle = [regex]::Replace($gradle, 'applicationId\s*=\s*"[^"]*"', "applicationId = `"$AppId`"")

# DEV MODE: use Flutter defaults for stable phone launch from VS Code.
# MARKETPLACE MODE: when building AAB, use the highest installed SDK if it is >= 35.
if ($MarketplaceSdk) {
    $api = Get-HighestInstalledAndroidApi
    if ($api -and $api -ge 35) {
        $gradle = [regex]::Replace($gradle, 'compileSdk\s*=\s*flutter\.compileSdkVersion', "compileSdk = $api")
        $gradle = [regex]::Replace($gradle, 'compileSdk\s*=\s*\d+', "compileSdk = $api")
        $gradle = [regex]::Replace($gradle, 'targetSdk\s*=\s*flutter\.targetSdkVersion', "targetSdk = $api")
        $gradle = [regex]::Replace($gradle, 'targetSdk\s*=\s*\d+', "targetSdk = $api")
        Write-Host "Marketplace SDK mode: compileSdk/targetSdk = $api" -ForegroundColor Green
    } else {
        throw "Marketplace SDK mode requires installed Android SDK 35+ for Google Play target API compliance."
    }
}

if ($gradle -notmatch 'minSdk\s*=') {
    $gradle = [regex]::Replace($gradle, 'defaultConfig\s*\{', "defaultConfig {`r`n        minSdk = 23", 1)
}
Write-Utf8NoBom $gradlePath $gradle

$manifest = Get-Content $manifestPath -Raw
$permissions = @(
    "android.permission.INTERNET",
    "android.permission.READ_MEDIA_IMAGES",
    "android.permission.READ_MEDIA_VIDEO",
    "android.permission.READ_MEDIA_VISUAL_USER_SELECTED"
)
foreach ($permission in $permissions) {
    if ($manifest -notmatch [regex]::Escape($permission)) {
        $line = "    <uses-permission android:name=`"$permission`" />"
        $manifest = [regex]::Replace($manifest, '(<manifest[^>]*>)', "`$1`r`n$line", 1)
    }
}

$manifest = [regex]::Replace($manifest, 'android:name="[^"]*MainActivity"', 'android:name="io.flutter.embedding.android.FlutterActivity"')
if ($manifest -notmatch 'io\.flutter\.embedding\.android\.FlutterActivity') {
    throw "Manifest launch Activity was not patched to FlutterActivity"
}
$cleartextValue = if ($MarketplaceSdk) { "false" } else { "true" }
if ($manifest -match 'android:usesCleartextTraffic="[^"]*"') {
    $manifest = [regex]::Replace($manifest, 'android:usesCleartextTraffic="[^"]*"', "android:usesCleartextTraffic=`"$cleartextValue`"")
} else {
    $manifest = [regex]::Replace($manifest, '<application', "<application android:usesCleartextTraffic=`"$cleartextValue`"", 1)
}
$appLabel = if ($env:APP_DISPLAY_NAME) { $env:APP_DISPLAY_NAME } else { "PODOLOG KUTSYTOI" }
$manifest = [regex]::Replace($manifest, 'android:label="[^"]*"', "android:label=`"$appLabel`"", 1)
Write-Utf8NoBom $manifestPath $manifest

Patch-AndroidSystemBars $mobile

$mainDirs = @(
    (Join-Path $mobile "android\app\src\main\kotlin"),
    (Join-Path $mobile "android\app\src\main\java")
)
foreach ($dir in $mainDirs) {
    if (Test-Path $dir) {
        Get-ChildItem $dir -Recurse -Include "MainActivity.kt","MainActivity.java" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
    }
}

$iconRoot = Join-Path $mobile "assets\launcher_icons\android"
$resRoot = Join-Path $mobile "android\app\src\main\res"
$densities = @("mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi")
foreach ($density in $densities) {
    $sourceDir = Join-Path $iconRoot $density
    $targetDir = Join-Path $resRoot $density
    if (!(Test-Path $sourceDir)) { throw "Missing launcher icon source folder: $sourceDir" }
    if (!(Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir | Out-Null }
    Copy-Item (Join-Path $sourceDir "ic_launcher.png") (Join-Path $targetDir "ic_launcher.png") -Force
    Copy-Item (Join-Path $sourceDir "ic_launcher_round.png") (Join-Path $targetDir "ic_launcher_round.png") -Force
}
$adaptiveDir = Join-Path $resRoot "mipmap-anydpi-v26"
if (Test-Path $adaptiveDir) {
    Get-ChildItem $adaptiveDir -Filter "ic_launcher*.xml" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
}

Write-Host "Android project ready: $AppId, fullscreen system bars enabled" -ForegroundColor Green
