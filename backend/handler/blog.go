package handler

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"sync"

	"kihara.cn/personal-site/internal/blog"
)

var (
	blogStoreOnce sync.Once
	blogStore     *blog.Store
	blogStoreErr  error
)

func getBlogStore() (*blog.Store, error) {
	blogStoreOnce.Do(func() {
		workingDir, err := os.Getwd()
		if err != nil {
			blogStoreErr = err
			return
		}

		articleDir := os.Getenv("ARTICLE_DIR")
		if articleDir == "" {
			articleDir = filepath.Join(workingDir, "articles")
		}

		tagConfigPath := os.Getenv("TAG_CONFIG_PATH")
		if tagConfigPath == "" {
			tagConfigPath = filepath.Join(workingDir, "tag_config.yaml")
		}

		tagConfig, err := blog.LoadTagConfig(tagConfigPath)
		if err != nil {
			blogStoreErr = err
			return
		}

		if whitelistOverride := strings.TrimSpace(os.Getenv("TAG_WHITELIST_ENABLED")); whitelistOverride != "" {
			parsed, parseErr := strconv.ParseBool(whitelistOverride)
			if parseErr != nil {
				blogStoreErr = parseErr
				return
			}
			tagConfig.WhitelistEnabled = parsed
		}

		if strictValidationOverride := strings.TrimSpace(os.Getenv("STRICT_CONTENT_VALIDATION")); strictValidationOverride != "" {
			parsed, parseErr := strconv.ParseBool(strictValidationOverride)
			if parseErr != nil {
				blogStoreErr = parseErr
				return
			}
			tagConfig.StrictContentValidation = parsed
		}

		store := blog.NewStore(
			articleDir,
			tagConfig.AllowedTags,
			tagConfig.WhitelistEnabled,
			tagConfig.StrictContentValidation,
		)

		if validationErr := store.ValidateAll(); validationErr != nil {
			log.Printf("blog content validation failed during startup")
			logBlogStoreErrors(validationErr)
			if tagConfig.StrictContentValidation {
				blogStoreErr = validationErr
				return
			}
			log.Printf("strict blog content validation disabled, continue with valid articles only")
		}

		blogStore = store
	})

	return blogStore, blogStoreErr
}

func BlogTagsHandler(w http.ResponseWriter, r *http.Request) {
	store, err := getBlogStore()
	if err != nil {
		writeBlogError(w, http.StatusInternalServerError, "blog store unavailable", err.Error())
		return
	}

	if r.Method != http.MethodGet {
		writeBlogError(w, http.StatusMethodNotAllowed, "method not allowed", nil)
		return
	}

	writeBlogJSON(w, http.StatusOK, map[string][]string{"tags": store.AllowedTagList()})
}

func BlogOverviewHandler(w http.ResponseWriter, r *http.Request) {
	store, err := getBlogStore()
	if err != nil {
		writeBlogError(w, http.StatusInternalServerError, "blog store unavailable", err.Error())
		return
	}

	if r.Method != http.MethodGet {
		writeBlogError(w, http.StatusMethodNotAllowed, "method not allowed", nil)
		return
	}

	overview, overviewErr := store.GetOverview()
	if overviewErr != nil {
		handleBlogStoreError(w, overviewErr)
		return
	}

	writeBlogJSON(w, http.StatusOK, map[string]any{"overview": overview})
}

func BlogArticleListHandler(w http.ResponseWriter, r *http.Request) {
	store, err := getBlogStore()
	if err != nil {
		writeBlogError(w, http.StatusInternalServerError, "blog store unavailable", err.Error())
		return
	}

	if r.Method != http.MethodGet {
		writeBlogError(w, http.StatusMethodNotAllowed, "method not allowed", nil)
		return
	}

	tag := strings.TrimSpace(r.URL.Query().Get("tag"))
	series := strings.TrimSpace(r.URL.Query().Get("series"))

	var (
		articles []blog.ArticleMeta
		listErr  error
	)

	if series != "" {
		articles, listErr = store.ListBySeries(series)
		if listErr == nil && tag != "" {
			filtered := make([]blog.ArticleMeta, 0, len(articles))
			for _, article := range articles {
				if slices.Contains(article.Tags, tag) {
					filtered = append(filtered, article)
				}
			}
			articles = filtered
		}
	} else {
		articles, listErr = store.List(tag)
	}

	if listErr != nil {
		handleBlogStoreError(w, listErr)
		return
	}

	writeBlogJSON(w, http.StatusOK, map[string]any{"articles": articles})
}

func BlogArticleHandler(w http.ResponseWriter, r *http.Request) {
	store, err := getBlogStore()
	if err != nil {
		writeBlogError(w, http.StatusInternalServerError, "blog store unavailable", err.Error())
		return
	}

	if r.Method != http.MethodGet {
		writeBlogError(w, http.StatusMethodNotAllowed, "method not allowed", nil)
		return
	}

	slug := strings.TrimSpace(strings.TrimPrefix(r.URL.Path, "/api/articles/"))
	slug = strings.Trim(slug, "/")
	if slug == "" {
		writeBlogError(w, http.StatusNotFound, "article not found", nil)
		return
	}

	article, articleErr := store.GetBySlug(slug)
	if articleErr != nil {
		handleBlogStoreError(w, articleErr)
		return
	}

	writeBlogJSON(w, http.StatusOK, map[string]any{"article": article.API()})
}

func handleBlogStoreError(w http.ResponseWriter, err error) {
	if errors.Is(err, blog.ErrNotFound) {
		writeBlogError(w, http.StatusNotFound, "not found", nil)
		return
	}

	var loadErr *blog.LoadErrors
	if errors.As(err, &loadErr) {
		logBlogStoreErrors(loadErr)
		details := make([]any, 0, len(loadErr.Errors))
		for _, item := range loadErr.Errors {
			var validationErr *blog.ValidationError
			if errors.As(item, &validationErr) {
				details = append(details, validationErr)
			} else {
				details = append(details, map[string]any{"message": item.Error()})
			}
		}
		writeBlogError(w, http.StatusUnprocessableEntity, "metadata validation failed", details)
		return
	}

	var validationErr *blog.ValidationError
	if errors.As(err, &validationErr) {
		writeBlogError(w, http.StatusUnprocessableEntity, "metadata validation failed", validationErr)
		return
	}

	log.Printf("blog internal error: %v", err)
	writeBlogError(w, http.StatusInternalServerError, "internal server error", err.Error())
}

func logBlogStoreErrors(err error) {
	var loadErr *blog.LoadErrors
	if errors.As(err, &loadErr) {
		for _, item := range loadErr.Errors {
			log.Printf("blog validation error: %v", item)
		}
		return
	}

	log.Printf("blog validation error: %v", err)
}

func writeBlogJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)

	encoder := json.NewEncoder(w)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(payload); err != nil {
		log.Printf("write blog json failed: %v", err)
	}
}

func writeBlogError(w http.ResponseWriter, status int, message string, detail any) {
	writeBlogJSON(w, status, map[string]any{
		"error": map[string]any{
			"message": message,
			"detail":  detail,
		},
	})
}
