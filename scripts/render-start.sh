#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/apps/api"

npx prisma db push

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "Running database seed (RUN_SEED=true)..."
  npx prisma db seed
fi

node dist/main
