#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import random
import re
import sys
import time
import urllib.parse
import urllib.request
from dataclasses import dataclass
from html import unescape
from pathlib import Path
from typing import Any

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
BOOKS_JSON = REPO_ROOT / "frontend" / "src" / "content" / "books" / "books.json"
DEFAULT_COVER_DIR = REPO_ROOT / "frontend" / "public" / "books-img" / "fetched"
DEFAULT_SEARCH_RESULTS = BOOKS_JSON.parent / "search-results.json"


class BookScriptError(RuntimeError):
    pass


@dataclass(slots=True)
class RequestConfig:
    timeout: int = 20
    retries: int = 3
    retry_delay: float = 1.5


DEFAULT_REQUEST_CONFIG = RequestConfig()


def debug(message: str) -> None:
    print(f"[DEBUG] {message}")


def default_headers(*, referer: str | None = None, accept: str | None = None) -> dict[str, str]:
    headers = {
        "User-Agent": USER_AGENT,
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
    }
    if accept:
        headers["Accept"] = accept
    if referer:
        headers["Referer"] = referer
    return headers


def image_headers(*, referer: str) -> dict[str, str]:
    return {
        **default_headers(
            referer=referer,
            accept="image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        ),
        "Sec-Fetch-Dest": "image",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
    }


def request_url(
    url: str,
    *,
    method: str = "GET",
    headers: dict[str, str] | None = None,
    config: RequestConfig = DEFAULT_REQUEST_CONFIG,
):
    merged_headers = {**default_headers(), **(headers or {})}
    debug(f"{method} {url}")
    if "Referer" in merged_headers:
        debug(f"  Referer: {merged_headers['Referer']}")
    if "Accept" in merged_headers:
        debug(f"  Accept: {merged_headers['Accept']}")
    request = urllib.request.Request(url, headers=merged_headers, method=method)

    last_error: Exception | None = None
    for attempt in range(1, config.retries + 1):
        try:
            debug(f"  Attempt {attempt}/{config.retries}")
            response = urllib.request.urlopen(request, timeout=config.timeout)
            debug(f"  Response status: {getattr(response, 'status', 'unknown')}")
            return response
        except urllib.error.HTTPError as exc:
            last_error = exc
            debug(f"  HTTPError {exc.code}: {exc.reason}")
            if attempt >= config.retries:
                break
            sleep_s = config.retry_delay * attempt + random.uniform(0.2, 0.8)
            debug(f"  Retry after {sleep_s:.1f}s")
            time.sleep(sleep_s)
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            debug(f"  Error: {type(exc).__name__}: {exc}")
            if attempt >= config.retries:
                break
            sleep_s = config.retry_delay * attempt + random.uniform(0.2, 0.8)
            debug(f"  Retry after {sleep_s:.1f}s")
            time.sleep(sleep_s)

    raise BookScriptError(f"Request failed: {url} ({last_error})")


def fetch_text(url: str, *, headers: dict[str, str] | None = None, config: RequestConfig = DEFAULT_REQUEST_CONFIG) -> str:
    with request_url(url, headers=headers, config=config) as response:
        content = response.read().decode("utf-8", "ignore")
        debug(f"  Read text bytes: {len(content.encode('utf-8', 'ignore'))}")
        return content


def fetch_bytes(url: str, *, headers: dict[str, str] | None = None, config: RequestConfig = DEFAULT_REQUEST_CONFIG) -> bytes:
    with request_url(url, headers=headers, config=config) as response:
        content = response.read()
        debug(f"  Read binary bytes: {len(content)}")
        return content


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(value)).strip()


def strip_tags(value: str) -> str:
    value = re.sub(r"<br\s*/?>", "\n", value, flags=re.I)
    value = re.sub(r"<[^>]+>", "", value)
    return normalize_space(value)


def normalize_isbn(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"[^0-9Xx]", "", value).upper()


def quote_query(query: str) -> str:
    return urllib.parse.quote(query.encode("utf-8"))


def build_search_referer(query: str) -> str:
    return f"https://m.douban.com/search/?query={quote_query(query)}&type=book"


def build_subject_mobile_url(subject_id: str) -> str:
    return f"https://m.douban.com/book/subject/{subject_id}/"


def build_subject_desktop_url(subject_id: str) -> str:
    return f"https://book.douban.com/subject/{subject_id}/"


def search_subject_ids(query: str, limit: int = 5) -> list[str]:
    if not query.strip():
        return []
    search_url = build_search_referer(query)
    debug(f"Search query: {query}")
    html = fetch_text(
        search_url,
        headers=default_headers(
            referer="https://m.douban.com/",
            accept="text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        ),
    )
    subject_ids = re.findall(r"subject/(\d+)", html)
    ordered: list[str] = []
    seen: set[str] = set()
    for subject_id in subject_ids:
        if subject_id in seen:
            continue
        seen.add(subject_id)
        ordered.append(subject_id)
        if len(ordered) >= limit:
            break
    debug(f"Search results subject IDs: {ordered}")
    return ordered


def parse_info_block(html: str) -> dict[str, str]:
    match = re.search(r'<div id="info"[^>]*>(.*?)</div>', html, re.S)
    if not match:
        debug("parse_info_block: #info block not found")
        return {}

    raw = match.group(1)
    lines = [
        strip_tags(part)
        for part in re.split(r"<span class=\"pl\">", raw)
        if strip_tags(part)
    ]

    fields: dict[str, str] = {}
    for line in lines:
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        fields[normalize_space(key)] = normalize_space(value)
    debug(f"parse_info_block fields: {fields}")
    return fields


def parse_intro(html: str) -> str:
    intro_patterns = [
        r'<div class="intro">\s*<p>(.*?)</p>',
        r'<div class="related_info".*?<span class="all hidden">(.*?)</span>',
        r'<div class="indent" id="link-report".*?<div class="intro">(.*?)</div>',
    ]
    for pattern in intro_patterns:
        match = re.search(pattern, html, re.S)
        if match:
            intro = strip_tags(match.group(1))
            debug(f"Parsed intro length: {len(intro)}")
            return intro
    debug("Intro not found")
    return ""


def parse_title(html: str, subject_id: str) -> str:
    patterns = [
        r'<span property="v:itemreviewed">(.*?)</span>',
        r"<title>(.*?)</title>",
    ]
    for pattern in patterns:
        match = re.search(pattern, html, re.S)
        if match:
            title = normalize_space(strip_tags(match.group(1)))
            title = re.sub(r"\(豆瓣\)", "", title).strip()
            if title:
                debug(f"Parsed title: {title}")
                return title
    debug(f"Title not found, fallback to subject/{subject_id}")
    return f"subject/{subject_id}"


def parse_rating(html: str) -> str:
    patterns = [
        r'property="v:average">([^<]+)<',
        r'<strong class="ll rating_num " property="v:average">(.*?)</strong>',
    ]
    for pattern in patterns:
        match = re.search(pattern, html, re.S)
        if match:
            rating = normalize_space(match.group(1))
            if rating:
                debug(f"Parsed rating: {rating}")
                return rating
    debug("Rating not found")
    return ""


def parse_cover_from_html(html: str) -> str:
    patterns = [
        r'https://img\d+\.doubanio\.com/view/subject/l/public/[^"\']+\.jpg',
        r'https://img\d+\.doubanio\.com/view/subject/m/public/[^"\']+\.jpg',
        r'https://img\d+\.doubanio\.com/view/subject/s/public/[^"\']+\.jpg',
    ]
    for pattern in patterns:
        match = re.search(pattern, html, re.S)
        if match:
            cover_url = match.group(0)
            debug(f"Parsed cover URL: {cover_url}")
            return cover_url
    debug("Cover URL not found in html")
    return ""


def fetch_book_detail(subject_id: str, *, referer: str) -> dict[str, Any]:
    mobile_url = build_subject_mobile_url(subject_id)
    desktop_url = build_subject_desktop_url(subject_id)
    last_error: Exception | None = None

    for detail_url in (mobile_url, desktop_url):
        try:
            debug(f"Fetching detail page for subject {subject_id}: {detail_url}")
            html = fetch_text(
                detail_url,
                headers=default_headers(
                    referer=referer,
                    accept="text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                ),
            )
            info = parse_info_block(html)
            isbn = normalize_isbn(info.get("ISBN", ""))
            record = {
                "title": parse_title(html, subject_id),
                "author": info.get("作者", ""),
                "translator": info.get("译者") or None,
                "publisher": info.get("出版社", ""),
                "isbn": isbn or None,
                "rating": parse_rating(html) or None,
                "cover": parse_cover_from_html(html),
                "doubanSubjectId": subject_id,
                "link": desktop_url,
                "intro": parse_intro(html),
                "_coverReferer": detail_url,
            }
            debug(f"Fetched book detail summary: title={record['title']}, isbn={record['isbn']}, cover={record['cover']}")
            return record
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            debug(f"Detail fetch failed on {detail_url}: {type(exc).__name__}: {exc}")

    raise BookScriptError(f"Failed to fetch detail for subject {subject_id}: {last_error}")


def find_subject_by_isbn(isbn: str, limit: int = 8) -> str:
    normalized = normalize_isbn(isbn)
    if not normalized:
        raise BookScriptError("Invalid ISBN")

    debug(f"Finding subject by ISBN: {normalized}")
    subject_ids = search_subject_ids(normalized, limit=limit)
    if not subject_ids:
        raise BookScriptError(f"No search results found for ISBN {normalized}")

    referer = build_search_referer(normalized)
    for subject_id in subject_ids:
        debug(f"Checking candidate subject {subject_id} for ISBN match")
        detail = fetch_book_detail(subject_id, referer=referer)
        if normalize_isbn(detail.get("isbn")) == normalized:
            debug(f"Matched ISBN {normalized} with subject {subject_id}")
            return subject_id

    raise BookScriptError(f"No exact ISBN match found for {normalized}")


def slugify(value: str) -> str:
    value = normalize_space(value).lower()
    value = re.sub(r"[^a-z0-9\u4e00-\u9fff]+", "-", value)
    return value.strip("-") or f"book-{int(time.time())}"


def download_cover(url: str, title: str, isbn: str | None, cover_dir: Path = DEFAULT_COVER_DIR, *, referer: str) -> str | None:
    if not url:
        debug("download_cover skipped: empty url")
        return None

    suffix = Path(urllib.parse.urlparse(url).path).suffix or ".jpg"
    filename = f"{slugify(title)}-{isbn or 'cover'}{suffix}"
    output = cover_dir / filename
    output.parent.mkdir(parents=True, exist_ok=True)

    debug(f"Downloading Douban cover to: {output}")
    debug(f"Cover source: {url}")
    content = fetch_bytes(
        url,
        headers=image_headers(referer=referer),
        config=RequestConfig(timeout=20, retries=4, retry_delay=2.0),
    )
    output.write_bytes(content)
    local_path = "/" + str(output.relative_to(REPO_ROOT / "frontend" / "public")).replace("\\", "/")
    debug(f"Cover saved: {local_path}")
    return local_path


def parse_tags_arg(raw: str) -> list[str]:
    return [item.strip() for item in raw.split(",") if item.strip()]


def load_books(output: Path = BOOKS_JSON) -> list[dict[str, Any]]:
    if not output.exists():
        debug(f"Books file not found, returning empty list: {output}")
        return []
    books = json.loads(output.read_text(encoding="utf-8"))
    debug(f"Loaded books count: {len(books)}")
    return books


def save_books(records: list[dict[str, Any]], output: Path = BOOKS_JSON) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    debug(f"Saved books count: {len(records)} -> {output}")


def upsert_book(record: dict[str, Any], *, output: Path = BOOKS_JSON) -> dict[str, Any]:
    books = load_books(output)
    match_index = next(
        (
            index
            for index, item in enumerate(books)
            if (
                record.get("isbn") and item.get("isbn") == record.get("isbn")
            ) or (
                record.get("doubanSubjectId") and item.get("doubanSubjectId") == record.get("doubanSubjectId")
            ) or item.get("title") == record.get("title")
        ),
        None,
    )
    if match_index is None:
        debug(f"Appending new book: {record.get('title')}")
        books.append(record)
    else:
        debug(f"Updating existing book at index {match_index}: {record.get('title')}")
        books[match_index] = {**books[match_index], **record}
    save_books(books, output)
    return record


def delete_books(*, output: Path, isbn: str | None = None, subject_id: str | None = None, title: str | None = None) -> int:
    books = load_books(output)
    target_isbn = normalize_isbn(isbn)
    kept: list[dict[str, Any]] = []
    deleted = 0

    for item in books:
        matched = False
        if target_isbn and normalize_isbn(item.get("isbn")) == target_isbn:
            matched = True
        if subject_id and str(item.get("doubanSubjectId")) == subject_id:
            matched = True
        if title and item.get("title") == title:
            matched = True

        if matched:
            debug(f"Deleting book: title={item.get('title')} isbn={item.get('isbn')} subject={item.get('doubanSubjectId')}")
            deleted += 1
        else:
            kept.append(item)

    save_books(kept, output)
    return deleted


def enrich_book_record(record: dict[str, Any], args: argparse.Namespace) -> dict[str, Any]:
    record.update(
        {
            "tags": parse_tags_arg(args.tags),
            "language": args.language,
            "judgement": args.judgement,
            "review": args.review,
        }
    )
    record.pop("_coverReferer", None)
    return record


def resolve_subject_id(args: argparse.Namespace) -> tuple[str, str]:
    if args.subject_id:
        debug(f"Using explicit subject id: {args.subject_id}")
        return args.subject_id, "https://m.douban.com/"

    if args.isbn:
        subject_id = find_subject_by_isbn(args.isbn)
        referer = build_search_referer(normalize_isbn(args.isbn))
        return subject_id, referer

    if args.query:
        subject_ids = search_subject_ids(args.query, limit=max(args.pick, 8))
        if not subject_ids:
            raise BookScriptError("No search results found.")
        if len(subject_ids) < args.pick:
            raise BookScriptError(f"Only found {len(subject_ids)} results, cannot pick #{args.pick}")
        subject_id = subject_ids[args.pick - 1]
        referer = build_search_referer(args.query)
        debug(f"Selected subject id #{args.pick}: {subject_id}")
        return subject_id, referer

    raise BookScriptError("one of query, --isbn, or --subject-id is required")


def cmd_search(args: argparse.Namespace) -> int:
    if not args.query and not args.isbn:
        raise BookScriptError("search requires query or --isbn")

    query = normalize_isbn(args.isbn) if args.isbn else args.query
    debug(f"cmd_search start, query={query}")
    subject_ids = search_subject_ids(query, args.limit)
    if not subject_ids:
        print("No Douban search results found.", file=sys.stderr)
        return 1

    results: list[dict[str, Any]] = []
    referer = build_search_referer(query)
    for index, subject_id in enumerate(subject_ids, start=1):
        debug(f"[search] Processing {index}/{len(subject_ids)} subject {subject_id}")
        try:
            record = fetch_book_detail(subject_id, referer=referer)
            if args.download_covers and record.get("cover"):
                local_cover = download_cover(
                    str(record["cover"]),
                    str(record["title"]),
                    record.get("isbn"),
                    args.cover_dir,
                    referer=str(record.get("_coverReferer") or record.get("link") or referer),
                )
                if local_cover:
                    record["cover_local"] = local_cover
            record.pop("_coverReferer", None)
            results.append(record)
        except Exception as exc:  # noqa: BLE001
            debug(f"[search] Failed subject {subject_id}: {type(exc).__name__}: {exc}")

        if index < len(subject_ids):
            delay = args.delay + random.uniform(0.5, 1.2)
            debug(f"[search] Sleep {delay:.1f}s before next request")
            time.sleep(delay)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(results)} book records to {args.output}")
    return 0


def cmd_add(args: argparse.Namespace) -> int:
    subject_id, referer = resolve_subject_id(args)
    debug(f"cmd_add subject_id={subject_id}")
    record = fetch_book_detail(subject_id, referer=referer)

    if not args.skip_cover_download and record.get("cover"):
        local_cover = download_cover(
            str(record["cover"]),
            str(record["title"]),
            record.get("isbn"),
            Path(args.cover_dir),
            referer=str(record.get("_coverReferer") or record.get("link") or referer),
        )
        if local_cover:
            record["cover"] = local_cover

    record = enrich_book_record(record, args)
    upsert_book(record, output=Path(args.output))
    print(f"Added/updated: {record['title']}")
    return 0


def cmd_refresh_covers(args: argparse.Namespace) -> int:
    output = Path(args.output)
    cover_dir = Path(args.cover_dir)
    books = load_books(output)

    updated = 0
    for index, book in enumerate(books, start=1):
        isbn = normalize_isbn(book.get("isbn"))
        subject_id = str(book.get("doubanSubjectId") or "")
        title = str(book.get("title") or "")
        debug(f"[refresh-covers] Processing {index}/{len(books)} title={title} isbn={isbn} subject={subject_id}")

        if args.isbn and isbn != normalize_isbn(args.isbn):
            debug("  Skipped by --isbn filter")
            continue
        if not subject_id:
            debug("  Skipped: no doubanSubjectId")
            continue

        referer = build_subject_mobile_url(subject_id)
        try:
            detail = fetch_book_detail(subject_id, referer=referer)
            cover_url = str(detail.get("cover") or "")
            if not cover_url:
                debug("  No cover URL found on Douban page")
                continue

            local_cover = download_cover(
                cover_url,
                str(detail.get("title") or title or subject_id),
                detail.get("isbn") or isbn,
                cover_dir,
                referer=str(detail.get("_coverReferer") or referer),
            )
            if not local_cover:
                debug("  Download returned no local path")
                continue

            book["cover"] = local_cover
            if detail.get("rating") and not book.get("rating"):
                book["rating"] = detail["rating"]
            updated += 1
        except Exception as exc:  # noqa: BLE001
            debug(f"  Refresh failed: {type(exc).__name__}: {exc}")

        if index < len(books):
            delay = random.uniform(1.5, 3.0)
            debug(f"[refresh-covers] Sleep {delay:.1f}s before next request")
            time.sleep(delay)

    save_books(books, output)
    print(f"Updated covers: {updated}")
    return 0


def cmd_delete(args: argparse.Namespace) -> int:
    if not args.isbn and not args.subject_id and not args.title:
        raise BookScriptError("delete requires --isbn, --subject-id, or --title")

    deleted = delete_books(
        output=Path(args.output),
        isbn=args.isbn,
        subject_id=args.subject_id,
        title=args.title,
    )
    print(f"Deleted books: {deleted}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Douban-only book tool: search, add, refresh covers, and delete.",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    search_parser = subparsers.add_parser("search", help="Search books via Douban pages and export normalized JSON")
    search_parser.add_argument("query", nargs="?", help="Book title or keywords")
    search_parser.add_argument("--isbn", help="Search by ISBN")
    search_parser.add_argument("--limit", type=int, default=5, help="Maximum number of results to parse")
    search_parser.add_argument("--output", type=Path, default=DEFAULT_SEARCH_RESULTS, help="JSON output path")
    search_parser.add_argument("--download-covers", action="store_true", help="Download covers into frontend/public/books-img/fetched")
    search_parser.add_argument("--cover-dir", type=Path, default=DEFAULT_COVER_DIR, help="Cover download directory")
    search_parser.add_argument("--delay", type=float, default=1.0, help="Base delay between detail requests")
    search_parser.set_defaults(func=cmd_search)

    add_parser = subparsers.add_parser("add", help="Add or update a book entry in books.json")
    add_parser.add_argument("query", nargs="?", help="Book title or keywords")
    add_parser.add_argument("--subject-id", help="Use a fixed Douban subject id instead of searching")
    add_parser.add_argument("--isbn", help="Add directly by ISBN")
    add_parser.add_argument("--pick", type=int, default=1, help="Pick the Nth search result (1-based)")
    add_parser.add_argument("--tags", default="", help="Comma-separated tags")
    add_parser.add_argument("--language", default="", help="Language label")
    add_parser.add_argument("--judgement", default="", help="Short personal judgement")
    add_parser.add_argument("--review", default="", help="Personal review")
    add_parser.add_argument("--output", default=str(BOOKS_JSON), help="books.json output path")
    add_parser.add_argument("--cover-dir", default=str(DEFAULT_COVER_DIR), help="Local cover directory")
    add_parser.add_argument("--skip-cover-download", action="store_true", help="Do not download the cover")
    add_parser.set_defaults(func=cmd_add)

    refresh_parser = subparsers.add_parser("refresh-covers", help="Download book covers from Douban and write local paths back into books.json")
    refresh_parser.add_argument("--isbn", help="Only refresh one ISBN")
    refresh_parser.add_argument("--output", default=str(BOOKS_JSON), help="books.json path")
    refresh_parser.add_argument("--cover-dir", default=str(DEFAULT_COVER_DIR), help="Cover download directory")
    refresh_parser.set_defaults(func=cmd_refresh_covers)

    delete_parser = subparsers.add_parser("delete", help="Delete one or more books from books.json")
    delete_parser.add_argument("--isbn", help="Delete by ISBN")
    delete_parser.add_argument("--subject-id", help="Delete by Douban subject id")
    delete_parser.add_argument("--title", help="Delete by exact title")
    delete_parser.add_argument("--output", default=str(BOOKS_JSON), help="books.json path")
    delete_parser.set_defaults(func=cmd_delete)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        return args.func(args)
    except BookScriptError as exc:
        print(str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
