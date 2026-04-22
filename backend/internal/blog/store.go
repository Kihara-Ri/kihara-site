package blog

import (
	"errors"
	"io/fs"
	"os"
	"path/filepath"
	"slices"
	"sort"
	"strings"
	"unicode"
)

var ErrNotFound = errors.New("article not found")

type Store struct {
	rootDir             string
	allowedTags         map[string]struct{}
	enforceTagWhitelist bool
	strictValidation    bool
}

func NewStore(
	rootDir string,
	allowedTags []string,
	enforceTagWhitelist bool,
	strictValidation bool,
) *Store {
	tagSet := make(map[string]struct{}, len(allowedTags))
	for _, tag := range allowedTags {
		tagSet[tag] = struct{}{}
	}

	return &Store{
		rootDir:             rootDir,
		allowedTags:         tagSet,
		enforceTagWhitelist: enforceTagWhitelist,
		strictValidation:    strictValidation,
	}
}

type LoadErrors struct {
	Errors []error
}

func (e *LoadErrors) Error() string {
	return "one or more articles failed validation"
}

func (e *LoadErrors) Unwrap() []error {
	return e.Errors
}

func (e *LoadErrors) ValidationErrors() []*ValidationError {
	items := make([]*ValidationError, 0, len(e.Errors))
	for _, err := range e.Errors {
		var target *ValidationError
		if errors.As(err, &target) {
			items = append(items, target)
		}
	}
	return items
}

func (s *Store) AllowedTagList() []string {
	tags := make([]string, 0, len(s.allowedTags))
	for tag := range s.allowedTags {
		tags = append(tags, tag)
	}
	sort.Strings(tags)
	return tags
}

func (s *Store) List(tag string) ([]ArticleMeta, error) {
	articles, err := s.load()
	if err != nil {
		return nil, err
	}

	result := make([]ArticleMeta, 0, len(articles))
	for _, article := range articles {
		if tag != "" && !slices.Contains(article.Tags, tag) {
			continue
		}
		result = append(result, article.Meta())
	}
	return result, nil
}

func (s *Store) ListBySeries(series string) ([]ArticleMeta, error) {
	articles, err := s.load()
	if err != nil {
		return nil, err
	}

	result := make([]ArticleMeta, 0, len(articles))
	for _, article := range articles {
		if article.Series == series {
			result = append(result, article.Meta())
		}
	}
	return result, nil
}

func (s *Store) GetBySlug(slug string) (Article, error) {
	articles, err := s.load()
	if err != nil {
		return Article{}, err
	}

	for _, article := range articles {
		if article.Slug == slug {
			return article, nil
		}
	}

	return Article{}, ErrNotFound
}

func (s *Store) GetOverview() (Overview, error) {
	articles, err := s.load()
	if err != nil {
		return Overview{}, err
	}

	overview := Overview{
		Articles: make([]ArticleMeta, 0, len(articles)),
	}

	tagCounts := map[string]int{}
	seriesCounts := map[string]int{}
	dateCounts := map[string]int{}

	for idx, article := range articles {
		overview.Articles = append(overview.Articles, article.Meta())
		overview.Stats.TotalArticles += 1
		overview.Stats.TotalWords += article.WordCount

		date := article.Date.Format("2006-01-02")
		dateCounts[date] += 1

		if idx == 0 {
			overview.Stats.LatestDate = date
		}
		overview.Stats.EarliestDate = date

		for _, tag := range article.Tags {
			tagCounts[tag] += 1
		}

		if article.Series != "" {
			seriesCounts[article.Series] += 1
		}
	}

	if overview.Stats.TotalArticles > 0 {
		overview.Stats.AverageWords = overview.Stats.TotalWords / overview.Stats.TotalArticles
	}

	overview.Stats.TotalTags = len(tagCounts)
	overview.Stats.TotalSeries = len(seriesCounts)

	overview.Calendar = make([]CalendarDay, 0, len(dateCounts))
	for date, count := range dateCounts {
		overview.Calendar = append(overview.Calendar, CalendarDay{
			Date:  date,
			Count: count,
		})
	}
	sort.Slice(overview.Calendar, func(i, j int) bool {
		return overview.Calendar[i].Date < overview.Calendar[j].Date
	})

	overview.Tags = make([]TagCount, 0, len(tagCounts))
	for tag, count := range tagCounts {
		overview.Tags = append(overview.Tags, TagCount{
			Tag:   tag,
			Count: count,
		})
	}
	sort.Slice(overview.Tags, func(i, j int) bool {
		if overview.Tags[i].Count == overview.Tags[j].Count {
			return overview.Tags[i].Tag < overview.Tags[j].Tag
		}
		return overview.Tags[i].Count > overview.Tags[j].Count
	})

	overview.Series = make([]SeriesCount, 0, len(seriesCounts))
	for series, count := range seriesCounts {
		overview.Series = append(overview.Series, SeriesCount{
			Series: series,
			Count:  count,
		})
	}
	sort.Slice(overview.Series, func(i, j int) bool {
		if overview.Series[i].Count == overview.Series[j].Count {
			return overview.Series[i].Series < overview.Series[j].Series
		}
		return overview.Series[i].Count > overview.Series[j].Count
	})

	return overview, nil
}

func (s *Store) ValidateAll() error {
	_, err := s.loadWithPolicy(true)
	return err
}

func (s *Store) load() ([]Article, error) {
	return s.loadWithPolicy(s.strictValidation)
}

func (s *Store) loadWithPolicy(failOnValidationError bool) ([]Article, error) {
	entries, err := collectMarkdownFiles(s.rootDir)
	if err != nil {
		return nil, err
	}

	articles := make([]Article, 0, len(entries))
	loadErrors := make([]error, 0)
	for _, path := range entries {
		content, readErr := os.ReadFile(path)
		if readErr != nil {
			loadErrors = append(loadErrors, readErr)
			continue
		}

		parsed, parseErr := ParseArticle(path, string(content), s.allowedTags, s.enforceTagWhitelist)
		if parseErr != nil {
			loadErrors = append(loadErrors, parseErr)
			continue
		}
		if !parsed.Published {
			continue
		}

		articles = append(articles, parsed)
	}

	if len(loadErrors) > 0 && failOnValidationError {
		return nil, &LoadErrors{Errors: loadErrors}
	}

	sort.Slice(articles, func(i, j int) bool {
		if articles[i].Date.Equal(articles[j].Date) {
			return articles[i].Slug < articles[j].Slug
		}
		return articles[i].Date.After(articles[j].Date)
	})

	return articles, nil
}

func collectMarkdownFiles(root string) ([]string, error) {
	files := make([]string, 0)

	err := filepath.WalkDir(root, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		if !strings.HasSuffix(d.Name(), ".md") {
			return nil
		}

		files = append(files, path)
		return nil
	})
	if err != nil {
		return nil, err
	}

	sort.Strings(files)
	return files, nil
}

func IsValidationError(err error) bool {
	var target *ValidationError
	return errors.As(err, &target)
}

func WalkArticles(rootDir string, fn func(path string) error) error {
	return filepath.WalkDir(rootDir, func(path string, d fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if d.IsDir() || !strings.HasSuffix(d.Name(), ".md") {
			return nil
		}
		return fn(path)
	})
}

func countWords(content string) int {
	runes := []rune(content)
	total := 0

	for index := 0; index < len(runes); {
		char := runes[index]

		if isCountedCJK(char) {
			total += 1
			index += 1
			continue
		}

		if isWordRune(char) {
			total += 1
			index += 1
			for index < len(runes) && isWordRune(runes[index]) {
				index += 1
			}
			continue
		}

		index += 1
	}

	return total
}

func countCharacters(content string) int {
	total := 0
	for _, char := range content {
		if unicode.IsSpace(char) {
			continue
		}
		total += 1
	}
	return total
}

func isCountedCJK(char rune) bool {
	return unicode.In(char, unicode.Han, unicode.Hiragana, unicode.Katakana, unicode.Hangul)
}

func isWordRune(char rune) bool {
	return char == '_' ||
		(char >= '0' && char <= '9') ||
		(char >= 'a' && char <= 'z') ||
		(char >= 'A' && char <= 'Z')
}
