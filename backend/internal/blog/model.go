package blog

import "time"

type Article struct {
	Title     string
	Slug      string
	Date      time.Time
	Tags      []string
	Series    string
	Layout    string
	Summary   string
	Cover     string
	Published bool
	WordCount int
	Content   string
	Source    string
}

type ArticleMeta struct {
	Title     string   `json:"title"`
	Slug      string   `json:"slug"`
	Date      string   `json:"date"`
	Tags      []string `json:"tags"`
	Series    string   `json:"series,omitempty"`
	Layout    string   `json:"layout,omitempty"`
	Summary   string   `json:"summary,omitempty"`
	Cover     string   `json:"cover,omitempty"`
	WordCount int      `json:"wordCount"`
}

type APIArticle struct {
	Title     string   `json:"title"`
	Slug      string   `json:"slug"`
	Date      string   `json:"date"`
	Tags      []string `json:"tags"`
	Series    string   `json:"series,omitempty"`
	Layout    string   `json:"layout,omitempty"`
	Summary   string   `json:"summary,omitempty"`
	Cover     string   `json:"cover,omitempty"`
	WordCount int      `json:"wordCount"`
	Content   string   `json:"content"`
}

type CalendarDay struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

type TagCount struct {
	Tag   string `json:"tag"`
	Count int    `json:"count"`
}

type SeriesCount struct {
	Series string `json:"series"`
	Count  int    `json:"count"`
}

type OverviewStats struct {
	TotalArticles   int    `json:"totalArticles"`
	TotalWords      int    `json:"totalWords"`
	TotalCharacters int    `json:"totalCharacters"`
	TotalTags       int    `json:"totalTags"`
	TotalSeries     int    `json:"totalSeries"`
	EarliestDate    string `json:"earliestDate,omitempty"`
	LatestDate      string `json:"latestDate,omitempty"`
}

type Overview struct {
	Stats    OverviewStats `json:"stats"`
	Calendar []CalendarDay `json:"calendar"`
	Tags     []TagCount    `json:"tags"`
	Series   []SeriesCount `json:"series"`
	Articles []ArticleMeta `json:"articles"`
}

func (a Article) Meta() ArticleMeta {
	return ArticleMeta{
		Title:     a.Title,
		Slug:      a.Slug,
		Date:      a.Date.Format("2006-01-02"),
		Tags:      append([]string(nil), a.Tags...),
		Series:    a.Series,
		Layout:    a.Layout,
		Summary:   a.Summary,
		Cover:     a.Cover,
		WordCount: a.WordCount,
	}
}

func (a Article) API() APIArticle {
	return APIArticle{
		Title:     a.Title,
		Slug:      a.Slug,
		Date:      a.Date.Format("2006-01-02"),
		Tags:      append([]string(nil), a.Tags...),
		Series:    a.Series,
		Layout:    a.Layout,
		Summary:   a.Summary,
		Cover:     a.Cover,
		WordCount: a.WordCount,
		Content:   a.Content,
	}
}
