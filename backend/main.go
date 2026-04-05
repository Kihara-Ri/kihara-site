package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"kihara.cn/personal-site/router"
	"kihara.cn/personal-site/web"
)

func main() {
	staticDir := resolveStaticDir()
	embeddedStatic, err := web.StaticFiles()
	if err != nil {
		log.Printf("嵌入前端资源不可用: %v", err)
	}

	// 路由
	r := router.NewRouter(staticDir, embeddedStatic)

	// 启动 HTTP 服务器
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	addr := ":" + port
	srv := &http.Server{
		Addr:              addr,
		Handler:           r,
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Printf("后端服务已启动: %s", addr)
	if staticDir != "" {
		log.Printf("前端静态资源目录: %s", staticDir)
	} else if embeddedStatic != nil {
		log.Printf("前端静态资源来源: embedded")
	} else {
		log.Printf("未检测到前端构建产物，当前仅提供 API")
	}
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("服务出现错误: %v", err)
	}
}

func resolveStaticDir() string {
	staticDir := os.Getenv("STATIC_DIR")
	if staticDir == "" {
		staticDir = filepath.Clean(filepath.Join("..", "frontend", "dist"))
	}

	info, err := os.Stat(staticDir)
	if err != nil || !info.IsDir() {
		return ""
	}

	return staticDir
}
