package service

import (
	"context"
	"fmt"
	"time"

	openai "github.com/sashabaranov/go-openai"
	"kihara.cn/personal-site/config"
	"kihara.cn/personal-site/model"
	"kihara.cn/personal-site/utils"

	"github.com/google/uuid"
)

var client *openai.Client

func InitAIClient() {
	cfg := openai.DefaultConfig(config.DeepSeekAPIKey) // 传入 apiKey
	cfg.BaseURL = "https://api.deepseek.com/"          // DeepSeek的URL
	client = openai.NewClientWithConfig(cfg)
	fmt.Println("DeepSeek 服务初始化成功")
}

func AskAI(req model.AIRequest) (*model.AIResponse, error) {
	prompt := utils.BuildPrompt(req)

	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: "deepseek-chat",
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleUser,
					Content: prompt,
				},
			},
		},
	)
	if err != nil {
		fmt.Println("调用API时出现错误!")
		return nil, err
	}

	answer := resp.Choices[0].Message.Content
	return &model.AIResponse{
		Answer:      answer,
		Type:        req.Type,
		HistoryID:   uuid.NewString(),
		Timestamp:   time.Now().Format(time.RFC3339),
		FromLang:    req.FromLang,
		ToLang:      req.ToLang,
		Enhancement: req.Enhancement,
	}, nil
}
