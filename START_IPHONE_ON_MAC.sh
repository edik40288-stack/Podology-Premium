#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
MOBILE="$ROOT/mobile_flutter"
ENV_FILE="$ROOT/.env"
ENV_EXAMPLE="$ROOT/.env.example"

function find_mac_ip() {
  ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo ""
}

MAC_IP="${MAC_IP:-$(find_mac_ip)}"
if [ -z "$MAC_IP" ]; then
  echo "Could not detect Mac Wi-Fi IP. Run: MAC_IP=192.168.x.x ./START_IPHONE_ON_MAC.sh" >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ] && [ -f "$ENV_EXAMPLE" ]; then
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo "Created root .env from .env.example. Fill Telegram/YCLIENTS values when needed."
fi

read_env_value() {
  local name="$1"
  local fallback="$2"
  if [ -f "$ENV_FILE" ]; then
    local value
    value=$(grep -E "^${name}=" "$ENV_FILE" | tail -n 1 | cut -d= -f2- | sed "s/^['\"]//;s/['\"]$//")
    if [ -n "$value" ]; then echo "$value"; return; fi
  fi
  echo "$fallback"
}

API_URL="${API_BASE_URL:-$(read_env_value API_BASE_URL http://$MAC_IP:3000)}"
PUBLIC_URL="${APP_PUBLIC_BASE_URL:-$(read_env_value APP_PUBLIC_BASE_URL http://$MAC_IP:3000)}"
PRIVACY_POLICY_URL_VALUE="$(read_env_value PRIVACY_POLICY_URL https://podologkutsytoi.com/legal/privacy)"
TERMS_URL_VALUE="$(read_env_value TERMS_URL https://podologkutsytoi.com/legal/terms)"
ACCOUNT_DELETION_URL_VALUE="$(read_env_value ACCOUNT_DELETION_URL https://podologkutsytoi.com/legal/account-deletion)"
SUPPORT_EMAIL_VALUE="$(read_env_value SUPPORT_EMAIL danilova.danilova.99@mail.ru)"
APP_ENV_VALUE="$(read_env_value APP_ENV local)"

if ! command -v flutter >/dev/null 2>&1; then
  echo "Flutter not found on Mac." >&2
  exit 1
fi
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found on Mac." >&2
  exit 1
fi

cd "$BACKEND"
if [ ! -d node_modules ]; then
  if [ -f package-lock.json ]; then npm ci; else npm install; fi
fi
if [ ! -f dist/main.js ]; then
  npm run build
fi

PORT=3000 APP_PUBLIC_BASE_URL="$PUBLIC_URL" MEDIA_PUBLIC_BASE_URL="$PUBLIC_URL/media/public" node dist/main.js &
BACK_PID=$!
trap 'kill $BACK_PID 2>/dev/null || true' EXIT

for i in {1..60}; do
  if curl -fsS http://127.0.0.1:3000/health >/dev/null 2>&1; then
    break
  fi
  sleep 1
  if [ "$i" = "60" ]; then
    echo "Backend did not start on http://127.0.0.1:3000" >&2
    exit 1
  fi
done

echo "Backend is online. iPhone API_BASE_URL=$API_URL"

"$ROOT/scripts/PREPARE_IOS_PROJECT_ON_MAC.sh"

cd "$MOBILE"
flutter devices
flutter run   --dart-define=APP_ENV="$APP_ENV_VALUE"   --dart-define=API_BASE_URL="$API_URL"   --dart-define=PRIVACY_POLICY_URL="$PRIVACY_POLICY_URL_VALUE"   --dart-define=TERMS_URL="$TERMS_URL_VALUE"   --dart-define=ACCOUNT_DELETION_URL="$ACCOUNT_DELETION_URL_VALUE"   --dart-define=SUPPORT_EMAIL="$SUPPORT_EMAIL_VALUE"
