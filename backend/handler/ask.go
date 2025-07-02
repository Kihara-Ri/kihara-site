package handler

import (
	"encoding/json"
	"net/http"
	"sync"

	"kihara.cn/personal-site/model"
	"kihara.cn/personal-site/service"
)

// 线程安全的简易内存历史存储
var (
	history []model.HistoryItem
	mu      sync.Mutex
)

// AskHandler 处理 POST /api/ask
func AskHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed | 请求方法不允许, 请使用 POST", http.StatusMethodNotAllowed)
		return
	}

	var req model.AIRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	resp, err := service.AskAI(req)
	if err != nil {
		http.Error(w, "AI request failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 保存到历史
	mu.Lock()
	history = append(history, *resp)
	mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)

}
