# P21 Engineering Report

## Что добавлено

1. Production-ready env templates:
   - `.env.example`
   - `.env.example`

2. PostgreSQL-ready backend:
   - `backend/src/database/database.module.ts`
   - `backend/src/database/database.service.ts`
   - `backend/migrations/001_initial.sql`

3. Runtime storage modes:
   - `STORAGE_DRIVER=json` для локального ноутбука
   - `STORAGE_DRIVER=postgres` для production

4. Production guards:
   - HTTPS required in production
   - `AUTH_MODE=sms_ru` required
   - `STORAGE_DRIVER=postgres` required
   - required SMS/YCLIENTS/Telegram/privacy/support values

5. Server deployment:
   - `docker-compose.production.yml`
   - rebuilt production `backend/Dockerfile`
   - `scripts/DEPLOY_SERVER_DOCKER.sh`

6. Preflight:
   - `scripts/CHECK_PRODUCTION_READY.ps1`
   - `scripts/GENERATE_SECRET.ps1`

7. YCLIENTS mapping support:
   - `YCLIENTS_SERVICE_ID_MAP`
   - `YCLIENTS_STAFF_ID_MAP`

## Что проверено

- `backend npm run lint` OK
- `backend npm run build` OK
- `npm audit --omit=dev --audit-level=high` OK
- local backend starts OK
- `/health` OK
- `/health/ready` OK
- hidden test-mode auth OK when `.env` is present
- protected `/profile` OK with token
- `/chat/rooms` OK with test token
- `DELETE /auth/account` OK

## Ограничения

- Flutter build/analyze не проверялся в этой среде, потому что здесь нет Flutter SDK и реального Android/iOS окружения.
- Production HTTPS reverse proxy нужно поставить на сервере отдельно: Caddy/Nginx/Traefik.
- Реальные YCLIENTS service/staff IDs нужно получить в кабинете/интеграции YCLIENTS.
