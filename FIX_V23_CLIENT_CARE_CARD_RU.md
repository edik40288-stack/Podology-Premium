# V23 — раздел «Моя карта»

Добавлено:
- новый нижний раздел «Моя карта» вместо «Профиль» в нижней навигации;
- профиль/настройки доступны через шестерёнку в «Моя карта»;
- backend endpoint `GET /care-card?phone=...`;
- backend endpoint `PUT /care-card` для обновления карты специалистом/админкой;
- локальное JSON-хранилище `backend/data/client-care-cards.json` для laptop-real режима;
- PostgreSQL-таблица `care_cards` для production-режима;
- текущий курс, процент, следующий визит;
- динамика по визитам: последний визит первый;
- отдельный экран «Динамика ухода»;
- домашний уход и кнопка «Купить назначенный уход».

Не трогалось:
- YCLIENTS запись;
- Telegram чат;
- SMS/demo auth;
- booking bootstrap;
- media upload.

Проверено:
- `npm run lint` OK;
- `npm run build` OK;
- backend стартует;
- `/health` OK;
- `/care-card?phone=...` OK;
- активный `.env` в архив не добавлен.
