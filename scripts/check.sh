#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Running backend tests..."
(
  cd "$ROOT_DIR/backend"
  go test ./...
)

echo
echo "Running frontend typecheck..."
(
  cd "$ROOT_DIR/frontend"
  npm run typecheck
)

echo
echo "Checks passed."
