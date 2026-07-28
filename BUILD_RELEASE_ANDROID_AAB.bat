@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0BUILD_RELEASE_ANDROID_AAB.ps1" %*
