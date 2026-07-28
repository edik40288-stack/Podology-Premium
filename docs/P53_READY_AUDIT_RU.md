# P53 — итоговая проверка готовой версии

Дата: 2026-06-22

## Проверки

- Backend `npm run lint` — OK.
- Backend `npm run build` — OK.
- Backend стартует в обычном режиме — OK.
- Backend стартует в thin mode — OK.
- `/health` показывает operating model/provider режимы — OK.
- `/yclients/status` показывает provider режимы, наличие YCLIENTS ключей и endpoint-шаблонов — OK.
- Единственный env-template: `.env.example` в корне проекта — OK.
- Лишних `.env.example` в подпапках нет — OK.
- Вложенных `.zip`, `.apk`, `.aab` нет — OK.
- `backend/node_modules` и `backend/dist` удалены из финального архива — OK.
- Дубли классов в `mobile_flutter/lib` и `backend/src` не найдены — OK.
- Юридическая карта данных обновлена под YCLIENTS + Telegram thin backend — OK.

## Что изменено в P53

- Добавлен режим `APP_OPERATING_MODEL=thin_proxy`.
- Добавлены provider-флаги:
  - `BOOKING_PROVIDER=yclients`;
  - `PROFILE_PROVIDER=yclients`;
  - `CHAT_PROVIDER=telegram`;
  - `CHAT_HISTORY_MODE=technical_index`;
  - `CHAT_MEDIA_PRIMARY=telegram`;
  - `FILE_STORAGE_DRIVER=telegram`.
- Production env-check теперь понимает full mode и thin mode.
- В thin mode S3/R2 не является обязательным.
- YCLIENTS status теперь показывает operating model, booking/profile provider и endpoint-шаблоны.
- YCLIENTS bookings сначала пытаются идти в YCLIENTS, затем fallback на технический cache/reference.
- Авторизация может синхронизировать профиль клиента в YCLIENTS, если задан endpoint.
- Удаление аккаунта может отправлять запрос удаления/обезличивания в YCLIENTS, если задан endpoint.
- Media service теперь явно помечает `telegram-cache`, если `FILE_STORAGE_DRIVER=telegram`.
- Health endpoint показывает active model/provider настройки.

## Что важно

P53 не превращает приложение в простую внешнюю ссылку на YCLIENTS. Интерфейс остаётся нашим: услуги, специалисты, даты, время, запись, мои записи и чат остаются внутри приложения.

Меняется источник данных:

```text
YCLIENTS = основная CRM для услуг, специалистов, клиентов, расписания, записей и отмен
Telegram = основной архив чата, фото и видео
Backend = безопасный тонкий прокси + технические индексы
```

## Что осталось сделать перед реальным production

1. Заполнить реальные YCLIENTS ключи.
2. Проверить реальные endpoints YCLIENTS для услуг, специалистов, дат, времени, создания записи.
3. Уточнить endpoint получения записей клиента по телефону.
4. Уточнить endpoint создания/обновления клиента.
5. Уточнить регламент удаления/обезличивания в YCLIENTS.
6. Заполнить Telegram bot tokens и group/forum id.
7. Выбрать российский SMS-провайдер и заполнить ключ.
8. Выбрать сервер и маленькую PostgreSQL для technical indexes.
9. Проверить Android/iPhone с production API.
