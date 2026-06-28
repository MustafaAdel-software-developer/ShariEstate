#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

corepack enable
pnpm install --frozen-lockfile
pnpm --filter @real-estate/shared build
pnpm --filter @real-estate/api exec prisma generate
pnpm --filter @real-estate/api run build

echo "API build complete."
