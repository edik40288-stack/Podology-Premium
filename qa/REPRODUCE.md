# PODOLOGY — РУКОВОДСТВО ПО ВОСПРОИЗВЕДЕНИЮ ТЕСТОВ (REPRODUCE.MD)

Инструкция предназначена для независимого запуска тестовой системы на любой локальной машине или в CI-окружении (Ubuntu/Windows).

---

## 1. Требования к окружению

- **Node.js**: v18+ или v20+ (рекомендуется v24)
- **Git**: 2.30+
- **Playwright**: 1.50+
- **Wrangler**: встроен в devDependencies репозитория CRM (`@cloudflare/wrangler`)

---

## 2. Развертывание сервисов

### Шаг 1: Запуск тестового инстанса CRM (Cloudflare Worker + Local D1)
```bash
cd repos/crm
# Увеличить размер кучи Node.js для тяжелых компиляций
export NODE_OPTIONS="--max-old-space-size=8192"
npx wrangler dev --config dist/server/wrangler.json --local --persist-to "../../environment/test-d1" --port 8787 --ip 127.0.0.1 --var CRM_OWNER_EMAIL:owner-01@example.invalid
```
*Проверка здоровья:* `curl -s http://127.0.0.1:8787/api/portal?op=bootstrap` (должен вернуть HTTP 200).

### Шаг 2: Запуск статического веб-сайта
```bash
node environment/static-server.js
```
*Проверка здоровья:* `curl -s -I http://127.0.0.1:4173/` (должен вернуть HTTP 200 OK).

---

## 3. Запуск автоматических тестов

### 1. Запуск сквозных бизнес-процессов (E2E Business Flows):
```bash
npx playwright test qa/tests/e2e-business-flows.spec.js --reporter=list
```
*Ожидаемый результат:* 8 passed.

### 2. Запуск UI-тестов интерфейса (V2 Zero-Trust):
```bash
# Тесты интерфейса CRM (Владелец, Менеджер, Администратор, Специалист)
npx playwright test qa/v2-tests/v2-crm-batch-1.spec.js
npx playwright test qa/v2-tests/v2-crm-batch-2.spec.js
npx playwright test qa/v2-tests/v2-crm-batch-3.spec.js
npx playwright test qa/v2-tests/v2-crm-batch-4.spec.js

# Тесты клиентского портала и сайта
npx playwright test qa/v2-tests/v2-client-batch-1.spec.js
npx playwright test qa/v2-tests/v2-client-batch-2.spec.js
npx playwright test qa/v2-tests/v2-client-batch-3.spec.js
npx playwright test qa/v2-tests/v2-client-batch-4.spec.js
```

### 3. Проведение AST-аудита чистоты тестов:
```bash
node scripts/ast-audit.js
```
*Ожидаемый результат:* 0 нарушений в `qa/v2-tests`.
