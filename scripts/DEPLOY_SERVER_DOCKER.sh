#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  echo ".env not found. Copy .env.example to .env and fill values." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed." >&2
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Docker Compose is not installed." >&2
  exit 1
fi

(cd backend && npm ci && npm run build)
"${COMPOSE[@]}" -f docker-compose.production.yml up -d --build
"${COMPOSE[@]}" -f docker-compose.production.yml ps
