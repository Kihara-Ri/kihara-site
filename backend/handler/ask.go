package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"kihara.cn/personal-site/model"
	"kihara.cn/personal-site/repository"
	"kihara.cn/personal-site/service"
)

// 线程安全的简易内存历史存储
// var (
// 	history []model.HistoryItem
// 	mu      sync.Mutex
// )

// AskHandler 处理 POST /api/ask
func AskHandler(w http.ResponseWriter, r *http.Request) {
	// --------------------------------------------- 日志: 请求来源 & 方法 ---------------------------------------------------
	log.Printf("[ASK] %s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)

	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed | 请求方法不允许, 请使用 POST", http.StatusMethodNotAllowed)
		return
	}

	// --------------------------------------------- 解析 JSON ---------------------------------------------------
	var req model.AIRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[ASK] JSON decode error: %v", err)
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	log.Printf("[ASK] Parsed Request: %+v", req)

	// --------------------------------------------- 调用 AI ---------------------------------------------------
	resp, err := service.AskAI(req)
	if err != nil {
		log.Printf("[ASK] AI request failed: %v", err)
		http.Error(w, "AI request failed: "+err.Error(), http.StatusInternalServerError)
		return
	}
	log.Printf("[ASK] AI Response OK (historyId=%s)", resp.HistoryID)

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

	// -------------------------------------- 返回 JSON -----------------------------------
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		log.Printf("[ASK] encode response error: %v", err)
	}
}
