package handler

import (
	"encoding/json"
	"net/http"
)

// HistoryHandler 处理 GET /api/history
func HistoryHandler(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	defer mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(history)
}
