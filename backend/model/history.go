package model

import "time"

type HistoryItem = AIResponse

// history data transfer object
type HistoryDTO struct {
	HistoryID   string    `json:"historyId"`
	Type        string    `json:"type"`
	Question    string    `json:"question"`
	Answer      string    `json:"answer"`
	FromLang    string    `json:"fromLang,omitempty"`
	ToLang      string    `json:"toLang,omitempty"`
	Enhancement string    `json:"enhancement,omitempty"`
	CreateAt    time.Time `json:"createdAt"`
}
