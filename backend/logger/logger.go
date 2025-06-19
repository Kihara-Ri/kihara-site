package logger

import (
	"fmt"
	"log"
	"os"
	"time"
)

var logFile *os.File

func init() {
	var err error
	logFile, err = os.OpenFile("access.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatalf("无法打开日志文件: %v", err)
	}
	log.SetOutput(logFile)
}

// 记录一次访问日志
func LogAccess(ip string, userAgent string, extra string) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	logLine := fmt.Sprintf("[%s] IP: %s | UA: %s | Info: %s", timestamp, ip, userAgent, extra)
	log.Println(logLine)
}

// 释放资源
func CloseLogFile() {
	if logFile != nil {
		logFile.Close()
	}
}
