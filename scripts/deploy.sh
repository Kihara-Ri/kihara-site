#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_ROOT="${DEPLOY_ROOT:-$HOME/.deployments/kihara-site-stable}"
SERVICE_NAME="${SERVICE_NAME:-kihara-site}"
PORT="${PORT:-8080}"
BUILD_FRONTEND_MODE="${BUILD_FRONTEND_MODE:-external}"

RELEASE_DIR="$ROOT_DIR/release"
SOURCE_BINARY="$RELEASE_DIR/kihara-site"
SOURCE_ARTICLES_DIR="$ROOT_DIR/backend/articles"
SOURCE_TAG_CONFIG="$ROOT_DIR/backend/tag_config.yaml"
SOURCE_FRONTEND_DIST="$ROOT_DIR/frontend/dist"

TARGET_RELEASE_DIR="$DEPLOY_ROOT/release"
TARGET_BACKEND_DIR="$DEPLOY_ROOT/backend"
TARGET_FRONTEND_DIST="$DEPLOY_ROOT/frontend-dist"
TARGET_BINARY="$TARGET_RELEASE_DIR/kihara-site"
TARGET_TAG_CONFIG="$TARGET_BACKEND_DIR/tag_config.yaml"

step() {
  printf "\n==> %s\n" "$*"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf "Missing required command: %s\n" "$1" >&2
    exit 1
  fi
}

load_node_if_needed() {
  if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    return
  fi

  if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
    # shellcheck disable=SC1090
    source "$HOME/.nvm/nvm.sh"
  fi

  require_command node
  require_command npm
}

run_build() {
  step "Building project"
  load_node_if_needed
  require_command go
  require_command rsync
  (cd "$ROOT_DIR" && npm run build)

  if [[ ! -f "$SOURCE_BINARY" ]]; then
    printf "Build succeeded but binary is missing: %s\n" "$SOURCE_BINARY" >&2
    exit 1
  fi
}

sync_release() {
  step "Syncing release files into $DEPLOY_ROOT"
  mkdir -p "$TARGET_RELEASE_DIR" "$TARGET_BACKEND_DIR"
  rsync -a --delete "$SOURCE_ARTICLES_DIR/" "$TARGET_BACKEND_DIR/articles/"
  install -m 0644 "$SOURCE_TAG_CONFIG" "$TARGET_TAG_CONFIG"
  install -m 0755 "$SOURCE_BINARY" "$TARGET_BINARY"

  if [[ "$BUILD_FRONTEND_MODE" == "external" ]]; then
    mkdir -p "$TARGET_FRONTEND_DIST"
    rsync -a --delete "$SOURCE_FRONTEND_DIST/" "$TARGET_FRONTEND_DIST/"
  fi
}

restart_service() {
  step "Restarting systemd service"
  sudo systemctl restart "$SERVICE_NAME"
  sudo systemctl status "$SERVICE_NAME" --no-pager --full
}

verify_runtime() {
  step "Verifying local runtime"
  curl -I --max-time 10 "http://127.0.0.1:${PORT}/"
  sudo nginx -t
}

print_summary() {
  step "Deploy complete"
  printf "Service      : %s\n" "$SERVICE_NAME"
  printf "Deploy root  : %s\n" "$DEPLOY_ROOT"
  printf "Binary       : %s\n" "$TARGET_BINARY"
  if [[ "$BUILD_FRONTEND_MODE" == "external" ]]; then
    printf "Frontend dist: %s\n" "$TARGET_FRONTEND_DIST"
  else
    printf "Frontend dist: embedded in binary only\n"
  fi
}

main() {
  require_command sudo
  require_command curl
  run_build
  sync_release
  restart_service
  verify_runtime
  print_summary
}

main "$@"
