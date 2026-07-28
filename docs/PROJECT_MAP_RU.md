# Полная карта проекта PODOLOG KUTSYTOI

Цель этой карты — чтобы проект был понятен как единый организм: где вход, где UI, где backend, где Telegram, где режим локального запуска и где release-сборка.

## Главные команды

### Локальный режим: компьютер + Android по кабелю

```powershell
powershell -ExecutionPolicy Bypass -File .\RUN_LOCAL_ANDROID.ps1
```

Что делает режим: запускает локальный backend на компьютере, проверяет Android USB, делает `adb reverse tcp:3000 tcp:3000`, генерирует Android-проект при необходимости и запускает Flutter на телефоне.

### Release-режим: Android AAB

```powershell
copy .env.example .env
# заполнить .env реальными ключами/адресами
powershell -ExecutionPolicy Bypass -File .\BUILD_RELEASE_ANDROID_AAB.ps1
```

Что делает режим: читает `.env`, готовит Android-проект и собирает `.aab` для публикации.

## Корень проекта

```text
.
├── RUN_LOCAL_ANDROID.ps1              # главная команда локального запуска
├── BUILD_RELEASE_ANDROID_AAB.ps1      # главная команда release AAB
├── START_MARKETPLACE_PHONE.ps1        # низкоуровневый рабочий launcher Android
├── BUILD_MARKETPLACE_ANDROID_AAB.ps1  # низкоуровневый release builder
├── .env.example                       # шаблон переменных для release/backend
├── backend/                           # NestJS backend
├── mobile_flutter/                    # Flutter client
├── scripts/                           # подготовка Android/iOS/dependencies
├── docs/                              # документация
├── ci/                                # проверки проекта
└── docker-compose.server.yml          # server deploy заготовка
```

## Flutter-клиент

После рефакторинга `main.dart` больше не является файлом на 2000+ строк. Он остался входной точкой, а логика разложена по папкам.

| Файл | Строк | Ответственность |
|---|---:|---|
| `mobile_flutter/lib/main.dart` | 38 | Точка входа Flutter, импорт пакетов, part-директивы, main/configureSystemUi. |
| `mobile_flutter/lib/src/core/app_config.dart` | 28 | Константы приложения, цвета, системный UI. |
| `mobile_flutter/lib/src/app/podology_premium_app.dart` | 57 | MaterialApp, тема, AppRoot и переключение auth/app shell. |
| `mobile_flutter/lib/src/models/client_models.dart` | 282 | Все клиентские модели: профиль, настройки, контент, услуги, специалисты, записи, сообщения. |
| `mobile_flutter/lib/src/data/demo_content.dart` | 48 | Локальный demo/fallback-контент для режима без backend/YCLIENTS. |
| `mobile_flutter/lib/src/core/api_client.dart` | 132 | HTTP-клиент к backend: content, YCLIENTS, profile, chat, media. |
| `mobile_flutter/lib/src/features/auth/auth_screen.dart` | 79 | Экран входа по телефону/коду demo. |
| `mobile_flutter/lib/src/features/shell/premium_shell.dart` | 145 | Главная оболочка: bootstrap данных, нижняя навигация, состояние профиля/записей. |
| `mobile_flutter/lib/src/features/home/home_screen.dart` | 45 | Главная страница. |
| `mobile_flutter/lib/src/features/services/services_screen.dart` | 27 | Экран услуг. |
| `mobile_flutter/lib/src/features/booking/booking_screen.dart` | 134 | Запись на приём, выбор даты/времени, создание записи. |
| `mobile_flutter/lib/src/features/chat/chat_screen.dart` | 143 | Клиентский чат, polling, отправка текста/медиа. |
| `mobile_flutter/lib/src/features/profile/profile_screen.dart` | 190 | Профиль, записи, архив, настройки. |
| `mobile_flutter/lib/src/shared/widgets/home_widgets.dart` | 260 | Виджеты главной: hero, разделы, карточки сертификатов/интерьера/работ. |
| `mobile_flutter/lib/src/shared/widgets/common_widgets.dart` | 368 | Общие UI-компоненты: кнопки, карточки, карусели, DynamicImage. |
| `mobile_flutter/lib/src/shared/widgets/chat_booking_widgets.dart` | 190 | Виджеты чата, записи, настроек, пустых состояний. |
| `mobile_flutter/lib/src/shared/utils/ui_helpers.dart` | 57 | Диалоги, snack, открытие URL. |
| `mobile_flutter/lib/src/shared/utils/media_helpers.dart` | 15 | Нормализация URL медиа и определение типа. |
| `mobile_flutter/lib/src/shared/utils/text_helpers.dart` | 157 | Текст, безопасная починка mojibake, даты/время, stable id. |


### Flutter-слои

```text
mobile_flutter/lib/
├── main.dart                  # входная точка
└── src/
    ├── app/                   # MaterialApp/root shell
    ├── core/                  # config/api/system
    ├── data/                  # demo/fallback data
    ├── features/              # auth/home/services/booking/chat/profile
    ├── models/                # модели данных
    └── shared/                # общие widgets/utils
```

## Backend

Backend уже был ближе к нормальной NestJS-архитектуре, но часть больших файлов была разгружена.

| Файл | Строк | Ответственность |
|---|---:|---|
| `backend/src/main.ts` | 15 | Bootstrap NestJS, CORS, порт. |
| `backend/src/app.module.ts` | 24 | Корневой Nest module. |
| `backend/src/common/text.ts` | 68 | Единая backend-логика безопасной починки кодировки. |
| `backend/src/health/health.controller.ts` | 14 | GET /health. |
| `backend/src/content/types.ts` | 159 | Типы контента и словари полей для админки. |
| `backend/src/content/fallback-home-content.ts` | 111 | Стартовый контент приложения, если content/home.json отсутствует. |
| `backend/src/content/content.service.ts` | 287 | Чтение/запись/нормализация контента. |
| `backend/src/content/content.controller.ts` | 31 | HTTP API контента. |
| `backend/src/yclients/yclients.service.ts` | 176 | Adapter YCLIENTS/Altegio + demo fallback. |
| `backend/src/yclients/yclients.controller.ts` | 39 | HTTP API услуг, специалистов, слотов, записей. |
| `backend/src/chat/chat.service.ts` | 205 | Хранилище сообщений/комнат и мост к Telegram. |
| `backend/src/chat/chat.controller.ts` | 35 | HTTP API чата. |
| `backend/src/chat/chat.gateway.ts` | 37 | WebSocket gateway backend-стороны. |
| `backend/src/media/media.service.ts` | 72 | Сохранение локальных media upload. |
| `backend/src/media/media.controller.ts` | 37 | HTTP upload/public media endpoints. |
| `backend/src/profile/profile.service.ts` | 75 | JSON-профили клиентов. |
| `backend/src/profile/profile.controller.ts` | 29 | HTTP API профиля. |
| `backend/src/telegram/telegram.service.ts` | 199 | Основной Telegram service. |
| `backend/src/telegram/telegram-admin.service.ts` | 511 | Telegram admin bot: сценарии редактирования контента. |
| `backend/src/telegram/telegram-admin.types.ts` | 53 | Типы Telegram admin bot. |
| `backend/src/telegram/telegram-admin.maps.ts` | 54 | Alias-карты Telegram admin bot. |
| `backend/src/telegram/telegram-chat-bridge.service.ts` | 175 | Мост клиентского чата в Telegram-группу. |
| `backend/src/telegram/telegram.controller.ts` | 34 | Telegram test/admin endpoints. |


### Backend-слои

```text
backend/src/
├── common/        # общие функции
├── health/        # health check
├── content/       # контент приложения и админка
├── yclients/      # YCLIENTS/Altegio adapter
├── chat/          # клиентский чат
├── media/         # медиа upload/public
├── profile/       # профиль клиента
└── telegram/      # Telegram admin bot + chat bridge
```

## Скрипты

| Файл | Ответственность |
|---|---|
| `RUN_LOCAL_ANDROID.ps1` | Основная команда локального запуска на Android по USB. |
| `START_MARKETPLACE_PHONE.ps1` | Большой рабочий сценарий: инструменты, JDK, backend, adb, prepare android, flutter run. |
| `BUILD_RELEASE_ANDROID_AAB.ps1` | Release-wrapper: читает .env и запускает AAB-сборку. |
| `BUILD_MARKETPLACE_ANDROID_AAB.ps1` | Низкоуровневая AAB-сборка. |
| `scripts/PREPARE_ANDROID.ps1` | Генерация Flutter Android-проекта и сохранение branding/package. |
| `scripts/INSTALL_BACKEND_DEPS_SAFE.ps1` | Безопасная установка backend dependencies, если node_modules отсутствует. |
| `scripts/check_android_usb.ps1` | Проверка ADB/USB. |


## Что сознательно сохранено

- `backend/node_modules/` и `backend/dist/` сохранены в архиве, потому что текущая цель — чтобы пользователь мог запускать проект локально без дополнительной установки зависимостей.
- `mobile_flutter/assets/launcher_icons/...` сохранены полностью: одинаковые PNG внутри iOS AppIcon — это не дубли логики, а обязательные слоты разных размеров/платформ.
- Старые совместимые wrapper-скрипты сохранены, чтобы не ломать уже рабочий запуск.

## Что нельзя удалять без замены

- `mobile_flutter/assets/images/app_icon.png` — используется в auth/profile UI.
- `scripts/PREPARE_ANDROID.ps1` — нужен, потому что Android-папка генерируется на машине пользователя.
- `.env.example` — нужен для автосоздания локального `root .env`.
- `backend/dist/` — нужен для быстрого локального запуска `npm run start:prod`, если пользователь не пересобирал backend.
