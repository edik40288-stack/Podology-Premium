# Подготовка к Google Play / App Store

## Android / Google Play

1. Заполнить `root .env` реальными API.
2. Развернуть backend на HTTPS-домене.
3. Указать домен перед сборкой:

```powershell
$env:API_BASE_URL="https://api.podologkutsytoi.com"
.\BUILD_MARKETPLACE_ANDROID_AAB.ps1
```

4. Подписать релизный AAB через стандартный Flutter/Android release signing.
5. Загрузить `app-release.aab` в Google Play Console.

## iOS / App Store

1. На Mac открыть `mobile_flutter/ios` через Xcode.
2. Bundle ID: `ru.podology.moscow.client`.
3. Добавить Apple Developer Team.
4. Собрать Archive.
5. Загрузить через Xcode Organizer / Transporter.

## Перед публикацией заменить

- реальные фото интерьера;
- реальные сертификаты;
- реальные работы;
- реальные специалисты;
- legal: privacy policy, terms, consent for personal data/photo processing;
- домен backend;
- Telegram/YCLIENTS/VK/SMS/PUSH ключи.
