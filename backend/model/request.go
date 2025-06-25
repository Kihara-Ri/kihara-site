// 定义前端请求结构
package model

type TaskType string
type Enhancement string

const (
	TaskQA        TaskType = "问答"
	TaskTranslate TaskType = "翻译"

	EnhanceNone    Enhancement = ""
	EnhancePrecise Enhancement = "精细翻译"
	EnhanceSynonym Enhancement = "查找同义词"
)

type AIRequest struct {
	Type        TaskType    `json:"type"` // "问答" | "翻译"
	Question    string      `json:"question"`
	FromLang    string      `json:"fromLang,omitempty"` // 翻译时需要
	ToLang      string      `json:"toLang,omitempty"`
	Enhancement Enhancement `json:"enhancement,omitempty"` // 精细翻译 | 查找同义词
}
