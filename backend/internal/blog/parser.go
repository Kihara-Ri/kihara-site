package blog

import (
	"errors"
	"fmt"
	"path/filepath"
	"strings"
	"time"

	"gopkg.in/yaml.v3"
)

var allowedMetaFields = map[string]struct{}{
	"title":   {},
	"slug":    {},
	"date":    {},
	"tags":    {},
	"series":  {},
	"summary": {},
	"cover":   {},
}

type ValidationError struct {
	File    string `json:"file"`
	Line    int    `json:"line"`
	Column  int    `json:"column"`
	Field   string `json:"field,omitempty"`
	Message string `json:"message"`
}

func (e *ValidationError) Error() string {
	location := fmt.Sprintf("%s:%d:%d", e.File, e.Line, e.Column)
	if e.Field == "" {
		return fmt.Sprintf("%s: %s", location, e.Message)
	}
	return fmt.Sprintf("%s: field %q %s", location, e.Field, e.Message)
}

func ParseArticle(path string, raw string, allowedTags map[string]struct{}, enforceTagWhitelist bool) (Article, error) {
	frontMatter, body, frontMatterStartLine, err := splitFrontMatter(raw)
	if err != nil {
		return Article{}, &ValidationError{
			File:    path,
			Line:    1,
			Column:  1,
			Message: err.Error(),
		}
	}

	meta, err := parseMetadata(path, frontMatter, frontMatterStartLine, allowedTags, enforceTagWhitelist)
	if err != nil {
		return Article{}, err
	}

	if meta.Slug == "" {
		meta.Slug = normalizeSlug(strings.TrimSuffix(filepath.Base(path), filepath.Ext(path)))
	}

	if len(meta.Tags) == 0 {
		return Article{}, &ValidationError{
			File:    path,
			Line:    frontMatterStartLine,
			Column:  1,
			Field:   "tags",
			Message: "must contain at least one tag",
		}
	}

	article := Article{
		Title:   meta.Title,
		Slug:    meta.Slug,
		Date:    meta.Date,
		Tags:    meta.Tags,
		Series:  meta.Series,
		Summary: meta.Summary,
		Cover:   meta.Cover,
		Content: strings.TrimLeft(body, "\n"),
		Source:  path,
	}
	article.WordCount = countWords(article.Content)

	return article, nil
}

type frontMatterMeta struct {
	Title   string
	Slug    string
	Date    time.Time
	Tags    []string
	Series  string
	Summary string
	Cover   string
}

func parseMetadata(
	path string,
	frontMatter string,
	lineOffset int,
	allowedTags map[string]struct{},
	enforceTagWhitelist bool,
) (frontMatterMeta, error) {
	var document yaml.Node
	if err := yaml.Unmarshal([]byte(frontMatter), &document); err != nil {
		return frontMatterMeta{}, &ValidationError{
			File:    path,
			Line:    lineOffset,
			Column:  1,
			Message: "invalid yaml frontmatter",
		}
	}

	if len(document.Content) == 0 || document.Content[0].Kind != yaml.MappingNode {
		return frontMatterMeta{}, &ValidationError{
			File:    path,
			Line:    lineOffset,
			Column:  1,
			Message: "frontmatter must be a yaml mapping",
		}
	}

	mapping := document.Content[0]
	meta := frontMatterMeta{}

	for idx := 0; idx < len(mapping.Content); idx += 2 {
		keyNode := mapping.Content[idx]
		valueNode := mapping.Content[idx+1]
		key := strings.TrimSpace(keyNode.Value)

		if _, ok := allowedMetaFields[key]; !ok {
			return frontMatterMeta{}, &ValidationError{
				File:    path,
				Line:    lineOffset + keyNode.Line - 1,
				Column:  keyNode.Column,
				Field:   key,
				Message: "is not allowed",
			}
		}

		switch key {
		case "title":
			meta.Title = strings.TrimSpace(valueNode.Value)
			if meta.Title == "" {
				return frontMatterMeta{}, &ValidationError{
					File:    path,
					Line:    lineOffset + valueNode.Line - 1,
					Column:  valueNode.Column,
					Field:   "title",
					Message: "cannot be empty",
				}
			}
		case "slug":
			meta.Slug = normalizeSlug(valueNode.Value)
		case "date":
			parsedDate, parseErr := time.Parse("2006-01-02", strings.TrimSpace(valueNode.Value))
			if parseErr != nil {
				return frontMatterMeta{}, &ValidationError{
					File:    path,
					Line:    lineOffset + valueNode.Line - 1,
					Column:  valueNode.Column,
					Field:   "date",
					Message: "must match YYYY-MM-DD",
				}
			}
			meta.Date = parsedDate
		case "tags":
			if valueNode.Kind != yaml.SequenceNode {
				return frontMatterMeta{}, &ValidationError{
					File:    path,
					Line:    lineOffset + valueNode.Line - 1,
					Column:  valueNode.Column,
					Field:   "tags",
					Message: "must be a sequence",
				}
			}

			for _, item := range valueNode.Content {
				tagValue := strings.TrimSpace(item.Value)
				if enforceTagWhitelist {
					if _, ok := allowedTags[tagValue]; !ok {
						return frontMatterMeta{}, &ValidationError{
							File:    path,
							Line:    lineOffset + item.Line - 1,
							Column:  item.Column,
							Field:   "tags",
							Message: fmt.Sprintf("contains unsupported tag %q", tagValue),
						}
					}
				}

				if tagValue == "" {
					return frontMatterMeta{}, &ValidationError{
						File:    path,
						Line:    lineOffset + item.Line - 1,
						Column:  item.Column,
						Field:   "tags",
						Message: "contains empty tag",
					}
				}
				meta.Tags = append(meta.Tags, tagValue)
			}
		case "series":
			meta.Series = strings.TrimSpace(valueNode.Value)
		case "summary":
			meta.Summary = strings.TrimSpace(valueNode.Value)
		case "cover":
			meta.Cover = strings.TrimSpace(valueNode.Value)
		}
	}

	if meta.Title == "" {
		return frontMatterMeta{}, &ValidationError{
			File:    path,
			Line:    lineOffset,
			Column:  1,
			Field:   "title",
			Message: "is required",
		}
	}

	if meta.Date.IsZero() {
		return frontMatterMeta{}, &ValidationError{
			File:    path,
			Line:    lineOffset,
			Column:  1,
			Field:   "date",
			Message: "is required",
		}
	}

	return meta, nil
}

func splitFrontMatter(content string) (frontMatter string, body string, frontMatterStartLine int, err error) {
	trimmed := strings.ReplaceAll(content, "\r\n", "\n")
	lines := strings.Split(trimmed, "\n")

	if len(lines) < 3 || strings.TrimSpace(lines[0]) != "---" {
		return "", "", 0, errors.New("missing opening frontmatter delimiter ---")
	}

	end := -1
	for idx := 1; idx < len(lines); idx++ {
		if strings.TrimSpace(lines[idx]) == "---" {
			end = idx
			break
		}
	}

	if end == -1 {
		return "", "", 0, errors.New("missing closing frontmatter delimiter ---")
	}

	frontMatter = strings.Join(lines[1:end], "\n")
	body = strings.Join(lines[end+1:], "\n")

	return frontMatter, body, 2, nil
}

func normalizeSlug(input string) string {
	lower := strings.ToLower(strings.TrimSpace(input))
	if lower == "" {
		return ""
	}

	builder := strings.Builder{}
	lastWasDash := false
	for _, char := range lower {
		switch {
		case char >= 'a' && char <= 'z':
			builder.WriteRune(char)
			lastWasDash = false
		case char >= '0' && char <= '9':
			builder.WriteRune(char)
			lastWasDash = false
		case char == '-' || char == '_' || char == ' ':
			if !lastWasDash {
				builder.WriteByte('-')
				lastWasDash = true
			}
		}
	}

	slug := strings.Trim(builder.String(), "-")
	if slug == "" {
		return "article"
	}
	return slug
}
