package router

import (
	"io/fs"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/go-chi/chi/v5"
	"kihara.cn/personal-site/handler"
)

// NewRouter 返回一个已注册全部路由的 chi.Router
func NewRouter(staticDir string, embeddedStatic fs.FS) http.Handler {
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

	switch {
	case staticDir != "":
		r.NotFound(spaDiskHandler(staticDir))
	case embeddedStatic != nil:
		r.NotFound(spaEmbeddedHandler(embeddedStatic))
	}

	return r
}

func spaDiskHandler(staticDir string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			http.NotFound(w, r)
			return
		}

		cleanPath := path.Clean("/" + strings.TrimPrefix(r.URL.Path, "/"))
		if cleanPath == "/" {
			serveDiskIndex(w, r, staticDir)
			return
		}

		relativePath := strings.TrimPrefix(cleanPath, "/")
		fullPath := filepath.Join(staticDir, filepath.FromSlash(relativePath))
		info, err := os.Stat(fullPath)
		if err == nil && !info.IsDir() {
			http.ServeFile(w, r, fullPath)
			return
		}

		if filepath.Ext(relativePath) != "" {
			http.NotFound(w, r)
			return
		}

		serveDiskIndex(w, r, staticDir)
	}
}

func serveDiskIndex(w http.ResponseWriter, r *http.Request, staticDir string) {
	indexPath := filepath.Join(staticDir, "index.html")
	if _, err := os.Stat(indexPath); err != nil {
		http.NotFound(w, r)
		return
	}
	http.ServeFile(w, r, indexPath)
}

func spaEmbeddedHandler(staticFiles fs.FS) http.HandlerFunc {
	fileServer := http.FileServer(http.FS(staticFiles))

	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			http.NotFound(w, r)
			return
		}

		cleanPath := path.Clean("/" + strings.TrimPrefix(r.URL.Path, "/"))
		if cleanPath == "/" {
			serveEmbeddedIndex(w, r, staticFiles)
			return
		}

		relativePath := strings.TrimPrefix(cleanPath, "/")
		info, err := fs.Stat(staticFiles, relativePath)
		if err == nil && !info.IsDir() {
			fileServer.ServeHTTP(w, r)
			return
		}

		if filepath.Ext(relativePath) != "" {
			http.NotFound(w, r)
			return
		}

		serveEmbeddedIndex(w, r, staticFiles)
	}
}

func serveEmbeddedIndex(w http.ResponseWriter, r *http.Request, staticFiles fs.FS) {
	indexBytes, err := fs.ReadFile(staticFiles, "index.html")
	if err != nil {
		http.NotFound(w, r)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_, _ = w.Write(indexBytes)
}
