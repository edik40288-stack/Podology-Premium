# Режим ноутбука с реальными YCLIENTS и Telegram

Этот режим нужен прямо сейчас, когда приложение тестируется на ноутбуке/телефоне, но сервер, домен, push и SMS-провайдер ещё не куплены.

## Что работает реально

- YCLIENTS / Altegio: услуги, специалисты, даты, время, создание записи, отмена/синхронизация по доступным API.
- Telegram: админ-уведомления, клиентский чат, фото/видео через multipart upload, fallback в document, retry недоставленных сообщений.

## Что остаётся локальным/демо

- SMS: локальный код `1111`, без SMS.ru.
- Backend URL: `http://127.0.0.1:3000`.
- Домен/HTTPS: не требуется.
- Push: не требуется.
- PostgreSQL: не требуется; используется JSON-хранилище для локального технического индекса.

## Запуск

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\START_LAPTOP_REAL_INTEGRATIONS.ps1
```

Скрипт делает три вещи:

1. Переключает `.env` в `LAPTOP_REAL_INTEGRATIONS`.
2. Проверяет, что реальные YCLIENTS и Telegram значения заполнены.
3. Запускает обычный телефонный старт через `START_MARKETPLACE_PHONE.ps1 -StrictBackend`.

## Важная граница

`CHECK_PRODUCTION_READY.ps1` не подходит для ноутбука. Он создан для финального релиза и обязан требовать:

- `APP_ENV=production`
- `AUTH_MODE=sms_ru`
- `SMS_RU_API_ID`
- HTTPS-домены
- PostgreSQL
- legal URLs

Для ноутбука используй:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\CHECK_LAPTOP_REAL_READY.ps1
```

## Какие env должны быть настоящими уже сейчас

```env
YCLIENTS_PARTNER_TOKEN=...
YCLIENTS_USER_TOKEN=...
YCLIENTS_COMPANY_ID=...
YCLIENTS_FORM_ID=...
TELEGRAM_ADMIN_BOT_TOKEN=...
TELEGRAM_ADMIN_IDS=...
TELEGRAM_CHAT_BOT_TOKEN=...
TELEGRAM_CHAT_GROUP_ID=...
```

## Какие env специально демо сейчас

```env
APP_ENV=local
AUTH_MODE=local_demo
LOCAL_DEMO_CODE=1111
SMS_PROVIDER=demo
SMS_DEMO_MODE=true
SMS_RU_API_ID=local_demo_sms_not_required_on_laptop
API_BASE_URL=http://127.0.0.1:3000
APP_PUBLIC_BASE_URL=http://127.0.0.1:3000
STORAGE_DRIVER=json
FILE_STORAGE_DRIVER=telegram
```

## Почему FILE_STORAGE_DRIVER=telegram на ноуте

Файлы сначала сохраняются локально в `backend/storage/chat`, а затем backend отправляет их в Telegram как реальный multipart-файл. Telegram не обязан видеть localhost URL, потому что backend отправляет сам файл, а не ссылку. Это важно для фото/видео.
