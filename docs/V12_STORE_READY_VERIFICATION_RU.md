# V12 Store-ready verification

## Выполнено в этой сборке

- Backend TypeScript lint: `npm run lint` — OK.
- Backend build: `npm run build` — OK.
- Production env gate updated for thin mode: `FILE_STORAGE_DRIVER=telegram` allowed only in thin backend mode.
- Android marketplace prepare script now fails if Android SDK 35+ is not installed.
- WebSocket chat gateway disabled by default; app uses JWT-protected HTTP chat endpoints.
- Media upload validates file signature, not only MIME header.
- SMS code request rate limit added.
- Public app content sanitized from risky medical claims.
- Store review docs/templates added.

## Не выполнено в этой среде

- `flutter analyze` and `flutter build appbundle` were not run here because Flutter/Dart SDK is not installed in this container.
- iOS Archive/TestFlight was not run because Xcode/macOS is required.
- Live YCLIENTS/SMS/Telegram were not tested because real production secrets are not present in the archive.

## Перед загрузкой в магазины

1. Copy `.env.production.example` to `.env` and fill real values.
2. Run `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\CHECK_PRODUCTION_READY.ps1`.
3. Run `powershell -NoProfile -ExecutionPolicy Bypass -File .\BUILD_MARKETPLACE_ANDROID_AAB.ps1`.
4. On Mac run `scripts/PREPARE_IOS_PROJECT_ON_MAC.sh`, then Xcode Archive/TestFlight.
5. Ensure backend, privacy policy, terms and account deletion URLs are live during review.
