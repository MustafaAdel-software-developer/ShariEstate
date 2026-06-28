#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/apps/api"

echo "Starting ShariEstate API on PORT=${PORT:-3001}..."
node dist/main
