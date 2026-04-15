package blog

import "testing"

func TestParseArticleRejectsUnsupportedTag(t *testing.T) {
	allowed := map[string]struct{}{
		"go": {},
	}

	raw := `---
title: Demo
date: 2026-03-14
tags:
  - go
  - unknown
cover: /covers/demo.png
---

 body`

	_, err := ParseArticle("/tmp/demo.md", raw, allowed, true)
	if err == nil {
		t.Fatal("expected validation error")
	}

	validationErr, ok := err.(*ValidationError)
	if !ok {
		t.Fatalf("expected ValidationError, got %T", err)
	}

	if validationErr.Field != "tags" {
		t.Fatalf("expected field tags, got %s", validationErr.Field)
	}

	if validationErr.Line <= 0 {
		t.Fatalf("expected positive line, got %d", validationErr.Line)
	}
}

func TestParseArticleSuccess(t *testing.T) {
	allowed := map[string]struct{}{
		"go":       {},
		"markdown": {},
	}

	raw := `---
title: Demo
date: 2026-03-14
tags:
  - go
  - markdown
cover: /covers/demo.png
layout: lyric-analysis
published: true
---

## title
content`

	article, err := ParseArticle("/tmp/demo-file.md", raw, allowed, true)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if article.Slug != "demo-file" {
		t.Fatalf("unexpected slug: %s", article.Slug)
	}

	if article.Title != "Demo" {
		t.Fatalf("unexpected title: %s", article.Title)
	}

	if len(article.Tags) != 2 {
		t.Fatalf("unexpected tag count: %d", len(article.Tags))
	}

	if article.Cover != "/covers/demo.png" {
		t.Fatalf("unexpected cover: %s", article.Cover)
	}

	if article.Layout != "lyric-analysis" {
		t.Fatalf("unexpected layout: %s", article.Layout)
	}

	if !article.Published {
		t.Fatal("expected article to be published")
	}

	if article.WordCount <= 0 {
		t.Fatalf("expected positive word count, got %d", article.WordCount)
	}
}

func TestParseArticleAllowsAnyTagWhenWhitelistDisabled(t *testing.T) {
	allowed := map[string]struct{}{
		"go": {},
	}

	raw := `---
title: Demo
date: 2026-03-14
tags:
  - go
  - unknown
---

content`

	article, err := ParseArticle("/tmp/demo.md", raw, allowed, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(article.Tags) != 2 {
		t.Fatalf("unexpected tag count: %d", len(article.Tags))
	}

	if article.Published {
		t.Fatal("expected published to default to false")
	}
}

func TestParseArticleRejectsNonBooleanPublished(t *testing.T) {
	allowed := map[string]struct{}{
		"go": {},
	}

	raw := `---
title: Demo
date: 2026-03-14
tags:
  - go
published: yes
---

content`

	_, err := ParseArticle("/tmp/demo.md", raw, allowed, false)
	if err == nil {
		t.Fatal("expected validation error")
	}

	validationErr, ok := err.(*ValidationError)
	if !ok {
		t.Fatalf("expected ValidationError, got %T", err)
	}

	if validationErr.Field != "published" {
		t.Fatalf("expected field published, got %s", validationErr.Field)
	}
}
