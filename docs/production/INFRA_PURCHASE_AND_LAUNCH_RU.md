# P21 — что купить и куда вставить

Цель: проект должен оставаться запускаемым локально с ноутбука, но быть готовым к боевому контуру. После покупки инфраструктуры копируете `.env.example` в `.env`, заполняете значения и запускаете production-команды.

## 1. Что купить / подготовить

### Обязательно

1. **Домен**
   - пример: `podologkutsytoi.com`
   - желательно отдельный API-subdomain: `api.podologkutsytoi.com`

2. **VPS / сервер**
   - Ubuntu 22.04/24.04
   - Docker + Docker Compose
   - открытые порты: `80`, `443`, временно `3000` только для проверки

3. **PostgreSQL**
   - можно встроенный контейнер из `docker-compose.production.yml`
   - или внешний managed PostgreSQL

4. **SMS.ru**
   - нужен `SMS_RU_API_ID`

5. **YCLIENTS / Altegio**
   - `YCLIENTS_PARTNER_TOKEN`
   - `YCLIENTS_USER_TOKEN`
   - `YCLIENTS_COMPANY_ID`
   - `YCLIENTS_FORM_ID`
   - реальные service_id/staff_id

6. **Telegram**
   - бот для клиентских чатов
   - Telegram group/supergroup/forum для заявок
   - `TELEGRAM_CHAT_BOT_TOKEN`
   - `TELEGRAM_CHAT_GROUP_ID`
   - при желании отдельный admin bot

7. **Документы для магазинов**
   - Privacy Policy URL
   - Terms URL
   - Support email

## 2. Главные файлы

```text
.env.example                 локальный/dev шаблон
.env.example                 единый локальный/боевой шаблон
scripts/CHECK_PRODUCTION_READY.ps1
scripts/DEPLOY_SERVER_DOCKER.sh
docker-compose.production.yml
backend/migrations/001_initial.sql
```

## 3. Локальный запуск сейчас

```powershell
powershell -ExecutionPolicy Bypass -File .\RUN_LOCAL_ANDROID.ps1
```

Локально используется:

```env
APP_ENV=local
AUTH_MODE=local_demo
STORAGE_DRIVER=json
API_BASE_URL=http://127.0.0.1:3000
```

## 4. Production `.env`

Создать:

```powershell
copy .env.example .env
```

Минимально заменить:

```env
APP_ENV=production
AUTH_MODE=sms_ru
STORAGE_DRIVER=postgres
API_BASE_URL=https://api.podologkutsytoi.com
APP_PUBLIC_BASE_URL=https://api.podologkutsytoi.com
DATABASE_URL=postgresql://podolog:REAL_PASSWORD@postgres:5432/podolog
APP_JWT_SECRET=REAL_RANDOM_64_CHARS_SECRET
SMS_RU_API_ID=...
YCLIENTS_PARTNER_TOKEN=...
YCLIENTS_USER_TOKEN=...
YCLIENTS_COMPANY_ID=...
YCLIENTS_FORM_ID=...
TELEGRAM_CHAT_BOT_TOKEN=...
TELEGRAM_CHAT_GROUP_ID=...
PRIVACY_POLICY_URL=https://podologkutsytoi.com/legal/privacy
TERMS_URL=https://podologkutsytoi.com/legal/terms
SUPPORT_EMAIL=...
```

Сгенерировать секрет можно так:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\GENERATE_SECRET.ps1
```

## 5. Проверка `.env` перед релизом

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\CHECK_PRODUCTION_READY.ps1
```

Скрипт падает, если:

- остался `localhost` в production;
- `AUTH_MODE` не `sms_ru`;
- `STORAGE_DRIVER` не `postgres`;
- не заполнены SMS/YCLIENTS/Telegram/privacy/support;
- остались placeholder-значения.

## 6. База данных

В production включено:

```env
STORAGE_DRIVER=postgres
RUN_DB_MIGRATIONS_ON_START=true
```

Backend сам создаёт таблицы при старте. Схема также лежит в:

```text
backend/migrations/001_initial.sql
```

Таблицы:

- `profiles`
- `chat_rooms`
- `chat_messages`
- `telegram_messages`
- `bookings_log`

## 7. YCLIENTS mapping

Если приложение показывает услуги из локального контента, их app ID надо связать с реальными ID YCLIENTS:

```env
YCLIENTS_SERVICE_ID_MAP={"1953297177":1001,"1953297178":1002,"1953297179":1003,"1953297180":1004}
YCLIENTS_STAFF_ID_MAP={"892137109":2001,"892137110":2002,"892137111":2003}
```

Слева — внутренний numeric app ID, справа — реальный ID в YCLIENTS.

## 8. Server deploy через Docker

На сервере:

```bash
cp .env.example .env
nano .env
bash scripts/DEPLOY_SERVER_DOCKER.sh
```

Проверка:

```bash
curl https://api.podologkutsytoi.com/health
curl https://api.podologkutsytoi.com/health/ready
```

## 9. Android AAB

Когда backend уже на HTTPS:

```powershell
powershell -ExecutionPolicy Bypass -File .\BUILD_RELEASE_ANDROID_AAB.ps1
```

Скрипт сам проверит `.env`, выполнит `flutter analyze`, затем соберёт `.aab`.

## 10. Скрытый тестовый режим для ревью

В `.env`:

```env
TEST_MODE_ENABLED=true
TEST_MODE_FIRST_NAME=Тест
TEST_MODE_LAST_NAME=Маркет
TEST_MODE_PHONE=+79990000000
```

В store review notes указываете эти 3 поля. При вводе этих данных backend сразу выдаёт тестовый токен без SMS.

## 11. Что всё равно делается после покупки

- настроить DNS `api.podologkutsytoi.com` на VPS;
- поставить HTTPS reverse proxy/Caddy/Nginx;
- заполнить реальные YCLIENTS ids;
- проверить запись в реальном филиале;
- проверить Telegram group/forum;
- собрать `.aab`;
- сделать store screenshots и metadata.
