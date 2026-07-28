# P55 — финальная проверка thin backend перед ручным тестом

## Цель

Проверить последнюю версию проекта перед ручным запуском на телефоне: интерфейс клиента должен остаться таким же, а рабочая схема должна быть:

```text
Flutter app → thin backend → YCLIENTS + Telegram + маленькая техническая база
```

## Проверка соответствия новому плану

### Клиентский интерфейс

Интерфейс не превращён в набор внешних ссылок. В приложении остаются:

- главная;
- услуги;
- специалисты;
- запись;
- мои записи;
- чат;
- фото/видео;
- профиль;
- документы;
- удаление аккаунта.

### YCLIENTS

Мобильное приложение ходит в backend endpoints:

```text
/yclients/services
/yclients/staff
/yclients/dates
/yclients/times
/yclients/booking
/yclients/bookings
/yclients/bookings/:id/cancel
```

При реальных ключах YCLIENTS backend берёт услуги, специалистов, даты, время, создание записи и отмену записи из YCLIENTS. При локальном запуске без ключей backend отдаёт demo/fallback только для проверки интерфейса.

### Telegram

Чат остаётся внутри приложения. Сообщения клиента идут через backend в Telegram-группу/тему. Ответы администратора из Telegram возвращаются в приложение через bridge. Фото/видео отправляются в Telegram как нормальные медиа, а backend хранит технический индекс и cache, чтобы приложение могло показывать переписку.

### Маленькая база

Полноценную CRM в своей базе не строим. PostgreSQL в production нужен только для технических данных:

- сессии/профили;
- согласия;
- связка телефона с комнатой чата;
- Telegram topic/message id;
- индекс сообщений;
- технический cache созданных через приложение записей;
- настройки уведомлений.

### Смена телефона

Исправлено важное место: смена телефона больше не сохраняется только локально. Если клиент меняет телефон в профиле, приложение запрашивает код подтверждения, получает новый auth-token и только после этого сохраняет профиль.

## Проверки, выполненные в среде сборки

```text
backend npm ci — OK
backend npm run lint — OK
backend npm run build — OK
backend start in thin_proxy mode — OK
GET /health — OK, показывает thin_proxy / yclients / telegram
GET /yclients/status — OK
GET /content/home — OK
GET /yclients/services fallback — OK
auth request/verify local demo — OK
GET/PUT /profile — OK
POST /yclients/booking local demo — OK
GET /yclients/bookings — OK
POST /yclients/bookings/:id/cancel — OK
POST /chat/messages — OK
DELETE /auth/account — OK
один .env.example в корне — OK
лишних env-template файлов — нет
вложенных zip/apk/aab — нет
старые опасные формулировки UI типа “Врач-подолог”, “Медицинский педикюр” — не найдены
```

## Честное ограничение

В этой среде нет Flutter SDK, поэтому `flutter analyze` и реальная сборка Android/iOS здесь не запускались. Android ранее у пользователя запускался. В P55 Flutter-экраны не переделывались визуально; изменение по Flutter касается только логики подтверждения нового телефона.

## Что нужно для реального production-теста

Заполнить `.env` реальными значениями:

```env
APP_ENV=production
APP_OPERATING_MODEL=thin_proxy
AUTH_MODE=sms_ru
BOOKING_PROVIDER=yclients
PROFILE_PROVIDER=yclients
CHAT_PROVIDER=telegram
CHAT_HISTORY_MODE=technical_index
CHAT_MEDIA_PRIMARY=telegram
STORAGE_DRIVER=postgres
FILE_STORAGE_DRIVER=telegram
```

И добавить реальные ключи YCLIENTS, Telegram, SMS и DATABASE_URL.
