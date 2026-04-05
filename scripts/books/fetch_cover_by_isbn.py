#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

from douban_books import BOOKS_JSON, DEFAULT_COVER_DIR, download_cover, fetch_book_detail, load_books, save_books, to_openlibrary_cover, cover_exists


def main() -> int:
    parser = argparse.ArgumentParser(description="Download book covers by ISBN and write local paths back into books.json.")
    parser.add_argument("--isbn", help="Only refresh one ISBN")
    parser.add_argument("--output", default=str(BOOKS_JSON), help="books.json path")
    parser.add_argument("--cover-dir", default=str(DEFAULT_COVER_DIR), help="Cover download directory")
    args = parser.parse_args()

    output = Path(args.output)
    cover_dir = Path(args.cover_dir)
    books = load_books(output)

    updated = 0
    for book in books:
        isbn = book.get("isbn")
        if not isbn:
            continue
        if args.isbn and isbn != args.isbn:
            continue

        cover_url = ""
        openlibrary_cover = to_openlibrary_cover(isbn)
        if cover_exists(openlibrary_cover):
          cover_url = openlibrary_cover
        elif book.get("doubanSubjectId"):
          detail = fetch_book_detail(str(book["doubanSubjectId"]), referer="https://m.douban.com/")
          cover_url = str(detail.get("cover") or "")
          if detail.get("rating") and not book.get("rating"):
              book["rating"] = detail["rating"]

        if not cover_url:
            continue

        local_cover = download_cover(cover_url, str(book.get("title", isbn)), isbn, cover_dir)
        if not local_cover:
            continue

        book["cover"] = local_cover
        updated += 1

    save_books(books, output)
    print(f"Updated covers: {updated}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
