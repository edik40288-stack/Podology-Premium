# iOS / iPhone на Mac

На Windows iPhone/App Store сборка невозможна. Нужен Mac с Xcode, Flutter и Apple Developer Team.

## 1. Быстрый запуск на iPhone завтра

Подключи iPhone кабелем к Mac, разблокируй телефон, доверься Mac.

```bash
cd <project-root>
chmod +x START_IPHONE_ON_MAC.sh scripts/*.sh
./START_IPHONE_ON_MAC.sh
```

Скрипт:

1. определит IP Mac в Wi‑Fi;
2. запустит backend на Mac;
3. подготовит iOS-проект;
4. поставит иконки;
5. добавит iOS-разрешения для фото/камеры/видео;
6. запустит Flutter на подключенный iPhone с `API_BASE_URL=http://<Mac-IP>:3000`.

Если IP не определился:

```bash
MAC_IP=192.168.1.25 ./START_IPHONE_ON_MAC.sh
```

## 2. Почему для iPhone не подходит 127.0.0.1

На iPhone `127.0.0.1` — это сам iPhone, а не Mac. Поэтому для локального теста нужен адрес Mac в сети:

```text
http://192.168.x.x:3000
```

Скрипт `START_IPHONE_ON_MAC.sh` делает это автоматически.

## 3. Release/TestFlight/App Store

Для публикации нужен backend на HTTPS-домене:

```bash
cd <project-root>
export API_BASE_URL="https://api.podologkutsytoi.com"
./scripts/PREPARE_IOS_ON_MAC.sh
```

После успешной команды:

1. открой `mobile_flutter/ios/Runner.xcworkspace`;
2. выбери Team / Signing;
3. проверь Bundle Identifier: `ru.podology.moscow.client`;
4. Product → Archive;
5. загрузка в App Store Connect.

## 4. Разрешения iOS

Скрипты добавляют в `Info.plist`:

- `NSPhotoLibraryUsageDescription`
- `NSCameraUsageDescription`
- `NSMicrophoneUsageDescription`

Это нужно для фото и видео в чате.

## 5. Локальный HTTP и публикация

Для локального теста на iPhone скрипт добавляет ATS-разрешение на HTTP. Для публикации в App Store лучше использовать HTTPS backend и не полагаться на локальный HTTP.
