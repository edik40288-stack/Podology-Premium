# P53 — как работает YCLIENTS + Telegram thin backend

## Коротко

Клиент ничего не видит технически: приложение работает почти как раньше.

Внутри:

```text
Услуги / специалисты / расписание / запись / отмена → YCLIENTS
Чат / фото / видео / ответы администратора → Telegram
Авторизация / согласия / связки / индексы → тонкий backend
```

## Сценарий записи

1. Клиент открывает «Запись».
2. Приложение просит backend показать специалистов, даты и время.
3. Backend идёт в YCLIENTS.
4. YCLIENTS отдаёт реальные окна.
5. Клиент нажимает «Подтвердить запись».
6. Backend создаёт запись в YCLIENTS.
7. Приложение показывает подтверждение.

Главная запись хранится в YCLIENTS, не в нашей базе.

## Сценарий «Мои записи»

1. Клиент авторизован по телефону.
2. Backend пытается получить записи клиента из YCLIENTS.
3. Если endpoint ещё не настроен, используется технический cache/reference, чтобы приложение не ломалось.

## Сценарий отмены

1. Клиент нажимает «Отменить запись».
2. Backend проверяет правило 48 часов.
3. Backend отправляет отмену в YCLIENTS.
4. Приложение обновляет статус записи.

## Сценарий чата

1. Клиент пишет в приложении.
2. Backend отправляет текст/фото/видео в Telegram-группу центра.
3. Для клиента создаётся отдельная Telegram-тема, если включены topics.
4. Администратор отвечает прямо в Telegram.
5. Backend получает ответ через bridge/polling.
6. Ответ появляется в приложении.

## Медиа

В P53 добавлен режим:

```env
CHAT_MEDIA_PRIMARY=telegram
FILE_STORAGE_DRIVER=telegram
```

Смысл: Telegram считается основным архивом фото/видео. Backend может держать технический cache, чтобы клиент видел медиа внутри приложения, но отдельное дорогое S3-хранилище не обязательно.

## Почему backend всё равно нужен

Нельзя класть ключи YCLIENTS и Telegram в приложение. Их можно вытащить из APK/IPA.

Backend нужен как безопасный слой:

```text
приложение → backend с секретами → YCLIENTS / Telegram
```

## Два режима проекта

### Full mode

```env
APP_OPERATING_MODEL=full
BOOKING_PROVIDER=app_cache
PROFILE_PROVIDER=app_cache
CHAT_MEDIA_PRIMARY=backend
FILE_STORAGE_DRIVER=s3
```

Подходит, если нужна собственная CRM/база/медиа-хранилище.

### Thin mode

```env
APP_OPERATING_MODEL=thin_proxy
BOOKING_PROVIDER=yclients
PROFILE_PROVIDER=yclients
CHAT_PROVIDER=telegram
CHAT_HISTORY_MODE=technical_index
CHAT_MEDIA_PRIMARY=telegram
FILE_STORAGE_DRIVER=telegram
```

Подходит для первого релиза с меньшими расходами.

## Правильный production минимум для thin mode

```env
APP_ENV=production
APP_OPERATING_MODEL=thin_proxy
AUTH_MODE=sms_ru
STORAGE_DRIVER=postgres
FILE_STORAGE_DRIVER=telegram
BOOKING_PROVIDER=yclients
PROFILE_PROVIDER=yclients
CHAT_PROVIDER=telegram
CHAT_HISTORY_MODE=technical_index
CHAT_MEDIA_PRIMARY=telegram
API_BASE_URL=https://api.podologkutsytoi.com
APP_PUBLIC_BASE_URL=https://api.podologkutsytoi.com
MEDIA_PUBLIC_BASE_URL=https://api.podologkutsytoi.com
```

S3/R2 можно не подключать на первом этапе, если Telegram используется как основной архив медиа.
