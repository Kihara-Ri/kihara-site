#!/bin/bash

set -e

APP_NAME="backserver"
BUILD_DIR="."
OUT_DIR="/var/www/personal-site"
OUT_FILE="$OUT_DIR/$APP_NAME"
LOG_FILE="$OUT_DIR/${APP_NAME}.log"

echo "🔍 检测系统架构 ..."
ARCH=$(uname -m)
echo "🧠 当前架构: $ARCH"

GOOS="linux"
GOARCH=""
GOARM=""

# 根据架构判断交叉编译参数
case "$ARCH" in
  "x86_64")
    GOARCH="amd64"
    ;;
  "armv7l")
    GOARCH="arm"
    GOARM="7"
    ;;
  "aarch64")
    GOARCH="arm64"
    ;;
  *)
    echo "❌ 不支持的架构: $ARCH"
    exit 1
    ;;
esac

echo "🛠️ 开始构建 $APP_NAME ..."

# 创建目标目录
mkdir -p "$OUT_DIR"

# 编译命令（根据是否需要 GOARM 动态拼接）
if [ "$GOARCH" = "arm" ]; then
  GOOS=$GOOS GOARCH=$GOARCH GOARM=$GOARM go build -o "$OUT_FILE" "$BUILD_DIR/main.go"
else
  GOOS=$GOOS GOARCH=$GOARCH go build -o "$OUT_FILE" "$BUILD_DIR/main.go"
fi

echo "✅ 构建完成：$OUT_FILE"

# 尝试关闭已有进程
echo "🧹 清理旧进程 ..."
pkill -f "$OUT_FILE" || echo "（没有找到旧进程）"

# 赋予执行权限
chmod +x "$OUT_FILE"

# 启动服务
echo "🚀 启动服务 ..."
nohup "$OUT_FILE" > "$LOG_FILE" 2>&1 &

echo "📄 日志文件：$LOG_FILE"
echo "✅ 部署完成！进程 ID: $(pgrep -f $OUT_FILE)"
