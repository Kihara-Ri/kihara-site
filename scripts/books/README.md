# Book Scripts

These scripts turn the books page into a local-resource + JSON pipeline.

## Data file

The page reads:

```text
frontend/src/content/books/books.json
```

Book covers should live in:

```text
frontend/public/books-img/
```

## Scripts

### 1. Search only

```bash
python3 scripts/books/search_books.py "日本语" --limit 3 --download-covers
```

This writes temporary search results to:

```text
frontend/src/content/books/search-results.json
```

### 2. Add or update a book entry directly

```bash
python3 scripts/books/add_book.py "美国四百年" --pick 1 --tags 历史,微观历史 --language 中文
```

Or add directly by ISBN:

```bash
python3 scripts/books/add_book.py --isbn 9787572608582 --tags 历史,文学 --language 中文
```

Or use a fixed Douban subject id:

```bash
python3 scripts/books/add_book.py --subject-id 35721558 --tags 历史,微观历史 --language 中文
```

This script:

- searches Douban pages or uses the given subject id
- fetches title / author / translator / publisher / ISBN / rating / intro
- downloads a local cover by default
- writes the final result into `books.json`

### 3. Refresh covers by ISBN

```bash
python3 scripts/books/fetch_cover_by_isbn.py
```

Or for one specific ISBN:

```bash
python3 scripts/books/fetch_cover_by_isbn.py --isbn 9787562850991
```

This script:

- prefers Open Library ISBN cover images
- falls back to the Douban detail page cover
- writes the downloaded local path back into `books.json`

## Fields the pipeline maintains

- title
- author
- translator
- publisher
- ISBN
- rating
- cover
- Douban subject id
- Douban subject URL
- intro

The script tries to use Open Library's ISBN cover endpoint first because it often provides a cleaner large cover.
If that fails, it falls back to the Douban large cover image parsed from the book detail page.
