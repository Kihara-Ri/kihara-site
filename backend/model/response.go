// 定义 AI 响应结构
package model

type AIResponse struct {
	Answer      string      `json:"answer"`
	Type        TaskType    `json:"type"`
	HistoryID   string      `json:"historyId"`
	Timestamp   string      `json:"timestamp"`
	FromLang    string      `json:"fromLang,omitempty"`
	ToLang      string      `json:"toLang,omitempty"`
	Enhancement Enhancement `json:"enhancement,omitempty"`
}
