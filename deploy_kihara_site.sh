#!/usr/bin/env bash
set -Eeuo pipefail

########################################
# Kihara Site one-click deploy script
# Target: Raspberry Pi / Debian / Ubuntu
########################################

APP_NAME="kihara-site"
REPO_URL_DEFAULT="https://github.com/Kihara-Ri/kihara-site.git"
REPO_BRANCH_DEFAULT="main"
REPO_DIR_DEFAULT="$HOME/kihara-site"
INSTALL_ROOT_DEFAULT="/opt/kihara-site"
SERVICE_NAME_DEFAULT="kihara-site"
SERVICE_PATH_DEFAULT="/etc/systemd/system/${SERVICE_NAME_DEFAULT}.service"
NGINX_PUBLIC_ENTRY_DEFAULT="/etc/nginx/sites-available/public-entry"
NGINX_DEDICATED_CONF_DEFAULT="/etc/nginx/sites-available/${APP_NAME}.conf"
DOMAIN_DEFAULT="kihara.cn"
WWW_DOMAIN_DEFAULT="www.kihara.cn"
RUN_USER_DEFAULT="www-data"
RUN_GROUP_DEFAULT="www-data"
PORT_DEFAULT="8080"

DOMAIN="${DOMAIN:-$DOMAIN_DEFAULT}"
WWW_DOMAIN="${WWW_DOMAIN:-$WWW_DOMAIN_DEFAULT}"
REPO_URL="${REPO_URL:-$REPO_URL_DEFAULT}"
REPO_BRANCH="${REPO_BRANCH:-$REPO_BRANCH_DEFAULT}"
REPO_DIR="${REPO_DIR:-$REPO_DIR_DEFAULT}"
INSTALL_ROOT="${INSTALL_ROOT:-$INSTALL_ROOT_DEFAULT}"
SERVICE_NAME="${SERVICE_NAME:-$SERVICE_NAME_DEFAULT}"
SERVICE_PATH="${SERVICE_PATH:-$SERVICE_PATH_DEFAULT}"
PORT="${PORT:-$PORT_DEFAULT}"
RUN_USER="${RUN_USER:-$RUN_USER_DEFAULT}"
RUN_GROUP="${RUN_GROUP:-$RUN_GROUP_DEFAULT}"

# NGINX_MODE:
#   auto      -> if public-entry exists, patch it; otherwise create dedicated conf
#   shared    -> patch existing public-entry only
#   dedicated -> create dedicated conf only
NGINX_MODE="${NGINX_MODE:-auto}"
NGINX_PUBLIC_ENTRY="${NGINX_PUBLIC_ENTRY:-$NGINX_PUBLIC_ENTRY_DEFAULT}"
NGINX_DEDICATED_CONF="${NGINX_DEDICATED_CONF:-$NGINX_DEDICATED_CONF_DEFAULT}"
PATCH_SHARED_NGINX="false"

# Build controls
FORCE_CLEAN_FRONTEND="${FORCE_CLEAN_FRONTEND:-false}"
SKIP_APT_INSTALL="${SKIP_APT_INSTALL:-false}"
NONINTERACTIVE="${NONINTERACTIVE:-true}"

C_RESET='\033[0m'
C_BOLD='\033[1m'
C_DIM='\033[2m'
C_RED='\033[31m'
C_GREEN='\033[32m'
C_YELLOW='\033[33m'
C_BLUE='\033[34m'
C_CYAN='\033[36m'

step()  { printf "\n${C_BOLD}${C_BLUE}▶ %s${C_RESET}\n" "$*"; }
info()  { printf "${C_CYAN}• %s${C_RESET}\n" "$*"; }
ok()    { printf "${C_GREEN}✔ %s${C_RESET}\n" "$*"; }
warn()  { printf "${C_YELLOW}⚠ %s${C_RESET}\n" "$*"; }
fail()  { printf "${C_RED}✖ %s${C_RESET}\n" "$*" >&2; }

CURRENT_STEP=""
on_error() {
  local exit_code=$?
  fail "部署失败。"
  if [[ -n "$CURRENT_STEP" ]]; then
    fail "失败步骤: $CURRENT_STEP"
  fi
  fail "退出码: $exit_code"
  warn "建议查看上方第一条报错，并按提示修复后重试。"
  exit "$exit_code"
}
trap on_error ERR

require_root() {
  if [[ "$EUID" -ne 0 ]]; then
    fail "请用 sudo 运行此脚本。"
    printf "示例: sudo DOMAIN=%q WWW_DOMAIN=%q bash %q\n" "$DOMAIN" "$WWW_DOMAIN" "$0" >&2
    exit 1
  fi
}

run_as_user() {
  local user_name="$1"
  shift
  if command -v sudo >/dev/null 2>&1; then
    sudo -u "$user_name" -H bash -lc "$*"
  else
    su - "$user_name" -c "$*"
  fi
}

backup_file() {
  local file="$1"
  if [[ -f "$file" ]]; then
    local backup="${file}.bak.$(date +%Y%m%d_%H%M%S)"
    cp -a "$file" "$backup"
    info "已备份: $file -> $backup"
  fi
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

install_packages_if_needed() {
  CURRENT_STEP="检查并安装系统依赖"
  step "$CURRENT_STEP"

  local missing=()
  command_exists git || missing+=(git)
  command_exists go || missing+=(golang-go)
  command_exists npm || missing+=(npm)
  command_exists nginx || missing+=(nginx)
  command_exists rsync || missing+=(rsync)
  command_exists curl || missing+=(curl)

  if [[ ${#missing[@]} -eq 0 ]]; then
    ok "系统依赖已满足。"
    return
  fi

  warn "缺少依赖: ${missing[*]}"
  if [[ "$SKIP_APT_INSTALL" == "true" ]]; then
    fail "已设置 SKIP_APT_INSTALL=true，脚本不会自动安装依赖。"
    exit 1
  fi

  export DEBIAN_FRONTEND=noninteractive
  apt-get update
  apt-get install -y "${missing[@]}"
  ok "系统依赖安装完成。"
}

print_versions() {
  CURRENT_STEP="显示关键工具版本"
  step "$CURRENT_STEP"
  info "git   : $(git --version 2>/dev/null || true)"
  info "node  : $(node -v 2>/dev/null || echo '未安装')"
  info "npm   : $(npm -v 2>/dev/null || echo '未安装')"
  info "go    : $(go version 2>/dev/null || echo '未安装')"
  info "nginx : $(nginx -v 2>&1 || echo '未安装')"
  ok "版本检查完成。"
}

ensure_repo() {
  CURRENT_STEP="准备项目仓库"
  step "$CURRENT_STEP"

  local owner_home
  owner_home="$(getent passwd "${SUDO_USER:-$USER}" | cut -d: -f6)"
  [[ -n "$owner_home" ]] || owner_home="$HOME"

  if [[ ! -d "$REPO_DIR/.git" ]]; then
    info "仓库不存在，开始 clone: $REPO_URL"
    mkdir -p "$(dirname "$REPO_DIR")"
    run_as_user "${SUDO_USER:-$USER}" "git clone --branch '$REPO_BRANCH' --single-branch '$REPO_URL' '$REPO_DIR'"
    ok "仓库已克隆到: $REPO_DIR"
  else
    info "检测到已有仓库: $REPO_DIR"
    run_as_user "${SUDO_USER:-$USER}" "cd '$REPO_DIR' && git fetch origin '$REPO_BRANCH' && git checkout '$REPO_BRANCH' && git pull --ff-only origin '$REPO_BRANCH'"
    ok "仓库已更新到最新分支: $REPO_BRANCH"
  fi
}

prepare_frontend_dependencies() {
  CURRENT_STEP="准备前端依赖"
  step "$CURRENT_STEP"

  local frontend_dir="$REPO_DIR/frontend"
  [[ -f "$frontend_dir/package.json" ]] || { fail "未找到 $frontend_dir/package.json"; exit 1; }

  if [[ "$FORCE_CLEAN_FRONTEND" == "true" ]]; then
    warn "FORCE_CLEAN_FRONTEND=true，清理 frontend/node_modules 和 package-lock.json"
    rm -rf "$frontend_dir/node_modules"
    rm -f "$frontend_dir/package-lock.json"
  fi

  if [[ -f "$frontend_dir/package-lock.json" ]]; then
    info "检测到 package-lock.json，优先使用 npm ci"
    run_as_user "${SUDO_USER:-$USER}" "cd '$frontend_dir' && npm ci"
  else
    info "未检测到 package-lock.json，使用 npm install"
    run_as_user "${SUDO_USER:-$USER}" "cd '$frontend_dir' && npm install"
  fi
  ok "前端依赖安装完成。"
}

build_project() {
  CURRENT_STEP="构建项目"
  step "$CURRENT_STEP"
  [[ -f "$REPO_DIR/package.json" ]] || { fail "未找到 $REPO_DIR/package.json"; exit 1; }
  run_as_user "${SUDO_USER:-$USER}" "cd '$REPO_DIR' && npm run build"

  [[ -f "$REPO_DIR/release/kihara-site" ]] || {
    fail "构建后未找到 $REPO_DIR/release/kihara-site"
    exit 1
  }
  ok "构建完成，已生成二进制文件。"
}

install_app_files() {
  CURRENT_STEP="安装应用文件到 $INSTALL_ROOT"
  step "$CURRENT_STEP"

  mkdir -p "$INSTALL_ROOT/release" "$INSTALL_ROOT/backend"
  rsync -a --delete "$REPO_DIR/backend/articles/" "$INSTALL_ROOT/backend/articles/"
  install -m 0644 "$REPO_DIR/backend/tag_config.yaml" "$INSTALL_ROOT/backend/tag_config.yaml"
  install -m 0755 "$REPO_DIR/release/kihara-site" "$INSTALL_ROOT/release/kihara-site"
  mkdir -p "$INSTALL_ROOT/backend/data"
  touch "$INSTALL_ROOT/backend/access.log"

  chown -R "$RUN_USER:$RUN_GROUP" "$INSTALL_ROOT"
  chmod 0755 "$INSTALL_ROOT" "$INSTALL_ROOT/release" "$INSTALL_ROOT/backend"
  chmod 0755 "$INSTALL_ROOT/release/kihara-site"

  ok "应用文件已安装到: $INSTALL_ROOT"
}

write_systemd_service() {
  CURRENT_STEP="写入 systemd 服务"
  step "$CURRENT_STEP"
  backup_file "$SERVICE_PATH"

  cat > "$SERVICE_PATH" <<EOF_SERVICE
[Unit]
Description=Kihara Personal Site
After=network.target

[Service]
Type=simple
User=$RUN_USER
Group=$RUN_GROUP
WorkingDirectory=$INSTALL_ROOT/backend
ExecStart=$INSTALL_ROOT/release/kihara-site
Restart=always
RestartSec=3
Environment=PORT=$PORT
Environment=ARTICLE_DIR=$INSTALL_ROOT/backend/articles
Environment=TAG_CONFIG_PATH=$INSTALL_ROOT/backend/tag_config.yaml
# Optional override:
# Environment=STATIC_DIR=$INSTALL_ROOT/frontend/dist

[Install]
WantedBy=multi-user.target
EOF_SERVICE

  systemctl daemon-reload
  systemctl enable "$SERVICE_NAME"
  ok "systemd 服务已写入: $SERVICE_PATH"
}

choose_nginx_mode() {
  case "$NGINX_MODE" in
    auto)
      if [[ -f "$NGINX_PUBLIC_ENTRY" ]]; then
        PATCH_SHARED_NGINX="true"
        info "检测到共享 Nginx 文件: $NGINX_PUBLIC_ENTRY"
      else
        PATCH_SHARED_NGINX="false"
        info "未检测到共享 Nginx 文件，将创建独立配置。"
      fi
      ;;
    shared)
      [[ -f "$NGINX_PUBLIC_ENTRY" ]] || { fail "NGINX_MODE=shared，但未找到 $NGINX_PUBLIC_ENTRY"; exit 1; }
      PATCH_SHARED_NGINX="true"
      ;;
    dedicated)
      PATCH_SHARED_NGINX="false"
      ;;
    *)
      fail "无效的 NGINX_MODE: $NGINX_MODE（可选: auto/shared/dedicated）"
      exit 1
      ;;
  esac
}

patch_shared_nginx() {
  CURRENT_STEP="更新共享 Nginx 配置: $NGINX_PUBLIC_ENTRY"
  step "$CURRENT_STEP"
  backup_file "$NGINX_PUBLIC_ENTRY"

  python3 - "$NGINX_PUBLIC_ENTRY" "$DOMAIN" "$WWW_DOMAIN" "$PORT" <<'PY'
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
domain = sys.argv[2]
www_domain = sys.argv[3]
port = sys.argv[4]
text = path.read_text(encoding='utf-8')

server_blocks = re.findall(r'server\s*\{(?:[^{}]|\{[^{}]*\})*\}', text, flags=re.S)
if not server_blocks:
    raise SystemExit("未找到任何 server 块，无法自动修改共享 Nginx 配置。")

target = None
for block in server_blocks:
    if f"server_name {domain} {www_domain};" in block and "listen 443 ssl" in block:
        target = block
        break
if target is None:
    for block in server_blocks:
        if f"server_name {domain}" in block and "listen 443 ssl" in block:
            target = block
            break
if target is None:
    raise SystemExit(f"未找到 {domain} 的 443 server 块，无法自动修改。")

ssl_cert = re.search(r'\n\s*ssl_certificate\s+[^;]+;', target)
ssl_key = re.search(r'\n\s*ssl_certificate_key\s+[^;]+;', target)
ssl_inc = re.search(r'\n\s*include\s+/etc/letsencrypt/options-ssl-nginx\.conf;[^\n]*', target)
dhparam = re.search(r'\n\s*ssl_dhparam\s+[^;]+;', target)
if not (ssl_cert and ssl_key and ssl_inc and dhparam):
    raise SystemExit("目标 server 块缺少 Certbot 生成的 SSL 配置，停止自动修改。")

new_block = f'''server {{
    server_name {domain} {www_domain};

    location / {{
        proxy_pass http://127.0.0.1:{port};
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }}
{ssl_cert.group(0)}
{ssl_key.group(0)}
{ssl_inc.group(0)}
{dhparam.group(0)}

}}'''

text = text.replace(target, new_block, 1)
path.write_text(text, encoding='utf-8')
print("共享 Nginx 配置已更新。")
PY

  ok "共享 Nginx 配置已更新。"
}

write_dedicated_nginx_conf() {
  CURRENT_STEP="写入独立 Nginx 配置: $NGINX_DEDICATED_CONF"
  step "$CURRENT_STEP"
  backup_file "$NGINX_DEDICATED_CONF"

  cat > "$NGINX_DEDICATED_CONF" <<EOF_NGINX
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN $WWW_DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN $WWW_DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 16m;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF_NGINX

  ln -sfn "$NGINX_DEDICATED_CONF" "/etc/nginx/sites-enabled/$(basename "$NGINX_DEDICATED_CONF")"
  ok "独立 Nginx 配置已写入并启用。"
}

check_port_conflict() {
  CURRENT_STEP="检查端口占用"
  step "$CURRENT_STEP"
  if ss -ltnp | grep -q ":$PORT "; then
    warn "检测到端口 $PORT 已被占用："
    ss -ltnp | grep ":$PORT " || true
    warn "脚本会继续执行，并尝试重启 $SERVICE_NAME。若启动失败，请先停止旧服务。"
  else
    ok "端口 $PORT 当前未被占用。"
  fi
}

restart_services() {
  CURRENT_STEP="重启服务并验证配置"
  step "$CURRENT_STEP"

  nginx -t
  systemctl restart "$SERVICE_NAME"
  systemctl reload nginx
  ok "systemd 与 Nginx 已重启。"
}

health_checks() {
  CURRENT_STEP="健康检查"
  step "$CURRENT_STEP"

  local local_health="http://127.0.0.1:${PORT}/healthz"
  if curl -fsS "$local_health" >/dev/null; then
    ok "本地健康检查通过: $local_health"
  else
    fail "本地健康检查失败: $local_health"
    journalctl -u "$SERVICE_NAME" -n 50 --no-pager || true
    exit 1
  fi

  info "systemd 状态摘要："
  systemctl --no-pager --full status "$SERVICE_NAME" | sed -n '1,15p' || true
}

final_summary() {
  CURRENT_STEP="输出部署摘要"
  step "$CURRENT_STEP"
  printf "${C_BOLD}${C_GREEN}部署完成${C_RESET}\n"
  printf "${C_DIM}----------------------------------------${C_RESET}\n"
  printf "域名           : %s %s\n" "$DOMAIN" "$WWW_DOMAIN"
  printf "仓库目录       : %s\n" "$REPO_DIR"
  printf "安装目录       : %s\n" "$INSTALL_ROOT"
  printf "服务名         : %s\n" "$SERVICE_NAME"
  printf "监听端口       : %s\n" "$PORT"
  if [[ "$PATCH_SHARED_NGINX" == "true" ]]; then
    printf "Nginx 模式     : shared (%s)\n" "$NGINX_PUBLIC_ENTRY"
  else
    printf "Nginx 模式     : dedicated (%s)\n" "$NGINX_DEDICATED_CONF"
  fi
  printf "健康检查       : http://127.0.0.1:%s/healthz\n" "$PORT"
  printf "\n"
  info "若站点已启用 HTTPS，请确认证书文件存在："
  printf "  /etc/letsencrypt/live/%s/fullchain.pem\n" "$DOMAIN"
  printf "  /etc/letsencrypt/live/%s/privkey.pem\n" "$DOMAIN"
  printf "\n"
  info "常用排障命令："
  printf "  journalctl -u %s -f\n" "$SERVICE_NAME"
  printf "  sudo nginx -t\n"
  printf "  curl -I https://%s\n" "$DOMAIN"
}

main() {
  require_root
  choose_nginx_mode
  install_packages_if_needed
  print_versions
  ensure_repo
  prepare_frontend_dependencies
  build_project
  install_app_files
  write_systemd_service
  check_port_conflict
  if [[ "$PATCH_SHARED_NGINX" == "true" ]]; then
    patch_shared_nginx
  else
    write_dedicated_nginx_conf
  fi
  restart_services
  health_checks
  final_summary
}

main "$@"
