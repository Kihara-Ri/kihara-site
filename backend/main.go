package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"kihara.cn/personal-site/router"
)

func main() {
	// 路由
	r := router.NewRouter()

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
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("服务出现错误: %v", err)
	}
}
