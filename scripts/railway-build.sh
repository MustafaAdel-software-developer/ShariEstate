#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

corepack enable
pnpm install --frozen-lockfile
pnpm --filter @real-estate/shared build
pnpm --filter @real-estate/api exec prisma generate
pnpm --filter @real-estate/api run build

# Sync schema to Neon during build (DATABASE_URL must be set in Railway variables)
if [ -n "${DATABASE_URL:-}" ]; then
  echo "Running prisma db push..."
  pnpm --filter @real-estate/api exec prisma db push
else
  echo "WARNING: DATABASE_URL not set — skipping prisma db push"
fi

echo "Railway API build complete."
