# P22 — подготовка к рынку, пока backend запускается с ноутбука

Дата: 2026-06-19

## Цель

Сохранить текущую схему запуска с ноутбука и Android по USB, но подготовить проект к будущей покупке инфраструктуры: домен, сервер, PostgreSQL, S3, SMS.ru, YCLIENTS, Telegram, Google Play и App Store.

## Что изменено

### 1. Записи и YCLIENTS

Добавлен полноценный backend-контур записей:

- `GET /yclients/bookings` — список записей текущего пользователя.
- `POST /yclients/booking` — создание записи.
- `POST /yclients/bookings/:id/cancel` — отмена записи.

Правило отмены:

```env
BOOKING_CANCEL_BEFORE_HOURS=48
```

Backend сам запрещает отмену позже чем за 48 часов до приёма. Это нельзя обойти через телефон, потому что правило проверяется на сервере.

YCLIENTS остаётся источником истины для реальной записи. Наша база хранит связку пользователя, записи, ID записи YCLIENTS, статус и срок отмены.

### 2. PostgreSQL-ready storage для записей

В миграции добавлена таблица `bookings`.

Хранится:

- phone
- fullname
- service/staff ids
- service/specialist display names
- datetime
- status
- yclients_record_id
- cancel_allowed_until
- cancelled_at
- yclients_response

В локальном режиме используется JSON-файл `backend/data/bookings.json`, чтобы проект продолжал запускаться с ноутбука без покупки базы.

### 3. S3-ready хранилище файлов

Добавлен режим:

```env
FILE_STORAGE_DRIVER=s3
```

Для локального режима:

```env
FILE_STORAGE_DRIVER=local
```

Для продакшена файлы чата, сертификаты, интерьер, работы и медиа из Telegram должны храниться не в базе, а в S3-compatible хранилище. PostgreSQL хранит ссылки и метаданные.

Нужные env:

```env
S3_ENDPOINT=
S3_REGION=ru-1
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_PUBLIC_BASE_URL=
S3_FORCE_PATH_STYLE=true
```

### 4. App Store / Google Play risk cleanup

- Убран видимый текст про тестовый режим на экране входа.
- Скрытый тестовый режим остался через правильные имя/фамилию/телефон.
- На экране входа добавлены ссылки на условия и политику.
- В release-сборку передаются `PRIVACY_POLICY_URL`, `TERMS_URL`, `ACCOUNT_DELETION_URL`, `SUPPORT_EMAIL`.
- В production check добавлен `ACCOUNT_DELETION_URL`.
- Production требует `FILE_STORAGE_DRIVER=s3`.
- iOS script в production больше не включает `NSAllowsArbitraryLoads=true`.
- Android permissions уменьшены: убран старый `READ_EXTERNAL_STORAGE`.

### 5. Удаление аккаунта

При удалении аккаунта backend теперь удаляет:

- профиль;
- чат-комнату и сообщения;
- локальные chat-media файлы;
- записи пользователя из нашей базы/локального JSON.

YCLIENTS-история при этом не удаляется автоматически: YCLIENTS остаётся медицинско-операционной CRM и источником бизнес-истории центра.

## Что важно проверить после покупки инфраструктуры

1. Реальный YCLIENTS create booking.
2. Реальный YCLIENTS cancel booking.
3. Правильность `YCLIENTS_CANCEL_ENDPOINT_TEMPLATE` — уточнить по API-доступу YCLIENTS/Altegio.
4. S3 upload: фото из чата, видео из чата, медиа из Telegram.
5. App Store / Google Play: privacy policy URL, deletion URL, support email.
6. Android release: `flutter analyze`, `flutter test`, `flutter build appbundle`.
7. iOS release: Xcode Archive, privacy labels, App Review demo credentials.

## Запуск сейчас

Как раньше:

```powershell
powershell -ExecutionPolicy Bypass -File .\RUN_LOCAL_ANDROID.ps1
```

## Production после покупки

1. Скопировать `.env.example` в `.env`.
2. Заполнить реальные значения.
3. Проверить:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\CHECK_PRODUCTION_READY.ps1
```

4. Поднять backend на сервере.
5. Собрать Android AAB.
