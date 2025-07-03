package handler

import (
	"encoding/json"
	"net/http"

	"kihara.cn/personal-site/model"
	"kihara.cn/personal-site/repository"
)

// HistoryHandler 处理 GET /api/history
func HistoryHandler(w http.ResponseWriter, r *http.Request) {
	records, err := repository.List(100) // 最近100条
	if err != nil {
		http.Error(w, "db error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	// 将 DB 实体映射为前端友好的 DTO
	dtos := make([]model.HistoryDTO, len(records))
	for i, h := range records {
		dtos[i] = model.HistoryDTO{
			HistoryID:   h.ID,
			Type:        h.Type,
			Question:    h.Question,
			Answer:      h.Answer,
			FromLang:    h.FromLang,
			ToLang:      h.ToLang,
			Enhancement: h.Enhancement,
			CreateAt:    h.CreatedAt,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(dtos)
}
