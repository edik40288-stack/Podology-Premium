# P56 — финальная перепроверка для запуска на ноуте

Дата: 2026-06-22

## Что проверено

- Клиентский интерфейс не переведён в WebView/ссылку на YCLIENTS.
- Приложение остаётся приложением: главная, услуги, специалисты, запись, мои записи, чат, профиль, документы.
- Текущая архитектура зафиксирована как thin backend:
  - услуги, специалисты, даты, время, создание/отмена записей — через YCLIENTS;
  - чат, фото, видео — через Telegram;
  - локальная/серверная база — только техническая: сессии, согласия, связки, индексы сообщений.
- Для локального запуска без реальных ключей YCLIENTS остаётся local preview, чтобы можно было открыть приложение на телефоне и проверить интерфейс.
- В production без реальных YCLIENTS/SMS/Telegram ключей backend не стартует.
- В production без PostgreSQL backend не стартует: маленькая техническая база обязательна.
- Фейковые предстоящие записи больше не подмешиваются клиенту автоматически.
- Если нет доступных окон, кнопка записи не создаёт локальную фейковую запись.

## Backend-проверки

Выполнено:

```text
npm ci — OK
npm run lint — OK
npm run build — OK
backend local start — OK
GET /health — OK
GET /content/home — OK
GET /yclients/status — OK
GET /yclients/services — OK, local preview без ключей
POST /auth/request-code — OK
POST /auth/verify-code — OK
GET /profile — OK
POST /yclients/booking — OK в local preview
GET /yclients/bookings — OK
POST /chat/messages — OK
GET /chat/rooms/:roomId/messages — OK
DELETE /auth/account — OK
```

## Честное ограничение

Flutter SDK в текущей среде отсутствует, поэтому `flutter analyze` и реальная Android/iOS сборка здесь не запускались. Для проверки на ноуте запускай проект штатной командой через PowerShell.

## Команды на ноуте

Из корня проекта:

```powershell
copy .env.example .env
powershell -NoProfile -ExecutionPolicy Bypass -File .\BOOTSTRAP_PROJECT.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\START_MARKETPLACE_PHONE.ps1
```

## Production-логика

Для боевого запуска нужно заполнить `.env`:

```text
APP_ENV=production
APP_OPERATING_MODEL=thin_proxy
AUTH_MODE=sms_ru
STORAGE_DRIVER=postgres
FILE_STORAGE_DRIVER=telegram
BOOKING_PROVIDER=yclients
PROFILE_PROVIDER=yclients
CHAT_PROVIDER=telegram
CHAT_MEDIA_PRIMARY=telegram
```

И добавить реальные значения: `DATABASE_URL`, `SMS_RU_API_ID`, `YCLIENTS_*`, `TELEGRAM_*`, `APP_JWT_SECRET`, доменные URL документов.
