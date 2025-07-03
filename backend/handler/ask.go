package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"kihara.cn/personal-site/model"
	"kihara.cn/personal-site/repository"
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

	// ----------------------------- 写入数据库 --------------------------------------------
	repoItem := repository.History{
		ID:          resp.HistoryID,
		Type:        string(resp.Type),
		Question:    req.Question,
		Answer:      resp.Answer,
		FromLang:    resp.FromLang,
		ToLang:      req.ToLang,
		Enhancement: string(req.Enhancement),
	}
	if err := repository.Save(&repoItem); err != nil {
		log.Printf("保存历史失败: %v", err)
	}

	// 保存到内存历史
	// mu.Lock()
	// history = append(history, *resp)
	// mu.Unlock()

	// w.Header().Set("Content-Type", "application/json")
	// _ = json.NewEncoder(w).Encode(resp)
}
