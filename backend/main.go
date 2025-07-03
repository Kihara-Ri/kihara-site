package main

import (
	"log"
	"net/http"
	"time"

	"kihara.cn/personal-site/config"
	"kihara.cn/personal-site/repository"
	"kihara.cn/personal-site/router"
	"kihara.cn/personal-site/service"
)

func main() {
	config.LoadConfig()    // 读取环境变量
	repository.InitDB()    // 初始化数据库
	service.InitAIClient() // 初始化 DeepSeek 客户端

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
