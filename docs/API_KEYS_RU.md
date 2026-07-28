# API-ключи и переменные окружения

Файл для локального запуска:

```text
root .env
```

## Telegram

```env
TELEGRAM_ADMIN_ENABLE=true
TELEGRAM_ADMIN_BOT_TOKEN=токен_админ_бота_из_BotFather
TELEGRAM_ADMIN_IDS=telegram_id_сестры_или_твой_id

TELEGRAM_ENABLE_NOTIFICATIONS=true
TELEGRAM_CHAT_BRIDGE_ENABLE=true
TELEGRAM_CHAT_BOT_TOKEN=токен_чат_бота_из_BotFather
TELEGRAM_CHAT_GROUP_ID=-100xxxxxxxxxx
TELEGRAM_CHAT_TOPICS_ENABLED=true
```

Админ-бот не добавляется в группу. Чат-бот добавляется в группу, становится админом и получает право управлять темами.

## YCLIENTS / Altegio

```env
YCLIENTS_API_BASE_URL=
YCLIENTS_PARTNER_TOKEN=partner_token
YCLIENTS_USER_TOKEN=user_token
YCLIENTS_COMPANY_ID=company_id
YCLIENTS_FORM_ID=form_id
YCLIENTS_LOCALE=ru-RU
```

Пока YCLIENTS-переменные пустые или placeholder, backend отдаёт demo-data.

## P53 thin backend production mode

Для экономичного режима, где YCLIENTS ведёт записи/клиентов, а Telegram хранит чат/медиа:

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

В этом режиме S3/R2 не обязателен. Нужна небольшая техническая PostgreSQL-база для сессий, согласий, связки клиента с YCLIENTS/Telegram и индексов сообщений.
