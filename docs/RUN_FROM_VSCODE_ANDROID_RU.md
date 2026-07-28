# Запуск на реальном Android-телефоне из VS Code без Android Studio

Цель: подключить телефон кабелем, открыть проект в VS Code и запустить приложение одной командой из корня проекта.

## Главная команда

Из корня проекта:

```powershell
.\run_android.bat
```

или:

```powershell
powershell -ExecutionPolicy Bypass -File .\run_android.ps1
```

Скрипт делает сам:

1. Проверяет Flutter.
2. Проверяет подключенный Android-телефон.
3. Создаёт `root .env`, если его ещё нет.
4. Ставит backend-зависимости, если `node_modules` отсутствует.
5. Запускает backend в отдельном PowerShell-окне.
6. Включает `adb reverse tcp:3000 tcp:3000`, чтобы телефон по USB видел backend на ноутбуке.
7. Генерирует `android/` и `ios/`, если платформенные папки отсутствуют.
8. Выполняет `flutter pub get`.
9. Устанавливает и запускает приложение на телефоне.

## Почему используется API_BASE_URL=http://127.0.0.1:3000

На реальном Android-телефоне `localhost` — это сам телефон, а не ноутбук. Поэтому скрипт включает `adb reverse`: запросы телефона на `127.0.0.1:3000` уходят в backend на ноутбуке.

## Проверка телефона

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\check_android_usb.ps1
```

Проверить вручную:

```powershell
flutter doctor
flutter devices
adb devices
```

## Если телефон не виден

Проверить на телефоне:

- включён режим разработчика;
- включена USB-отладка;
- подтверждён RSA-ключ компьютера;
- USB-режим не только зарядка;
- кабель передаёт данные, а не только питание.

## Если backend не нужен

Можно запустить только мобильное приложение:

```powershell
.\run_android.bat -NoBackend
```

## Сборка APK

```powershell
.\run_android.bat -ReleaseApk
```

APK появится здесь:

```text
mobile_flutter\build\app\outputs\flutter-apk\app-release.apk
```

## Android Studio

Android Studio UI для ежедневного запуска не нужен. Нужны только Flutter SDK и Android SDK / Platform-Tools, чтобы работали `flutter` и `adb`.
