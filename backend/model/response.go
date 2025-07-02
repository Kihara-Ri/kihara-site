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

// IP 响应结构
type IPResponse struct {
	IP          string  `json:"ip"`
	CountryName string  `json:"country_name"`
	RegionName  string  `json:"region_name"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	IsProxy     bool    `json:"is_proxy"`
}

// 内部API前端显示
type IPInfo struct {
	IP          string  `json:"ip"`
	Location    string  `json:"location"`
	CountryName string  `json:"country_name"`
	Latitude    float64 `json:"latitude"`
	Longtitude  float64 `json:"longitude"`
	Distance    float64 `json:"distance"`
}
