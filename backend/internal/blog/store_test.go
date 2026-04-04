package blog

import (
	"errors"
	"os"
	"path/filepath"
	"testing"
)

func writeFile(t *testing.T, path string, content string) {
	t.Helper()
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatalf("write file failed: %v", err)
	}
}

func TestStoreLenientModeSkipsInvalidArticles(t *testing.T) {
	dir := t.TempDir()

	writeFile(t, filepath.Join(dir, "valid.md"), `---
title: Valid
date: 2026-03-14
tags:
  - go
---

ok`)

	writeFile(t, filepath.Join(dir, "invalid.md"), `---
title: Invalid
date: 2026-03-14
tags:
  - unknown
---

bad`)

	store := NewStore(dir, []string{"go"}, true, false)

	items, err := store.List("")
	if err != nil {
		t.Fatalf("expected no error in lenient mode, got %v", err)
	}

	if len(items) != 1 {
		t.Fatalf("expected 1 valid article, got %d", len(items))
	}

	if items[0].Slug != "valid" {
		t.Fatalf("unexpected slug: %s", items[0].Slug)
	}
}

func TestStoreStrictModeFailsOnInvalidArticles(t *testing.T) {
	dir := t.TempDir()

	writeFile(t, filepath.Join(dir, "valid.md"), `---
title: Valid
date: 2026-03-14
tags:
  - go
---

ok`)

	writeFile(t, filepath.Join(dir, "invalid.md"), `---
title: Invalid
date: 2026-03-14
tags:
  - unknown
---

bad`)

	store := NewStore(dir, []string{"go"}, true, true)

	_, err := store.List("")
	if err == nil {
		t.Fatal("expected error in strict mode")
	}

	var loadErr *LoadErrors
	if !errors.As(err, &loadErr) {
		t.Fatalf("expected LoadErrors, got %T", err)
	}

	if len(loadErr.Errors) == 0 {
		t.Fatal("expected aggregated errors")
	}
}

func TestValidateAllAlwaysChecksAllArticles(t *testing.T) {
	dir := t.TempDir()

	writeFile(t, filepath.Join(dir, "invalid.md"), `---
title: Invalid
date: 2026-03-14
tags:
  - unknown
---

bad`)

	store := NewStore(dir, []string{"go"}, true, false)

	err := store.ValidateAll()
	if err == nil {
		t.Fatal("expected validation error even in lenient mode")
	}
}
