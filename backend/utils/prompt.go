package utils

import (
	"fmt"
	"strings"

	"kihara.cn/personal-site/model"
)

func BuildPrompt(req model.AIRequest) string {
	switch req.Type {
	case model.TaskQA:
		// 快速问答
		return fmt.Sprintf("请简洁地回答下列问题：\n\n%s", req.Question)

	case model.TaskTranslate:
		// 翻译服务
		// 标准化语言名称
		from := LangName(req.FromLang)
		to := LangName(req.ToLang)

		switch req.Enhancement {
		case model.EnhancePrecise:
			// 精细翻译
			return fmt.Sprintf("请使用地道、正式的语言将以下内容翻译为：%s: \n\n%s", to, req.Question)

		case model.EnhanceSynonym:
			// 查找同义词
			return fmt.Sprintf("请翻译以下内容为%s，并列出关键词的同义词：\n\n%s", to, req.Question)

		default:
			// 普通翻译
			return fmt.Sprintf("请将以下文本从%s翻译成%s：\n\n%s", from, to, req.Question)
		}
	default:
		return req.Question
	}
}

// 将语言代码转为中文名称 用于提示词中
func LangName(code string) string {
	switch strings.ToLower(code) {
	case "zh":
		return "中文"
	case "en":
		return "英文"
	case "ja":
		return "日文"
	default:
		return code
	}
}
