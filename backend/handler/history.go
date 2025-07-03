package handler

import (
	"encoding/json"
	"net/http"

	"kihara.cn/personal-site/repository"
)

// HistoryHandler 处理 GET /api/history
func HistoryHandler(w http.ResponseWriter, r *http.Request) {
	histories, err := repository.List(100) // 最近100条
	if err != nil {
		http.Error(w, "db error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	// mu.Lock()
	// defer mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(histories)
}
