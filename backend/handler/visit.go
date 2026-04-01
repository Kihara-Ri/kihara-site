package handler

import (
	"encoding/json"
	"net/http"

	"kihara.cn/personal-site/logger"
	"kihara.cn/personal-site/model"
	"kihara.cn/personal-site/store"
)

var visitorStore = mustVisitorStore()

func mustVisitorStore() *store.VisitorStore {
	visitorStore, err := store.NewVisitorStore("data/visitors.json")
	if err != nil {
		panic(err)
	}
	return visitorStore
}

func VisitHandler(w http.ResponseWriter, r *http.Request) {
	var request model.VisitRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "请求格式错误", http.StatusBadRequest)
		return
	}

	ip := getClientIP(r)
	userAgent := r.UserAgent()
	acceptLanguage := r.Header.Get("Accept-Language")

	logger.LogAccess(ip, userAgent, "访问 /api/visit")

	info, err := visitorStore.Register(request.VisitorID, ip, userAgent, acceptLanguage)
	if err != nil {
		http.Error(w, "访客记录失败", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(info)
}
