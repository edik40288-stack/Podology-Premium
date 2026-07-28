# Что нужно для запуска PODOLOG KUTSYTOI как постоянного приложения

## 1. Backend-сервер

Нужен постоянный backend в интернете. Он хранит ключи, общается с YCLIENTS, Telegram и отдаёт API приложению.

Минимально:

- Node.js 20/22 LTS;
- HTTPS-домен вида `https://api.podologkutsytoi.com`;
- переменные окружения из `.env.example`;
- постоянное хранилище для `backend/data` и `backend/storage`, если пока без PostgreSQL/S3.

## 2. База данных

Для MVP сейчас есть файловое хранение:

```text
backend/content/home.json       — контент главной
backend/data/chat-store.json    — комнаты чата, topic id, сообщения
backend/storage/content         — фото контента
backend/storage/chat            — фото/видео чата
```

Для рынка правильнее перейти на PostgreSQL:

```text
content_pages       — тексты главной, адрес, карта
content_media       — фото интерьера, работ, сертификатов
chat_rooms          — клиентские комнаты
chat_messages       — история сообщений
telegram_topics     — связь roomId ↔ Telegram topic id
admins              — Telegram ID сестры/админов
integration_status  — статус Telegram/YCLIENTS
```

## 3. Хранилище файлов

Фото/видео нельзя держать только в папке проекта на бесплатном/эфемерном сервере. Нужен один из вариантов:

- Cloudflare R2;
- S3-compatible storage;
- серверный persistent disk только для MVP.

## 4. Telegram

Нужно создать 2 бота через BotFather:

```text
@podolog_kutsytoi_admin_bot  — настройки приложения
@podolog_kutsytoi_chat_bot   — клиентский чат
```

Также нужна отдельная Telegram-группа:

```text
PODOLOG KUTSYTOI — чаты клиентов
```

В группе нужно включить темы. Чат-боту дать права администратора и право управлять темами.

## 5. YCLIENTS

YCLIENTS остаётся системой для:

- услуг;
- цен;
- специалистов;
- свободных окон;
- записей;
- базы клиентов.

В backend нужны:

```env
YCLIENTS_PARTNER_TOKEN=
YCLIENTS_USER_TOKEN=
YCLIENTS_COMPANY_ID=
YCLIENTS_FORM_ID=
```

## 6. Сборка мобильного приложения

Для разработки на телефоне:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\START_MARKETPLACE_PHONE.ps1
```

Для рынка Android нужно собрать AAB:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\BUILD_MARKETPLACE_ANDROID_AAB.ps1
```

Для iOS нужен Mac + Xcode + Apple Developer Account.

## 7. Что должно быть до публикации

- backend на сервере;
- домен и HTTPS;
- реальные Telegram bot tokens;
- Telegram group id с темами;
- YCLIENTS tokens;
- политика конфиденциальности;
- пользовательское соглашение;
- release Android AAB;
- iOS build через Xcode/TestFlight;
- проверка записи в YCLIENTS;
- проверка чата клиент → Telegram topic → ответ → приложение.
