#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend"
EMBEDDED_FRONTEND_DIR="$BACKEND_DIR/web/frontend_dist"
RELEASE_DIR="${RELEASE_DIR:-$ROOT_DIR/release}"
BINARY_NAME="${BINARY_NAME:-kihara-site}"
BINARY_OUT="$RELEASE_DIR/$BINARY_NAME"

mkdir -p "$RELEASE_DIR"

echo "Building frontend..."
(
  cd "$FRONTEND_DIR"
  npm run build
)

echo
echo "Syncing frontend build into embedded backend assets..."
rm -rf "$EMBEDDED_FRONTEND_DIR"
mkdir -p "$EMBEDDED_FRONTEND_DIR"
cp -R "$FRONTEND_DIR/dist/." "$EMBEDDED_FRONTEND_DIR/"

echo
echo "Building backend..."
(
  cd "$BACKEND_DIR"
  if [[ -n "${GOOS:-}" || -n "${GOARCH:-}" || -n "${GOARM:-}" ]]; then
    env GOOS="${GOOS:-}" GOARCH="${GOARCH:-}" GOARM="${GOARM:-}" go build -o "$BINARY_OUT" .
  else
    go build -o "$BINARY_OUT" .
  fi
)

chmod +x "$BINARY_OUT"

echo
echo "Build complete."
echo "Frontend dist: $FRONTEND_DIR/dist"
echo "Embedded frontend assets: $EMBEDDED_FRONTEND_DIR"
echo "Backend binary: $BINARY_OUT"
echo
echo "The binary now includes embedded frontend assets."
echo "If you want to override them at runtime, set STATIC_DIR to an external frontend dist path."
