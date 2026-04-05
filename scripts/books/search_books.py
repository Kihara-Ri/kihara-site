#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.parse
from pathlib import Path

from douban_books import (
    BOOKS_JSON,
    DEFAULT_COVER_DIR,
    download_cover,
    fetch_book_detail,
    search_subject_ids,
)


def main() -> int:
    parser = argparse.ArgumentParser(description="Search books via Douban pages and export normalized JSON.")
    parser.add_argument("query", help="Book title or keywords")
    parser.add_argument("--limit", type=int, default=5, help="Maximum number of results to parse")
    parser.add_argument("--output", type=Path, default=BOOKS_JSON.parent / "search-results.json", help="JSON output path")
    parser.add_argument("--download-covers", action="store_true", help="Download covers into frontend/public/books-img/fetched")
    parser.add_argument("--cover-dir", type=Path, default=DEFAULT_COVER_DIR, help="Cover download directory")
    parser.add_argument("--delay", type=float, default=0.8, help="Delay between Douban detail requests")
    args = parser.parse_args()

    subject_ids = search_subject_ids(args.query, args.limit)
    if not subject_ids:
        print("No Douban search results found.", file=sys.stderr)
        return 1

    results: list[dict[str, object]] = []
    referer = f"https://m.douban.com/search/?query={urllib.parse.quote(args.query.encode('utf-8'))}&type=book"
    for subject_id in subject_ids:
        try:
            record = fetch_book_detail(subject_id, referer=referer)
            if args.download_covers and record.get("cover"):
                local_cover = download_cover(
                    str(record["cover"]),
                    str(record["title"]),
                    record.get("isbn"),
                    args.cover_dir,
                )
                if local_cover:
                    record["cover_local"] = local_cover
            results.append(record)
        except Exception as exc:
            print(f"Failed to parse subject {subject_id}: {exc}", file=sys.stderr)
        time.sleep(args.delay)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n")
    print(f"Wrote {len(results)} book records to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
