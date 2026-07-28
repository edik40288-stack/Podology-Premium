# V20 — быстрый live-bootstrap записи

Что исправлено относительно V18:

1. Экран записи больше не делает медленный цикл запросов с телефона `специалист × дата × время`.
2. Добавлен backend endpoint `GET /yclients/booking/bootstrap?serviceId=...`.
3. Backend готовит выбранную услугу на сервере: услуги, специалистов, связь услуга → специалисты, ближайшие даты и окна времени.
4. Запросы к YCLIENTS внутри bootstrap выполняются параллельно с ограничением конкуренции, чтобы не ждать по одному запросу подряд.
5. При старте приложения сразу запускается прогрев расписания для выбранной услуги.
6. При входе на вкладку `Запись` приложение использует свежий bootstrap текущего запуска, но всё равно обновляет расписание.
7. При смене специалиста или даты приложение делает точечную свежую проверку `/yclients/times`.
8. Перед созданием записи backend как и раньше заново проверяет выбранный слот через YCLIENTS. Bootstrap не считается финальным подтверждением.

Новые переменные в `.env`:

```env
YCLIENTS_BOOTSTRAP_HORIZON_DAYS=14
YCLIENTS_BOOTSTRAP_SERVICE_LIMIT=12
YCLIENTS_BOOTSTRAP_SERVICE_CONCURRENCY=4
YCLIENTS_BOOTSTRAP_STAFF_CONCURRENCY=4
YCLIENTS_BOOTSTRAP_TIMES_CONCURRENCY=10
YCLIENTS_BOOTSTRAP_REQUEST_TIMEOUT_MS=4500
YCLIENTS_BOOTSTRAP_TIMES_PER_DAY=24
```

Главная логика:

- YCLIENTS остаётся источником правды.
- Свободное время не хранится как долгий cache.
- Быстрый bootstrap нужен только для быстрого отображения актуальных окон текущего запуска.
- Подтверждение записи всегда проходит свежую проверку конкретного времени.

Проверки:

- `backend npm run lint` — OK
- `backend npm run build` — OK
- backend стартует и route `/yclients/booking/bootstrap` зарегистрирован
- `backend/dist` обновлён
- активного `.env` в архиве нет
- пустые `backend/storage` и `backend/data` удалены
