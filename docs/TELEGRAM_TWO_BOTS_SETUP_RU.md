# Telegram: два бота и группа с темами

## Роли

| Что | Назначение |
|---|---|
| Админ-бот | управление контентом приложения |
| Чат-бот | переписка клиентов из приложения |
| Группа с темами | рабочее место сестры для клиентских чатов |

## 1. Админ-бот

В `@BotFather` получи токен админ-бота и вставь:

```env
TELEGRAM_ADMIN_BOT_TOKEN=...
```

Получить Telegram ID администратора можно через `@userinfobot`:

```env
TELEGRAM_ADMIN_IDS=123456789
```

Если администраторов несколько:

```env
TELEGRAM_ADMIN_IDS=123456789,987654321
```

## 2. Чат-бот

В `@BotFather` получи токен чат-бота и вставь:

```env
TELEGRAM_CHAT_BOT_TOKEN=...
```

У чат-бота выключи privacy:

```text
BotFather → /mybots → чат-бот → Bot Settings → Group Privacy → Turn off
```

## 3. Группа с темами

Создай Telegram-группу для чатов клиентов и включи темы.

Добавь чат-бота в группу и сделай его админом. Права:

```text
отправлять сообщения
отправлять медиа
управлять темами
```

## 4. ID группы

ID группы должен начинаться с `-100`.

В `.env` вставь:

```env
TELEGRAM_CHAT_GROUP_ID=-100xxxxxxxxxx
TELEGRAM_CHAT_TOPICS_ENABLED=true
TELEGRAM_CHAT_BRIDGE_ENABLE=true
```

## 5. Проверка

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\CHECK_TELEGRAM_ENV.ps1
```

Должно быть:

```text
admin token: OK
chat token: OK
chat group: OK
send test: OK
create topic: OK
```
