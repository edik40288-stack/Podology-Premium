#!/usr/bin/env bash
set -euo pipefail

APP_ID="ru.podology.moscow.client"
APP_NAME="${APP_DISPLAY_NAME:-PODOLOG KUTSYTOI}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MOBILE="$ROOT/mobile_flutter"

cd "$MOBILE"

if ! command -v flutter >/dev/null 2>&1; then
  echo "Flutter not found. Install Flutter on Mac first." >&2
  exit 1
fi

if [ ! -f "ios/Runner/Info.plist" ]; then
  flutter create --org ru.podology.moscow --project-name podology_premium_client --platforms=ios .
fi

PLIST="ios/Runner/Info.plist"
PBXPROJ="ios/Runner.xcodeproj/project.pbxproj"

/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName $APP_NAME" "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :CFBundleDisplayName string $APP_NAME" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :CFBundleName $APP_NAME" "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :CFBundleName string $APP_NAME" "$PLIST"

if [ -f "$PBXPROJ" ]; then
  sed -i '' "s/PRODUCT_BUNDLE_IDENTIFIER = [^;]*;/PRODUCT_BUNDLE_IDENTIFIER = $APP_ID;/g" "$PBXPROJ"
fi

/usr/libexec/PlistBuddy -c "Set :NSPhotoLibraryUsageDescription Клиент может прикрепить фото кожи, стопы или другого вопроса эстетического ухода в чат с центром." "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :NSPhotoLibraryUsageDescription string Клиент может прикрепить фото кожи, стопы или другого вопроса эстетического ухода в чат с центром." "$PLIST"
/usr/libexec/PlistBuddy -c "Set :NSCameraUsageDescription Клиент может сделать фото для консультации в чате с центром." "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :NSCameraUsageDescription string Клиент может сделать фото для консультации в чате с центром." "$PLIST"
/usr/libexec/PlistBuddy -c "Set :NSMicrophoneUsageDescription Микрофон нужен только при выборе или записи видео для чата." "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :NSMicrophoneUsageDescription string Микрофон нужен только при выборе или записи видео для чата." "$PLIST"

# Local iPhone testing may use http://<Mac-IP>:3000. Production release must not allow arbitrary HTTP loads.
/usr/libexec/PlistBuddy -c "Add :NSAppTransportSecurity dict" "$PLIST" 2>/dev/null || true
if [ "${APP_ENV:-local}" = "production" ]; then
  /usr/libexec/PlistBuddy -c "Delete :NSAppTransportSecurity:NSAllowsArbitraryLoads" "$PLIST" 2>/dev/null || true
else
  /usr/libexec/PlistBuddy -c "Set :NSAppTransportSecurity:NSAllowsArbitraryLoads true" "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :NSAppTransportSecurity:NSAllowsArbitraryLoads bool true" "$PLIST"
fi

ICON_SET_SOURCE="$MOBILE/assets/launcher_icons/ios/AppIcon.appiconset"
ICON_SET_TARGET="$MOBILE/ios/Runner/Assets.xcassets/AppIcon.appiconset"
if [ ! -d "$ICON_SET_SOURCE" ]; then
  echo "Missing iOS icon source: $ICON_SET_SOURCE" >&2
  exit 1
fi
rm -rf "$ICON_SET_TARGET"
cp -R "$ICON_SET_SOURCE" "$ICON_SET_TARGET"

flutter pub get

echo "iOS project is prepared: bundle=$APP_ID, name=$APP_NAME."
