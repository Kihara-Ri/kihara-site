package main

import (
	"log"
	"net/http"
	"time"

	"kihara.cn/personal-site/config"
	"kihara.cn/personal-site/router"
	"kihara.cn/personal-site/service"
)

func main() {
	// 读取环境变量
	config.LoadConfig()
	// 初始化 DeepSeek 客户端
	service.InitAIClient()

	// 路由
	r := router.NewRouter()

	// 启动 HTTP 服务器
	addr := ":8080"
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
