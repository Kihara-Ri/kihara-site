#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import datetime as dt
import hashlib
import json
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
DEFAULT_ALBUMS_PATH = REPO_ROOT / "frontend" / "src" / "content" / "music" / "albums.json"
DEFAULT_COVERS_DIR = REPO_ROOT / "frontend" / "public" / "music" / "covers"
DEFAULT_USER_AGENT = "kihara-site-album-manager/2.0"
CSV_REQUIRED_HEADERS = {"名称", "作者", "日期", "购买地点"}
RETRYABLE_COVER_STATUSES = {"missing", "error", "pending", ""}


class AlbumManagerError(RuntimeError):
    pass


def normalize_text(value: str | None) -> str:
    if value is None:
        return ""
    return unicodedata.normalize("NFKC", value).strip()


def normalize_key(value: str | None) -> str:
    return normalize_text(value).casefold()


def slugify(title: str, artist: str) -> str:
    source = normalize_text(f"{artist}-{title}").lower()
    ascii_only = re.sub(r"[^a-z0-9]+", "-", source.encode("ascii", "ignore").decode("ascii")).strip("-")
    if ascii_only:
        return ascii_only
    digest = hashlib.md5(source.encode("utf-8")).hexdigest()[:10]
    return f"album-{digest}"


def parse_purchase_date(raw: str, fallback_year: int | None) -> tuple[str, str]:
    cleaned = normalize_text(raw)

    full_match = re.fullmatch(r"(\d{4})[-/](\d{1,2})[-/](\d{1,2})", cleaned)
    if full_match:
        year, month, day = map(int, full_match.groups())
        parsed = dt.date(year, month, day)
        return parsed.isoformat(), cleaned

    md_match = re.fullmatch(r"(\d{1,2})/(\d{1,2})", cleaned)
    if md_match and fallback_year is not None:
        month, day = map(int, md_match.groups())
        parsed = dt.date(fallback_year, month, day)
        return parsed.isoformat(), cleaned

    raise AlbumManagerError(f"无法识别日期格式: {raw}")


def format_price_text(price: str, currency: str | None) -> str:
    normalized_currency = normalize_text(currency).upper()
    if normalized_currency == "円":
        normalized_currency = "JPY"
    if not normalized_currency:
        normalized_currency = "JPY"
    return f"{price} {normalized_currency}"


def split_price_and_note(raw: str | None) -> tuple[str | None, float | None, str | None, str | None]:
    cleaned = normalize_text(raw)
    if not cleaned:
        return None, None, None, None

    match = re.match(
        r"^(?P<price>\d+(?:\.\d+)?)\s*(?P<currency>RMB|JPY|円)?(?:\s+)?(?P<note>.*)$",
        cleaned,
        re.IGNORECASE,
    )
    if not match:
        return None, None, None, cleaned

    price_text = match.group("price")
    currency = normalize_text(match.group("currency") or "JPY").upper()
    if currency == "円":
        currency = "JPY"
    note = normalize_text(match.group("note")) or None

    try:
        price_value = float(price_text)
    except ValueError:
        price_value = None

    return format_price_text(price_text, currency), price_value, currency, note


def load_albums(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def save_albums(path: Path, albums: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(albums, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def make_album_key(title: str, artist: str) -> tuple[str, str]:
    return normalize_key(title), normalize_key(artist)


def collect_existing_keys(albums: list[dict[str, Any]]) -> set[tuple[str, str]]:
    return {
        make_album_key(str(album.get("title", "")), str(album.get("artist", "")))
        for album in albums
    }


def collect_existing_ids(albums: list[dict[str, Any]]) -> set[str]:
    ids: set[str] = set()
    for album in albums:
        album_id = normalize_text(str(album.get("id", "")))
        if album_id:
            ids.add(album_id)
    return ids


def make_unique_id(base_id: str, used_ids: set[str]) -> str:
    if base_id not in used_ids:
        return base_id

    suffix = 2
    while True:
        candidate = f"{base_id}-{suffix}"
        if candidate not in used_ids:
            return candidate
        suffix += 1


def build_album_entry(
    *,
    title: str,
    artist: str,
    purchase_date: str,
    location: str,
    raw_remark: str | None,
    fallback_year: int | None,
    album_id: str,
) -> dict[str, Any]:
    date_iso, date_display = parse_purchase_date(purchase_date, fallback_year)
    price_text, price_value, currency, note = split_price_and_note(raw_remark)

    return {
        "id": album_id,
        "title": normalize_text(title),
        "artist": normalize_text(artist),
        "releaseYear": None,
        "purchase": {
            "date": date_iso,
            "display": date_display,
            "location": normalize_text(location),
            "priceText": price_text,
            "priceValue": price_value,
            "currency": currency,
        },
        "note": note,
        "rawRemark": normalize_text(raw_remark) or None,
        "cover": {
            "file": None,
            "source": None,
            "status": "missing",
        },
    }


def validate_csv_headers(fieldnames: list[str]) -> None:
    missing = CSV_REQUIRED_HEADERS - set(fieldnames)
    if missing:
        raise AlbumManagerError(f"CSV 缺少必要列: {', '.join(sorted(missing))}")


def load_csv_rows(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        raise AlbumManagerError(f"找不到 CSV 文件: {path}")

    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, skipinitialspace=True)
        reader.fieldnames = [normalize_text(name) for name in reader.fieldnames or []]
        if not reader.fieldnames:
            raise AlbumManagerError("CSV 为空，或没有表头。")
        validate_csv_headers(reader.fieldnames)
        return list(reader)


def albums_matching_scope(
    albums: list[dict[str, Any]],
    *,
    album_id: str | None,
    title: str | None,
    artist: str | None,
    missing_only: bool,
) -> list[dict[str, Any]]:
    matches: list[dict[str, Any]] = []
    target_id = normalize_key(album_id)
    target_title = normalize_key(title)
    target_artist = normalize_key(artist)

    for album in albums:
        current_id = normalize_key(str(album.get("id") or ""))
        current_title = normalize_key(str(album.get("title") or ""))
        current_artist = normalize_key(str(album.get("artist") or ""))
        cover = album.get("cover", {})
        cover_status = normalize_key(str(cover.get("status") if isinstance(cover, dict) else ""))

        if target_id and current_id != target_id:
            continue
        if target_title and current_title != target_title:
            continue
        if target_artist and current_artist != target_artist:
            continue
        if missing_only and cover_status not in RETRYABLE_COVER_STATUSES:
            continue
        matches.append(album)

    return matches


def has_existing_cover_file(album: dict[str, Any], covers_dir: Path) -> bool:
    cover = album.get("cover", {})
    if not isinstance(cover, dict):
        return False
    file_value = normalize_text(str(cover.get("file") or ""))
    status = normalize_key(str(cover.get("status") or ""))
    if not file_value:
        return False
    target = covers_dir / Path(file_value).name
    return target.exists() and status not in RETRYABLE_COVER_STATUSES


def open_json(url: str) -> dict[str, Any]:
    request = urllib.request.Request(url, headers={"User-Agent": DEFAULT_USER_AGENT})
    delay_seconds = 1.0
    for attempt in range(5):
        try:
            with urllib.request.urlopen(request, timeout=20) as response:
                return json.load(response)
        except HTTPError as error:
            if error.code != 429 or attempt == 4:
                raise
            time.sleep(delay_seconds)
            delay_seconds *= 2
    raise AlbumManagerError("请求 iTunes API 失败")


def download_file(url: str, target: Path) -> None:
    request = urllib.request.Request(url, headers={"User-Agent": DEFAULT_USER_AGENT})
    delay_seconds = 1.0
    for attempt in range(5):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                target.write_bytes(response.read())
                return
        except HTTPError as error:
            if error.code != 429 or attempt == 4:
                raise
            time.sleep(delay_seconds)
            delay_seconds *= 2


def normalize_search_text(value: str | None) -> str:
    if not value:
        return ""
    cleaned = unicodedata.normalize("NFKC", value).lower()
    return re.sub(r"[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+", "", cleaned)


def score_result(title: str, artist: str, item: dict[str, Any]) -> int:
    title_key = normalize_search_text(title)
    artist_key = normalize_search_text(artist)
    collection_name = normalize_search_text(str(item.get("collectionName") or ""))
    track_name = normalize_search_text(str(item.get("trackName") or ""))
    artist_name = normalize_search_text(str(item.get("artistName") or ""))

    score = 0
    if title_key and title_key == collection_name:
        score += 10
    elif title_key and title_key == track_name:
        score += 8
    elif title_key and (title_key in collection_name or collection_name in title_key):
        score += 6
    elif title_key and (title_key in track_name or track_name in title_key):
        score += 4

    if artist_key and artist_key == artist_name:
        score += 7
    elif artist_key and (artist_key in artist_name or artist_name in artist_key):
        score += 4

    if item.get("collectionType") == "Album":
        score += 2

    return score


def is_acceptable_match(title: str, artist: str, item: dict[str, Any], score: int) -> bool:
    title_key = normalize_search_text(title)
    artist_key = normalize_search_text(artist)
    collection_name = normalize_search_text(str(item.get("collectionName") or ""))
    track_name = normalize_search_text(str(item.get("trackName") or ""))
    artist_name = normalize_search_text(str(item.get("artistName") or ""))

    title_match = bool(
        title_key
        and (
            title_key == collection_name
            or title_key == track_name
            or (len(title_key) >= 3 and title_key in collection_name)
            or (len(title_key) >= 3 and title_key in track_name)
        )
    )
    artist_match = bool(
        artist_key
        and (artist_key == artist_name or artist_key in artist_name or artist_name in artist_key)
    )
    return title_match and artist_match and score >= 10


def search_itunes(title: str, artist: str) -> dict[str, Any] | None:
    countries = ["JP", "US"] if re.search(r"[\u3040-\u30ff\u3400-\u9fff]", f"{title}{artist}") else ["US", "JP"]
    best: tuple[int, dict[str, Any] | None] = (-1, None)

    for country in countries:
        params = urllib.parse.urlencode(
            {
                "term": f"{artist} {title}",
                "media": "music",
                "limit": 12,
                "country": country,
            }
        )
        payload = open_json(f"https://itunes.apple.com/search?{params}")
        for item in payload.get("results", []):
            current_score = score_result(title, artist, item)
            if current_score > best[0]:
                best = (current_score, item)
        if best[1] is not None and is_acceptable_match(title, artist, best[1], best[0]):
            break

    if best[1] is not None and is_acceptable_match(title, artist, best[1], best[0]):
        return best[1]
    return None


def artwork_url(item: dict[str, Any]) -> str | None:
    raw = str(item.get("artworkUrl100") or item.get("artworkUrl60") or "")
    if not raw:
        return None
    return raw.replace("100x100bb", "1200x1200bb").replace("60x60bb", "1200x1200bb")


def release_year(item: dict[str, Any]) -> int | None:
    raw = str(item.get("releaseDate") or "")
    prefix = raw[:4]
    if prefix.isdigit():
        return int(prefix)
    return None


def command_replace_from_csv(args: argparse.Namespace) -> int:
    rows = load_csv_rows(args.input)
    albums: list[dict[str, Any]] = []
    used_ids: set[str] = set()

    for row in rows:
        base_id = slugify(row["名称"], row["作者"])
        album_id = make_unique_id(base_id, used_ids)
        used_ids.add(album_id)
        albums.append(
            build_album_entry(
                title=row["名称"],
                artist=row["作者"],
                purchase_date=row["日期"],
                location=row["购买地点"],
                raw_remark=row.get("备注", ""),
                fallback_year=args.year,
                album_id=album_id,
            )
        )

    save_albums(args.output, albums)
    print(f"完成: 用 {len(albums)} 条 CSV 记录重建 {args.output}")
    return 0


def command_merge_csv(args: argparse.Namespace) -> int:
    rows = load_csv_rows(args.input)
    albums = load_albums(args.output)
    existing_keys = collect_existing_keys(albums)
    used_ids = collect_existing_ids(albums)

    added_items: list[str] = []
    skipped_items: list[str] = []

    for row in rows:
        title = normalize_text(row.get("名称"))
        artist = normalize_text(row.get("作者"))
        if not title or not artist:
            skipped_items.append(f"(空标题或空作者) {artist} - {title}".strip())
            continue

        key = make_album_key(title, artist)
        if key in existing_keys:
            skipped_items.append(f"{artist} - {title}")
            continue

        base_id = slugify(title, artist)
        album_id = make_unique_id(base_id, used_ids)
        used_ids.add(album_id)
        existing_keys.add(key)

        albums.append(
            build_album_entry(
                title=title,
                artist=artist,
                purchase_date=row["日期"],
                location=row["购买地点"],
                raw_remark=row.get("备注", ""),
                fallback_year=args.year,
                album_id=album_id,
            )
        )
        added_items.append(f"{artist} - {title}")

    save_albums(args.output, albums)
    print(f"完成: 新增 {len(added_items)} 条，跳过 {len(skipped_items)} 条")
    if added_items:
        print("\n新增条目:")
        for item in added_items:
            print(f"  + {item}")
    if skipped_items:
        print("\n跳过条目:")
        for item in skipped_items:
            print(f"  - {item}")
    return 0


def command_add(args: argparse.Namespace) -> int:
    albums = load_albums(args.output)
    title = normalize_text(args.title)
    artist = normalize_text(args.artist)
    key = make_album_key(title, artist)
    existing_keys = collect_existing_keys(albums)
    if key in existing_keys:
        raise AlbumManagerError(f"专辑已存在: {artist} - {title}")

    used_ids = collect_existing_ids(albums)
    base_id = slugify(title, artist)
    album_id = make_unique_id(base_id, used_ids)
    raw_remark = args.remark
    if not raw_remark and args.price is not None:
        raw_remark = format_price_text(args.price, args.currency)
        if args.note:
            raw_remark = f"{raw_remark} {normalize_text(args.note)}"

    album = build_album_entry(
        title=title,
        artist=artist,
        purchase_date=args.date,
        location=args.location,
        raw_remark=raw_remark,
        fallback_year=None,
        album_id=album_id,
    )

    if args.note:
        album["note"] = normalize_text(args.note)
    albums.append(album)
    save_albums(args.output, albums)
    print(f"完成: 已新增 {artist} - {title} ({album_id})")
    return 0


def command_fetch_cover(args: argparse.Namespace) -> int:
    albums = load_albums(args.input)
    covers_dir = args.output_dir
    covers_dir.mkdir(parents=True, exist_ok=True)

    if not args.all and not args.id and not args.title and not args.artist:
        raise AlbumManagerError("为安全起见，请提供 --id / --title / --artist，或明确传入 --all。")

    targets = albums_matching_scope(
        albums,
        album_id=args.id,
        title=args.title,
        artist=args.artist,
        missing_only=args.missing_only,
    )

    if args.limit is not None:
        targets = targets[: args.limit]

    if not targets:
        print("没有匹配到需要处理的专辑。")
        return 0

    print(f"[START] 将处理 {len(targets)} 张专辑")

    fetched = 0
    skipped = 0
    missed = 0
    errors = 0

    for index, album in enumerate(targets, start=1):
        title = normalize_text(str(album.get("title") or ""))
        artist = normalize_text(str(album.get("artist") or ""))
        label = f"{artist} - {title}"

        if not args.force and has_existing_cover_file(album, covers_dir):
            print(f"[{index}/{len(targets)}] [SKIP] 保留现有封面: {label}")
            skipped += 1
            continue

        print(f"[{index}/{len(targets)}] [SEARCH] {label}")

        try:
            item = search_itunes(title, artist)
            url = artwork_url(item or {})
            if not url:
                album["cover"] = {
                    "file": None,
                    "source": "itunes",
                    "status": "missing",
                    "matchedTitle": None,
                }
                print(f"[{index}/{len(targets)}] [MISS] 未找到: {label}")
                missed += 1
                continue

            target = covers_dir / f"{album['id']}.jpg"
            download_file(url, target)
            matched_title = item.get("collectionName") or item.get("trackName")
            year = release_year(item or {})

            if year is not None:
                album["releaseYear"] = year
            album["cover"] = {
                "file": f"/music/covers/{target.name}",
                "source": "itunes",
                "status": "fetched",
                "matchedTitle": matched_title,
            }
            print(f"[{index}/{len(targets)}] [OK] 已获取: {label} -> {matched_title}")
            fetched += 1
            save_albums(args.input, albums)
            time.sleep(args.sleep)
        except (HTTPError, URLError, TimeoutError, OSError, AlbumManagerError) as error:
            print(f"[{index}/{len(targets)}] [ERROR] {label} -> {error}")
            errors += 1
            save_albums(args.input, albums)

    print("\n[SUMMARY]")
    print(f"  fetched: {fetched}")
    print(f"  skipped: {skipped}")
    print(f"  missed : {missed}")
    print(f"  errors : {errors}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Manage music album data, imports, and cover fetching from one unified CLI.",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    replace_parser = subparsers.add_parser("replace-from-csv", help="用 CSV 全量重建 albums.json")
    replace_parser.add_argument("--input", type=Path, required=True, help="CSV 文件路径")
    replace_parser.add_argument("--output", type=Path, default=DEFAULT_ALBUMS_PATH, help="目标 albums.json 路径")
    replace_parser.add_argument("--year", type=int, default=dt.date.today().year, help="CSV 中月/日格式所使用的年份")
    replace_parser.set_defaults(func=command_replace_from_csv)

    merge_parser = subparsers.add_parser("merge-csv", help="把 CSV 新记录追加进已有 albums.json")
    merge_parser.add_argument("--input", type=Path, required=True, help="CSV 文件路径")
    merge_parser.add_argument("--output", type=Path, default=DEFAULT_ALBUMS_PATH, help="目标 albums.json 路径")
    merge_parser.add_argument("--year", type=int, default=dt.date.today().year, help="CSV 中月/日格式所使用的年份")
    merge_parser.set_defaults(func=command_merge_csv)

    add_parser = subparsers.add_parser("add", help="直接新增一张专辑，无需准备临时 CSV")
    add_parser.add_argument("--title", required=True, help="专辑名")
    add_parser.add_argument("--artist", required=True, help="作者/艺人")
    add_parser.add_argument("--date", required=True, help="购入日期，支持 YYYY-M-D / YYYY/MM/DD")
    add_parser.add_argument("--location", required=True, help="购入地点")
    add_parser.add_argument("--price", help="价格数字部分，例如 800")
    add_parser.add_argument("--currency", default="JPY", help="货币，默认 JPY")
    add_parser.add_argument("--remark", help="原始备注，若提供则优先使用")
    add_parser.add_argument("--note", help="补充说明")
    add_parser.add_argument("--output", type=Path, default=DEFAULT_ALBUMS_PATH, help="目标 albums.json 路径")
    add_parser.set_defaults(func=command_add)

    cover_parser = subparsers.add_parser("fetch-cover", help="抓取指定专辑或一组专辑的封面")
    cover_parser.add_argument("--input", type=Path, default=DEFAULT_ALBUMS_PATH, help="albums.json 路径")
    cover_parser.add_argument("--output-dir", type=Path, default=DEFAULT_COVERS_DIR, help="封面输出目录")
    cover_parser.add_argument("--id", help="按专辑 id 精确匹配")
    cover_parser.add_argument("--title", help="按标题精确匹配")
    cover_parser.add_argument("--artist", help="按艺人精确匹配")
    cover_parser.add_argument("--all", action="store_true", help="明确允许扫描整个库")
    cover_parser.add_argument("--missing-only", action="store_true", help="只处理封面缺失状态的专辑")
    cover_parser.add_argument("--force", action="store_true", help="即使已有封面文件也重新抓取")
    cover_parser.add_argument("--limit", type=int, help="最多处理多少条")
    cover_parser.add_argument("--sleep", type=float, default=0.35, help="每次成功抓取后的等待秒数")
    cover_parser.set_defaults(func=command_fetch_cover)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        return int(args.func(args))
    except AlbumManagerError as error:
        parser.exit(1, f"错误: {error}\n")


if __name__ == "__main__":
    raise SystemExit(main())
