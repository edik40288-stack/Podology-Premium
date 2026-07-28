# P59 QUICK RUN — backend bundled

Эта версия сделана специально для быстрой проверки на ноутбуке: backend/node_modules и backend/dist уже внутри архива. Поэтому при запуске на Node 24 скрипт не должен пытаться ставить зависимости заново. Для боевой разработки и сервера всё равно лучше Node 20/22 LTS.

Запуск:

```powershell
copy .env.example .env
powershell -NoProfile -ExecutionPolicy Bypass -File .\START_MARKETPLACE_PHONE.ps1
```

---

# PODOLOG KUTSYTOI — рабочая версия P59 — hotfix запуска Flutter + проверенная YCLIENTS/Telegram thin backend

Проект: мобильное приложение центра подологии Куцытой + backend + Telegram/YCLIENTS контур.

Текущий статус: Android-запуск подтверждён пользователем, backend проверен локально, юридический пакет заполнен по доступным данным. В P59 закреплён экономичный thin-backend режим: YCLIENTS как главная CRM для клиентов/записей, Telegram как основной архив чата/фото/видео, backend как безопасный прокси и технический индекс.


## P59 hotfix

Исправлены предупреждения/ошибки Flutter Analyzer из VS Code:

```text
booking_screen.dart: добавлен импорт ui_helpers.dart для showSnack
home_widgets.dart: удалён неиспользуемый импорт app_config.dart
```

Это не меняет интерфейс и бизнес-логику приложения.

## Что внутри

```text
mobile_flutter/                 Flutter-приложение Android/iOS
backend/                        NestJS backend
backend/content/home.json        контент главной, услуг, работ, специалистов, сертификатов
backend/migrations/              SQL-миграции для PostgreSQL
scripts/                         подготовка, проверки, deploy
ci/                              проектные проверки

docs/                            актуальная документация
docs/legal/                      юридический пакет РФ
docs/archive/change-history/     старые отчёты по этапам, не мешают работе
.env.example                     единый env-шаблон для всего проекта
```

## Главные команды Windows / Android

Первый запуск после распаковки:

```powershell
copy .env.example .env
powershell -NoProfile -ExecutionPolicy Bypass -File .\BOOTSTRAP_PROJECT.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\START_MARKETPLACE_PHONE.ps1
```

Повторный запуск, если зависимости уже установлены:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\START_MARKETPLACE_PHONE.ps1
```

## iPhone / Mac

```bash
cd <project-root>
chmod +x START_IPHONE_ON_MAC.sh scripts/*.sh
./START_IPHONE_ON_MAC.sh
```

Если Mac не определил IP автоматически:

```bash
MAC_IP=192.168.1.25 ./START_IPHONE_ON_MAC.sh
```

## Единый `.env`

В проекте используется один поддерживаемый файл окружения:

```text
.env.example → .env
```

Он используется всем контуром:

- backend;
- Android/iOS запуск;
- release build;
- Telegram/YCLIENTS проверки;
- content admin API;
- серверный deploy.

Лишние env-template файлы в подпапках удалены.

## P59 thin-backend режим

Для первого релиза можно не превращать приложение в простую ссылку на YCLIENTS. Интерфейс остаётся внутри приложения, но данные идут через внешние сервисы:

```text
Приложение → тонкий backend → YCLIENTS / Telegram
```

Режим включается в `.env`:

```env
APP_OPERATING_MODEL=thin_proxy
BOOKING_PROVIDER=yclients
PROFILE_PROVIDER=yclients
CHAT_PROVIDER=telegram
CHAT_HISTORY_MODE=technical_index
CHAT_MEDIA_PRIMARY=telegram
FILE_STORAGE_DRIVER=telegram
```

В этом режиме S3/R2 не обязателен: Telegram является основным архивом медиа, backend хранит только технический cache/индексы для отображения в приложении. PostgreSQL рекомендуется как маленькая техническая база для сервера.

## Функциональные блоки

- регистрация/вход по телефону;
- профиль клиента;
- смена данных профиля;
- удаление аккаунта;
- услуги;
- специалисты;
- запись через YCLIENTS-контур;
- отмена записи за 48 часов;
- чат клиент ↔ центр;
- фото/видео в чате;
- Telegram-мост;
- контент-админ API;
- юридические документы для РФ.

## Важные документы

```text
docs/RUN_RU.md
docs/PHONE_RUN_RU.md
docs/IOS_BUILD_ON_MAC_RU.md
docs/API_KEYS_RU.md
docs/ARCHITECTURE_RU.md
docs/CONTENT_ADMIN_PANEL_RU.md
docs/TELEGRAM_TWO_BOTS_SETUP_RU.md
docs/YCLIENTS_INTEGRATION_NOTES_RU.md
docs/SERVER_MARKET_READY_RU.md
docs/MARKETPLACE_RELEASE_RU.md
docs/P52_FINAL_READY_AUDIT_RU.md
docs/P53_DEEP_AUDIT_THIN_BACKEND_RU.md
docs/P53_YCLIENTS_TELEGRAM_THIN_BACKEND_RU.md
docs/P53_READY_AUDIT_RU.md
docs/P54_THIN_BACKEND_VERIFICATION_RU.md
docs/P55_FINAL_THIN_BACKEND_AUDIT_RU.md
docs/legal/00_LEGAL_README_RU.md
```

## Юридический статус

- оператор: ИП Куцытой Александра Эдуардовна;
- центр: Центр подологии Куцытой;
- адрес центра: г. Москва, ул. Петрозаводская, д. 28, к. 1;
- медицинской лицензии пока нет;
- в публичных текстах используем формулировки: эстетический и подологический уход;
- не используем как коммерческое позиционирование: лечение, диагноз, врач, медицинская помощь;
- оплаты и предоплаты внутри приложения нет;
- маркетинговые рассылки — только по отдельному согласию;
- уведомление в Роскомнадзор ещё не подано, но черновик подготовлен.

## Что проверено в P55

- backend `npm run lint` — OK;
- backend `npm run build` — OK;
- `backend/content/home.json` — валидный JSON;
- один `.env.example` в корне;
- старые неиспользуемые изображения удалены;
- вложенных zip/apk/aab в проекте нет;
- smoke-check backend/API в local/demo режиме пройден; health и YCLIENTS status показывают текущий operating model/provider режим.

## Что дальше

1. Проверить iPhone на Mac.
2. Заполнить реальный `.env`.
3. Проверить Android и iPhone с реальными YCLIENTS/Telegram/SMS/media ключами.
4. Выбрать сервер и маленькую PostgreSQL для technical indexes. Отдельное media-хранилище можно не подключать на первом релизе, если `CHAT_MEDIA_PRIMARY=telegram`.
5. Развернуть staging/production.
6. Подготовить AAB/TestFlight.
7. Опубликовать юридические документы по публичным ссылкам.
8. Подать на модерацию Google Play / App Store.

## P54 verification note

После дополнительной проверки thin backend схемы исправлены критичные моменты:
- услуги могут загружаться из YCLIENTS;
- фальшивая локальная запись при ошибке YCLIENTS больше не создаётся;
- обновление профиля пытается синхронизироваться с YCLIENTS;
- схема остаётся: приложение → тонкий backend → YCLIENTS/Telegram + маленькая техническая база.


## P55 final verification note

P55 дополнительно проверяет, что клиентский интерфейс остаётся приложением, а не внешней ссылкой:

- главная, услуги, специалисты, запись, чат и профиль остаются внутри Flutter-приложения;
- `/yclients/services`, `/yclients/staff`, `/yclients/dates`, `/yclients/times`, `/yclients/booking`, `/yclients/bookings` остаются единым backend-слоем для мобильного приложения;
- backend по умолчанию включён в `thin_proxy` режиме;
- YCLIENTS становится главным источником услуг/специалистов/окон/записей при заполненных ключах;
- Telegram является основным архивом чата/фото/видео, backend хранит технический индекс и cache для отображения в приложении;
- смена телефона теперь не делается “тихо локально”: при изменении номера приложение запрашивает подтверждение кодом и получает новый auth-token.


## Два режима запуска

### 1. Сейчас: ноутбук + реальные YCLIENTS/Telegram

Используй этот режим, пока нет домена, сервера, push и SMS-провайдера. Он запускает backend локально, но YCLIENTS и Telegram работают по-настоящему. SMS вход локальный: код `1111`.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\START_LAPTOP_REAL_INTEGRATIONS.ps1
```

Этот режим специально НЕ требует `SMS_RU_API_ID`, HTTPS-домены, PostgreSQL и push. Он требует реальные:

```text
YCLIENTS_PARTNER_TOKEN
YCLIENTS_USER_TOKEN
YCLIENTS_COMPANY_ID
YCLIENTS_FORM_ID
TELEGRAM_ADMIN_BOT_TOKEN
TELEGRAM_ADMIN_IDS
TELEGRAM_CHAT_BOT_TOKEN
TELEGRAM_CHAT_GROUP_ID
```

### 2. Потом: production для Apple/Google

Когда будут сервер, домен, SMS и юридические URL, переключайся на `.env.production.example` и запускай строгую проверку:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\CHECK_PRODUCTION_READY.ps1
```

Не запускай production-check для ноутбучного режима: он обязан ругаться на SMS/domain/PostgreSQL, потому что это проверка перед магазином.
