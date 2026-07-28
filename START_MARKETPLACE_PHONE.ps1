param(
    [switch]$WithBackend,
    [switch]$StrictBackend,
    [switch]$SkipBackend,
    [switch]$NoUninstall
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$ApiBaseUrl = "http://127.0.0.1:3000"
$AppPackages = @("ru.podology.moscow.client")

# Market test mode: local backend starts by default. Use -SkipBackend only for UI-only checks.
if (!$SkipBackend) { $script:WithBackend = $true }


function Import-DotEnv([string]$Path) {
    if (!(Test-Path $Path)) { return }
    [System.IO.File]::ReadAllLines((Resolve-Path $Path), [System.Text.Encoding]::UTF8) | ForEach-Object {
        $line = $_.Trim()
        if (!$line -or $line.StartsWith('#') -or !$line.Contains('=')) { return }
        $parts = $line.Split('=', 2)
        $name = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"').Trim("'")
        if ($name) { [System.Environment]::SetEnvironmentVariable($name, $value, 'Process') }
    }
}

function DotEnvValue([string]$Name, [string]$Fallback) {
    $value = [System.Environment]::GetEnvironmentVariable($Name, 'Process')
    if ([string]::IsNullOrWhiteSpace($value)) { return $Fallback }
    return $value
}

function Add-ToolPath {
    $items = @(
        "C:\dev\flutter\bin",
        "C:\flutter\bin",
        "C:\src\flutter\bin",
        "C:\tools\flutter\bin",
        "C:\Program Files\nodejs",
        "$env:LOCALAPPDATA\Android\Sdk\platform-tools",
        "$env:ANDROID_HOME\platform-tools",
        "$env:ANDROID_SDK_ROOT\platform-tools"
    )
    foreach ($item in $items) {
        if ($item -and (Test-Path $item) -and ($env:Path -notlike "*$item*")) { $env:Path += ";$item" }
    }
}

function Has-Tool([string]$Name) {
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Require-Tool([string]$Name, [string]$Hint) {
    if (!(Has-Tool $Name)) { throw "Required tool not found: $Name. $Hint" }
}

function Check-Exit([string]$Step) {
    if ($LASTEXITCODE -ne 0) { throw "$Step failed. ExitCode=$LASTEXITCODE" }
}

function Write-Warn([string]$Text) {
    Write-Host $Text -ForegroundColor Yellow
}

function Test-JdkHome([string]$Path) {
    if ([string]::IsNullOrWhiteSpace($Path)) { return $false }
    $clean = $Path.Trim().Trim('"')
    return (Test-Path (Join-Path $clean "bin\java.exe"))
}

function Get-JavaVersionLine([string]$JavaExe) {
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $JavaExe
    $psi.Arguments = "-version"
    $psi.RedirectStandardError = $true
    $psi.RedirectStandardOutput = $true
    $psi.UseShellExecute = $false
    $p = [System.Diagnostics.Process]::Start($psi)
    $stderr = $p.StandardError.ReadToEnd()
    $stdout = $p.StandardOutput.ReadToEnd()
    $p.WaitForExit()
    $text = ($stderr + "`n" + $stdout).Trim()
    if (!$text) { return "java version detected" }
    return (($text -split "`r?`n") | Select-Object -First 1)
}

function Get-JavaMajor([string]$JavaExe) {
    $line = Get-JavaVersionLine $JavaExe
    if ($line -match '"(\d+)\.') { return [int]$Matches[1] }
    if ($line -match '"1\.(\d+)\.') { return [int]$Matches[1] }
    return $null
}

function Add-JdkCandidate($List, [string]$Path) {
    if ([string]::IsNullOrWhiteSpace($Path)) { return }
    $clean = $Path.Trim().Trim('"')
    if (Test-JdkHome $clean) { [void]$List.Add($clean) }
}

function Add-JdkCandidateFromJavaExe($List, [string]$JavaExe) {
    if ([string]::IsNullOrWhiteSpace($JavaExe)) { return }
    $cleanExe = $JavaExe.Trim().Trim('"')
    if (!(Test-Path $cleanExe)) { return }
    $binDir = Split-Path -Parent $cleanExe
    $jdkHomeCandidate = Split-Path -Parent $binDir
    Add-JdkCandidate $List $jdkHomeCandidate
}

function Add-JdkRegistryCandidates($List) {
    $keys = @(
        "HKLM:\SOFTWARE\Eclipse Adoptium",
        "HKLM:\SOFTWARE\WOW6432Node\Eclipse Adoptium",
        "HKCU:\SOFTWARE\Eclipse Adoptium",
        "HKLM:\SOFTWARE\JavaSoft",
        "HKLM:\SOFTWARE\WOW6432Node\JavaSoft",
        "HKCU:\SOFTWARE\JavaSoft"
    )
    foreach ($key in $keys) {
        if (!(Test-Path $key)) { continue }
        Get-ChildItem $key -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
            try {
                $props = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
                foreach ($name in @("JavaHome", "InstallationPath", "Path")) {
                    if ($props.$name) { Add-JdkCandidate $List ([string]$props.$name) }
                }
            } catch {}
        }
    }
}

function Select-Jdk17 {
    $items = New-Object System.Collections.Generic.List[string]

    Add-JdkCandidate $items $env:JAVA_HOME
    Add-JdkCandidate $items $env:JDK_HOME

    $cmd = Get-Command java.exe -ErrorAction SilentlyContinue
    if ($cmd -and $cmd.Source) { Add-JdkCandidateFromJavaExe $items $cmd.Source }

    try {
        $where = & where.exe java 2>$null
        foreach ($javaExe in $where) { Add-JdkCandidateFromJavaExe $items $javaExe }
    } catch {}

    Add-JdkRegistryCandidates $items

    foreach ($jdkHomePreset in @(
        "C:\Program Files\Android\Android Studio\jbr",
        "C:\Program Files\Android\Android Studio\jre",
        "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot",
        "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.10-hotspot",
        "C:\Program Files\Java\jdk-17"
    )) { Add-JdkCandidate $items $jdkHomePreset }

    foreach ($rootPath in @(
        "C:\Program Files\Eclipse Adoptium",
        "C:\Program Files\Java",
        (Join-Path $env:USERPROFILE ".jdks"),
        (Join-Path $env:LOCALAPPDATA "Programs\Eclipse Adoptium"),
        (Join-Path $env:LOCALAPPDATA "Programs\Java")
    )) {
        if (Test-Path $rootPath) {
            Get-ChildItem $rootPath -Directory -ErrorAction SilentlyContinue |
                Sort-Object Name -Descending |
                ForEach-Object { Add-JdkCandidate $items $_.FullName }
        }
    }

    $seen = @{}
    foreach ($jdkHomeCandidate in $items) {
        $key = $jdkHomeCandidate.ToLowerInvariant()
        if ($seen.ContainsKey($key)) { continue }
        $seen[$key] = $true
        $javaExe = Join-Path $jdkHomeCandidate "bin\java.exe"
        $major = Get-JavaMajor $javaExe
        if ($major -and $major -ge 17) { return $jdkHomeCandidate }
    }
    return $null
}

function Use-JdkForThisLaunch {
    $jdkHome = Select-Jdk17
    if (!$jdkHome) {
        throw "JDK 17+ was not found. Android Gradle cannot build APK without JDK. Install Temurin JDK 17, reopen VS Code/PowerShell, then run this command again."
    }
    $env:JAVA_HOME = $jdkHome
    $javaBin = Join-Path $jdkHome "bin"
    if ($env:Path -notlike "*$javaBin*") { $env:Path = "$javaBin;$env:Path" }
    Write-Host "JDK: $(Get-JavaVersionLine (Join-Path $jdkHome 'bin\java.exe'))" -ForegroundColor DarkGray
    Write-Host "JAVA_HOME: $jdkHome" -ForegroundColor DarkGray
}

function Get-NodeMajorVersion {
    if (!(Has-Tool "node")) { return $null }
    try {
        $raw = (node --version).Trim()
        if ($raw -match '^v(\d+)\.') { return [int]$Matches[1] }
        return $null
    } catch { return $null }
}

function Test-BackendHealth {
    try {
        $result = Invoke-RestMethod -Uri "$ApiBaseUrl/health" -Method Get -TimeoutSec 2
        return ($result.ok -eq $true)
    } catch { return $false }
}

function Wait-BackendHealth([int]$Seconds) {
    $deadline = (Get-Date).AddSeconds($Seconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-BackendHealth) { return $true }
        Start-Sleep -Seconds 2
    }
    return $false
}

function Test-BackendDepsReady([string]$Path) {
    $checks = @(
        (Join-Path $Path "node_modules\@nestjs\cli\bin\nest.js"),
        (Join-Path $Path "node_modules\@nestjs\core"),
        (Join-Path $Path "node_modules\typescript\bin\tsc")
    )
    foreach ($item in $checks) { if (!(Test-Path $item)) { return $false } }
    return $true
}

function Start-BackendIfRequested([string]$RootPath, [string]$BackendPath) {
    if ($StrictBackend) { $script:WithBackend = $true }
    if ($SkipBackend -or !$WithBackend) { return $false }

    if (!(Has-Tool "node") -or !(Has-Tool "npm")) {
        $msg = "Node/npm not found. Local backend cannot start."
        if ($StrictBackend) { throw $msg }
        Write-Warn $msg
        return $false
    }

    $nodeMajor = Get-NodeMajorVersion
    if ($nodeMajor -and $nodeMajor -gt 22) {
        Write-Warn "Node $nodeMajor detected. V14 includes backend/node_modules and dist for laptop-real quick run; local backend will be tried. For final production builds, prefer Node 20/22 LTS."
    }

    if (Test-BackendHealth) { return $true }

    try {
        Set-Location $BackendPath
        if (!(Test-BackendDepsReady $BackendPath)) {
            Write-Warn "backend/node_modules not found. Trying safe npm install once."
            & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $RootPath "scripts\INSTALL_BACKEND_DEPS_SAFE.ps1") -BackendPath $BackendPath | Out-Host
            if ($LASTEXITCODE -ne 0) { throw "backend dependencies failed. ExitCode=$LASTEXITCODE" }
        }

        $distMain = Join-Path $BackendPath "dist\main.js"
        if (!(Test-Path $distMain)) {
            Write-Warn "backend/dist/main.js not found. Building backend once."
            & npm run build | Out-Host
            if ($LASTEXITCODE -ne 0) { throw "backend build failed. ExitCode=$LASTEXITCODE" }
        }
        if (!(Test-Path $distMain)) { throw "backend dist/main.js not found" }

        $backendCommand = ([char]36) + "env:PORT='3000'; node dist/main.js"
        Start-Process -FilePath "powershell.exe" -WorkingDirectory $BackendPath -ArgumentList @(
            "-NoExit",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-Command",
            $backendCommand
        )

        return (Wait-BackendHealth 60)
    } catch {
        if ($StrictBackend) { throw }
        Write-Warn "Local backend was not started. App will use demo/fallback data. $($_.Exception.Message)"
        return $false
    }
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptRoot
$root = (Get-Location).Path
$backend = Join-Path $root "backend"
$mobile = Join-Path $root "mobile_flutter"

Write-Host "=== PODOLOG KUTSYTOI CONTENT ADMIN PHONE START v3.10 / P59 quick backend ===" -ForegroundColor Cyan
Write-Host "Root: $root" -ForegroundColor DarkGray

if (!(Test-Path $backend)) { throw "backend folder not found. Run from project root." }
if (!(Test-Path $mobile)) { throw "mobile_flutter folder not found. Run from project root." }

$envFile = Join-Path $root ".env"
$envExample = Join-Path $root ".env.example"
if (!(Test-Path $envFile) -and (Test-Path $envExample)) {
    Copy-Item $envExample $envFile
    Write-Host "Created root .env from .env.example. Fill Telegram/YCLIENTS values when needed." -ForegroundColor Yellow
}
Import-DotEnv $envFile
$ApiBaseUrl = DotEnvValue "API_BASE_URL" $ApiBaseUrl

Add-ToolPath
Require-Tool "flutter" "Flutter SDK is missing or not in PATH."
Require-Tool "adb" "Android SDK platform-tools are missing or not in PATH."
Use-JdkForThisLaunch

Write-Host "Flutter: $(flutter --version | Select-Object -First 1)" -ForegroundColor DarkGray
Write-Host "ADB: $(adb version | Select-Object -First 1)" -ForegroundColor DarkGray

Write-Host "[1/6] Flutter packages" -ForegroundColor Green
Set-Location $mobile
flutter pub get
Check-Exit "flutter pub get"
Set-Location $root

Write-Host "[2/6] Backend configuration and local API start" -ForegroundColor Green
$backendOnline = Start-BackendIfRequested -RootPath $root -BackendPath $backend
if ($backendOnline) { Write-Host "Backend: local API online at $ApiBaseUrl" -ForegroundColor Green }
else { if ($StrictBackend -or $WithBackend) { throw "Backend did not start. Fix backend before market/API testing, or run with -SkipBackend for UI-only mode." } else { Write-Host "Backend: local API not started for this run" -ForegroundColor DarkGray } }

Write-Host "[3/6] Android USB device" -ForegroundColor Green
adb start-server
Check-Exit "adb start-server"
Start-Sleep -Seconds 2
$deviceList = adb devices
$deviceList | Write-Host
$deviceLine = $deviceList | Select-String "`tdevice$" | Select-Object -First 1
if (!$deviceLine) { throw "Android phone is not authorized. Unlock phone and approve USB debugging, then run again." }
$deviceSerial = ($deviceLine.ToString() -split "\s+")[0]
Write-Host "Android device: $deviceSerial" -ForegroundColor Green

Write-Host "[4/6] Android project" -ForegroundColor Green
powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root "scripts\PREPARE_ANDROID.ps1")
Check-Exit "Android project"

Write-Host "[5/6] ADB reverse" -ForegroundColor Green
adb reverse tcp:3000 tcp:3000
if ($LASTEXITCODE -ne 0) { Write-Warn "adb reverse tcp:3000 failed. The app can still run; local backend may be unreachable."; $global:LASTEXITCODE = 0 }

if (!$NoUninstall) {
    foreach ($pkg in $AppPackages) {
        adb shell am force-stop $pkg 2>$null | Out-Null
        adb uninstall $pkg 2>$null | Out-Null
        adb shell pm uninstall --user 0 $pkg 2>$null | Out-Null
    }
    $global:LASTEXITCODE = 0
}

Write-Host "[6/6] Build, install, launch" -ForegroundColor Green
Set-Location $mobile
$dartDefines = @(
    "--dart-define=APP_ENV=$(DotEnvValue 'APP_ENV' 'local')",
    "--dart-define=API_BASE_URL=$ApiBaseUrl",
    "--dart-define=PRIVACY_POLICY_URL=$(DotEnvValue 'PRIVACY_POLICY_URL' 'https://podologkutsytoi.com/legal/privacy')",
    "--dart-define=TERMS_URL=$(DotEnvValue 'TERMS_URL' 'https://podologkutsytoi.com/legal/terms')",
    "--dart-define=ACCOUNT_DELETION_URL=$(DotEnvValue 'ACCOUNT_DELETION_URL' 'https://podologkutsytoi.com/legal/account-deletion')",
    "--dart-define=SUPPORT_EMAIL=$(DotEnvValue 'SUPPORT_EMAIL' 'danilova.danilova.99@mail.ru')"
)
flutter run -d $deviceSerial @dartDefines
Check-Exit "flutter run"
