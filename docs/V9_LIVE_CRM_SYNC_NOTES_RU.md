# V9 Live CRM Sync — что изменено

Сборка сделана от версии `podolog67_full_premium_visual_polish(6).zip`, где UI ещё не был сломан. UI-виджеты и premium-экранная структура не переписывались. Изменён слой интеграции: backend, API-client, live-refresh.

## Принцип

- YCLIENTS — источник правды по услугам, специалистам, ценам, длительности, расписанию, слотам, созданию и отмене записи.
- Flutter — premium-витрина. Он не должен разбирать сырой CRM-ответ и не должен показывать тестовые окна.
- Backend — нормализатор, premium-merge, snapshot/cache, diff важных событий, Telegram-уведомления.

## YCLIENTS

- `YCLIENTS_API_BASE_URL=https://api.yclients.com/api/v1` закреплён.
- `YCLIENTS_SERVICE_ID_MAP={}` и `YCLIENTS_STAFF_ID_MAP={}` очищены: реальные ID идут из YCLIENTS.
- Public booking endpoints (`book_services`, `book_staff`, `book_dates`, `book_times`) вызываются partner-only заголовком.
- Создание/отмена/records-кандидаты идут business-заголовком `Bearer partner, User user`.
- Услуги и специалисты нормализуются в готовые premium DTO.
- Если YCLIENTS временно не отвечает, backend может отдать last-known-good snapshot для каталога, но слоты записи не фейкуются.

## Live

- Приложение обновляет live-состояние каждые 15 секунд при открытом приложении.
- Обновляются: контент, услуги, специалисты, записи.
- После создания/отмены записи запускается дополнительное обновление.

## Важные изменения и Telegram

Telegram admin/chat не вырезан. Добавлены системные уведомления для важных событий:

- добавлена/удалена/скрыта услуга;
- добавлен/удалён/скрыт специалист;
- запись создана;
- запись отменена клиентом;
- запись отменена/изменена в YCLIENTS при sync history.

Мелочи вроде изменения цены/длительности обновляются в приложении, но не спамят Telegram.

## Media

- Upload поднят до 250 MB.
- Upload идёт через disk storage, не 250 MB в RAM.
- `application/octet-stream` определяется по расширению.
- Telegram media отправляется как photo/video, при отказе пробуется sendDocument.
- Flutter показывает статус: доставлено в Telegram / Telegram не принял вложение.

## Проверка в этой среде

- `npm run lint` — OK
- `npm run build` — OK
- `node dist/main.js` — backend стартует
- ZIP integrity — проверяется при упаковке

Полный Flutter APK build нужно запускать на машине с Flutter SDK.
