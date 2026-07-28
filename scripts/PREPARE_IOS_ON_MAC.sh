#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_URL="${API_BASE_URL:-https://api.podologkutsytoi.com}"

"$ROOT/scripts/PREPARE_IOS_PROJECT_ON_MAC.sh"

cd "$ROOT/mobile_flutter"
flutter build ios --release --dart-define=API_BASE_URL="$API_URL" --no-codesign

echo "iOS release build prepared without codesign. Open ios/Runner.xcworkspace in Xcode, set signing team, then Archive."
