# Как запускать

## 1. Установить Flutter

Нужен Flutter SDK 3.24+ или новее.

Проверка:

```bash
flutter --version
flutter doctor
```

## 2. Запуск мобильного приложения

```bash
cd mobile_flutter
flutter pub get
flutter run
```

Для Android нужен Flutter SDK и Android SDK / Platform-Tools. Android Studio UI для ежедневной проверки не нужен.
Для iOS-сборки нужен macOS + Xcode.

## 3. Запуск backend

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

Проверка:

```bash
curl http://localhost:3000/health
```

## 4. Настройка YCLIENTS

В `root .env` нужно заполнить:

```env
YCLIENTS_PARTNER_TOKEN=
YCLIENTS_USER_TOKEN=
YCLIENTS_COMPANY_ID=
YCLIENTS_FORM_ID=
YCLIENTS_LOCALE=ru-RU
```

После этого backend сможет отдавать приложению услуги, мастеров, свободные даты/время и создавать записи.

## 5. Запуск приложения с backend URL

Для Android emulator обычно:

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000
```

Для iOS simulator:

```bash
flutter run --dart-define=API_BASE_URL=http://localhost:3000
```

Для реального Android-телефона по USB используем `adb reverse`, поэтому IP компьютера в локальной сети указывать не нужно. Основная команда — `./run_android.bat` из корня проекта.

---

## Режим Эдуарда: запуск на реальном Android по USB из корня проекта

Основная команда:

```powershell
.\run_android.bat
```

Это рекомендуемый сценарий проверки: без Android Studio UI, напрямую из VS Code/PowerShell. Детали: `docs/RUN_FROM_VSCODE_ANDROID_RU.md`.
