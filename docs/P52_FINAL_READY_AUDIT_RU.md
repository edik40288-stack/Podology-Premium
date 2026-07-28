# P52 — финальная проверка и чистая сборка проекта

Дата: 2026-06-22

## Статус

Проект приведён к чистой рабочей версии для продолжения тестов на Android/iOS, подключения реальных API и подготовки production-запуска.

## Что проверено

- Backend TypeScript: `npm run lint` — OK.
- Backend build: `npm run build` — OK.
- `backend/content/home.json` — валидный JSON.
- Единый `.env.example` находится в корне проекта.
- Лишние `.env.example` в подпапках отсутствуют.
- В проекте нет вложенных zip/apk/aab архивов.
- Flutter-код не содержит дублей ключевых UI-классов:
  - `PageScaffold` — один;
  - `InteriorSectionView` — один;
  - `ImageStoryStrip` — один;
  - `WorkCard` — один.
- Удалены старые неиспользуемые assets:
  - старые work_*.jpg;
  - старые specialist_*.jpg;
  - старые interior_*.jpg;
  - старые certificate_*.jpg.
- Раздел «Наши работы» оставлен в правильном порядке: сначала подология/до-после, затем маникюр.
- Раздел «Интерьер» содержит одно актуальное фото входной группы.
- Раздел специалистов называется «Наши специалисты».
- Юридический пакет лежит в `docs/legal/`.
- Исторические отчёты перенесены в `docs/archive/change-history/`, чтобы не засорять корень документации.

## Smoke-check backend/API

Локально в demo/local режиме проверены:

- `/health`;
- `/content/home`;
- `/content/summary`;
- `/yclients/status`;
- `/yclients/services`;
- `/yclients/staff`;
- `auth/request-code`;
- `auth/verify-code`;
- `profile GET/PUT`;
- создание записи;
- список записей;
- отмена записи;
- создание сообщения в чате;
- список сообщений;
- `content/home PUT` через admin token;
- удаление аккаунта.

## Что сознательно не включено в чистый архив

- `backend/node_modules/` — зависимости ставятся первой командой `BOOTSTRAP_PROJECT.ps1`.
- `backend/dist/` — генерируется командой build.
- временные данные `backend/data/*` и `backend/storage/*`.
- Android/iOS build-кэши.

## Следующий этап

1. Проверить iOS на Mac.
2. Заполнить реальный `.env`.
3. Прогнать Android и iPhone с реальными YCLIENTS/Telegram/SMS/media ключами.
4. Выбрать сервер, PostgreSQL и хранилище медиа.
5. Развернуть staging/production.
6. Подготовить AAB/TestFlight и отправить на модерацию.
