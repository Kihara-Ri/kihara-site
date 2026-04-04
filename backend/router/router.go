package router

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"kihara.cn/personal-site/handler"
)

// NewRouter 返回一个已注册全部路由的 chi.Router
func NewRouter() http.Handler {
	r := chi.NewRouter()

	// API
	r.Get("/api/ipinfo", handler.IpInfoHandler)
	r.Post("/api/visit", handler.VisitHandler)
	r.Get("/api/tags", handler.BlogTagsHandler)
	r.Get("/api/overview", handler.BlogOverviewHandler)
	r.Get("/api/articles", handler.BlogArticleListHandler)
	r.Get("/api/articles/*", handler.BlogArticleHandler)

	// 健康检查
	r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.Write([]byte("ok"))
	})

	return r
}
