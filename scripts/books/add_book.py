#!/usr/bin/env python3
from __future__ import annotations

import argparse
import urllib.parse
from pathlib import Path

from douban_books import (
    BOOKS_JSON,
    DEFAULT_COVER_DIR,
    download_cover,
    fetch_book_detail,
    search_subject_ids,
    upsert_book,
)


def main() -> int:
    parser = argparse.ArgumentParser(description="Add or update a book entry in books.json via Douban pages.")
    parser.add_argument("query", nargs="?", help="Book title or keywords")
    parser.add_argument("--subject-id", help="Use a fixed Douban subject id instead of searching")
    parser.add_argument("--isbn", help="Search by ISBN and pick the exact matching result when possible")
    parser.add_argument("--pick", type=int, default=1, help="Pick the Nth search result (1-based)")
    parser.add_argument("--tags", default="", help="Comma-separated tags")
    parser.add_argument("--language", default="", help="Language label")
    parser.add_argument("--judgement", default="", help="Short personal judgement")
    parser.add_argument("--review", default="", help="Personal review")
    parser.add_argument("--output", default=str(BOOKS_JSON), help="books.json output path")
    parser.add_argument("--cover-dir", default=str(DEFAULT_COVER_DIR), help="Local cover directory")
    parser.add_argument("--skip-cover-download", action="store_true", help="Do not download the cover")
    args = parser.parse_args()

    if not args.subject_id and not args.query and not args.isbn:
        parser.error("one of query, --isbn, or --subject-id is required")

    if args.subject_id:
        subject_id = args.subject_id
        referer = "https://m.douban.com/"
    else:
        search_query = args.isbn or args.query
        subject_ids = search_subject_ids(search_query, max(args.pick, 8))
        if not subject_ids:
            raise SystemExit("No search results found.")

        referer = f"https://m.douban.com/search/?query={urllib.parse.quote(search_query.encode('utf-8'))}&type=book"
        if args.isbn:
            subject_id = ""
            for candidate in subject_ids:
                detail = fetch_book_detail(candidate, referer=referer)
                if detail.get("isbn") == args.isbn:
                    subject_id = candidate
                    break
            if not subject_id:
                raise SystemExit(f"No exact ISBN match found for {args.isbn}")
        else:
            if len(subject_ids) < args.pick:
                raise SystemExit(f"Only found {len(subject_ids)} results, cannot pick #{args.pick}")
            subject_id = subject_ids[args.pick - 1]

    record = fetch_book_detail(subject_id, referer=referer)
    if not args.skip_cover_download and record.get("cover"):
        local_cover = download_cover(
            str(record["cover"]),
            str(record["title"]),
            record.get("isbn"),
            Path(args.cover_dir),
        )
        if local_cover:
            record["cover"] = local_cover

    record.update({
        "tags": [item.strip() for item in args.tags.split(",") if item.strip()],
        "language": args.language,
        "judgement": args.judgement,
        "review": args.review,
    })

    upsert_book(record, output=Path(args.output))
    print(f"Added/updated: {record['title']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
