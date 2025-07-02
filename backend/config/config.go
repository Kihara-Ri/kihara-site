package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

var (
	DeepSeekAPIKey string
)

func LoadConfig() {
	_ = godotenv.Load(".env")
	DeepSeekAPIKey = os.Getenv("DEEPSEEK_API_KEY")
	if DeepSeekAPIKey == "" {
		log.Fatal("环境变量 DEEPSEEK_API_KEY 未设置")
	} else {
		fmt.Printf("环境变量已加载%s\n", DeepSeekAPIKey)
	}
}
