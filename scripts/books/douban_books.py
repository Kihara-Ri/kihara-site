from __future__ import annotations

import json
import re
import time
import urllib.parse
import urllib.request
from html import unescape
from pathlib import Path
from typing import Any

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
BOOKS_JSON = REPO_ROOT / "frontend" / "src" / "content" / "books" / "books.json"
DEFAULT_COVER_DIR = REPO_ROOT / "frontend" / "public" / "books-img" / "fetched"


def default_headers(*, referer: str | None = None) -> dict[str, str]:
    headers = {
        "User-Agent": USER_AGENT,
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
    }
    if referer:
        headers["Referer"] = referer
    return headers


def fetch_text(url: str, *, headers: dict[str, str] | None = None) -> str:
    request = urllib.request.Request(url, headers={**default_headers(), **(headers or {})})
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read().decode("utf-8", "ignore")


def fetch_bytes(url: str, *, headers: dict[str, str] | None = None) -> bytes:
    request = urllib.request.Request(url, headers={**default_headers(), **(headers or {})})
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read()


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(value)).strip()


def strip_tags(value: str) -> str:
    value = re.sub(r"<br\s*/?>", "\n", value, flags=re.I)
    value = re.sub(r"<[^>]+>", "", value)
    return normalize_space(value)


def search_subject_ids(query: str, limit: int) -> list[str]:
    encoded = urllib.parse.quote(query.encode("utf-8"))
    html = fetch_text(
        f"https://m.douban.com/search/?query={encoded}&type=book",
        headers=default_headers(referer="https://m.douban.com/"),
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
    return ordered


def parse_info_block(html: str) -> dict[str, str]:
    match = re.search(r'<div id="info"[^>]*>(.*?)</div>', html, re.S)
    if not match:
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
    return fields


def to_openlibrary_cover(isbn: str) -> str:
    return f"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg?default=false"


def cover_exists(url: str) -> bool:
    request = urllib.request.Request(url, headers=default_headers(), method="HEAD")
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            return 200 <= response.status < 300
    except Exception:
        return False


def fetch_book_detail(subject_id: str, *, referer: str) -> dict[str, Any]:
    try:
        html = fetch_text(
            f"https://book.douban.com/subject/{subject_id}/",
            headers=default_headers(referer=referer),
        )
    except Exception:
        html = fetch_text(
            f"https://m.douban.com/book/subject/{subject_id}/",
            headers=default_headers(referer=referer),
        )

    title_match = re.search(r'<span property="v:itemreviewed">(.*?)</span>', html, re.S)
    title = normalize_space(strip_tags(title_match.group(1))) if title_match else f"subject/{subject_id}"

    info = parse_info_block(html)
    author = info.get("作者", "")
    translator = info.get("译者", "")
    publisher = info.get("出版社", "")
    isbn = info.get("ISBN", "")
    rating_match = re.search(r'property="v:average">([^<]+)<', html)
    rating = normalize_space(rating_match.group(1)) if rating_match else ""

    intro_match = re.search(r'<div class="intro">\s*<p>(.*?)</p>', html, re.S)
    intro = strip_tags(intro_match.group(1)) if intro_match else ""

    cover_match = re.search(r'https://img\d+\.doubanio\.com/view/subject/l/public/[^\"]+\.jpg', html)
    douban_cover = cover_match.group(0) if cover_match else ""
    openlibrary_cover = to_openlibrary_cover(isbn) if isbn else ""
    cover = openlibrary_cover if openlibrary_cover and cover_exists(openlibrary_cover) else douban_cover

    return {
        "title": title,
        "author": author,
        "translator": translator or None,
        "publisher": publisher,
        "isbn": isbn or None,
        "rating": rating or None,
        "cover": cover or "",
        "doubanSubjectId": subject_id,
        "link": f"https://book.douban.com/subject/{subject_id}/",
        "intro": intro,
    }


def slugify(value: str) -> str:
    value = normalize_space(value).lower()
    value = re.sub(r"[^a-z0-9\u4e00-\u9fff]+", "-", value)
    return value.strip("-") or f"book-{int(time.time())}"


def download_cover(url: str, title: str, isbn: str | None, cover_dir: Path = DEFAULT_COVER_DIR) -> str | None:
    if not url:
        return None
    suffix = Path(urllib.parse.urlparse(url).path).suffix or ".jpg"
    filename = f"{slugify(title)}-{isbn or 'cover'}{suffix}"
    output = cover_dir / filename
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(fetch_bytes(url))
    return "/" + str(output.relative_to(REPO_ROOT / "frontend" / "public")).replace("\\", "/")


def load_books(output: Path = BOOKS_JSON) -> list[dict[str, Any]]:
    if not output.exists():
        return []
    return json.loads(output.read_text())


def save_books(records: list[dict[str, Any]], output: Path = BOOKS_JSON) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")


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
        books.append(record)
    else:
        books[match_index] = {**books[match_index], **record}
    save_books(books, output)
    return record
