#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from urllib.error import HTTPError, URLError
from pathlib import Path


def normalize(value: str | None) -> str:
    if not value:
        return ""
    cleaned = unicodedata.normalize("NFKC", value).lower()
    return re.sub(r"[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+", "", cleaned)


def score_result(title: str, artist: str, item: dict[str, object]) -> int:
    title_key = normalize(title)
    artist_key = normalize(artist)
    collection_name = normalize(str(item.get("collectionName") or ""))
    track_name = normalize(str(item.get("trackName") or ""))
    artist_name = normalize(str(item.get("artistName") or ""))

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


def is_acceptable_match(title: str, artist: str, item: dict[str, object], score: int) -> bool:
    title_key = normalize(title)
    artist_key = normalize(artist)
    collection_name = normalize(str(item.get("collectionName") or ""))
    track_name = normalize(str(item.get("trackName") or ""))
    artist_name = normalize(str(item.get("artistName") or ""))

    title_match = False
    if title_key:
        title_match = (
            title_key == collection_name
            or title_key == track_name
            or (title_key in collection_name and len(title_key) >= 3)
            or (title_key in track_name and len(title_key) >= 3)
        )

    artist_match = False
    if artist_key:
        artist_match = (
            artist_key == artist_name
            or artist_key in artist_name
            or artist_name in artist_key
        )

    return title_match and artist_match and score >= 10


def open_json(url: str) -> dict[str, object]:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "kihara-site-cover-fetcher/1.0"},
    )
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
    raise RuntimeError("unreachable")


def download_file(url: str, target: Path) -> None:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "kihara-site-cover-fetcher/1.0"},
    )
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


def search_itunes(title: str, artist: str) -> dict[str, object] | None:
    countries = ["JP", "US"] if re.search(r"[\u3040-\u30ff\u3400-\u9fff]", f"{title}{artist}") else ["US", "JP"]
    best: tuple[int, dict[str, object] | None] = (-1, None)

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


def artwork_url(item: dict[str, object]) -> str | None:
    raw = str(item.get("artworkUrl100") or item.get("artworkUrl60") or "")
    if not raw:
        return None
    return raw.replace("100x100bb", "1200x1200bb").replace("60x60bb", "1200x1200bb")


def release_year(item: dict[str, object]) -> int | None:
    raw = str(item.get("releaseDate") or "")
    prefix = raw[:4]
    if prefix.isdigit():
        return int(prefix)
    return None

def has_existing_cover(album: dict[str, object], output_dir: Path) -> bool:
    cover = album.get("cover", {})
    if not isinstance(cover, dict):
        return False

    file_value = str(cover.get("file") or "").strip()
    status = str(cover.get("status") or "").strip().lower()

    # 没有文件字段，说明没有现成封面
    if not file_value:
        return False

    target = output_dir / Path(file_value).name

    # 只要文件实际存在，并且不是明确待抓取状态，就视为已有封面
    # 这些状态才允许继续尝试重新抓取
    retryable_statuses = {"missing", "error", "pending", ""}

    if target.exists() and status not in retryable_statuses:
        return True

    return False

def save_albums(path: Path, albums: list[dict[str, object]]) -> None:
    path.write_text(json.dumps(albums, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch album covers from iTunes Search API incrementally.")
    parser.add_argument("--input", default="frontend/src/content/music/albums.json")
    parser.add_argument("--output-dir", default="frontend/public/music/covers")
    parser.add_argument("--sleep", type=float, default=0.35, help="每次成功抓取后的等待秒数")
    parser.add_argument("--save-every", type=int, default=1, help="每处理多少张后落盘一次，默认每张都保存")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    albums = json.loads(input_path.read_text(encoding="utf-8"))

    total = len(albums)
    fetched = 0
    skipped = 0
    missed = 0
    errors = 0
    processed_since_save = 0

    missed_items: list[str] = []
    error_items: list[str] = []

    print(f"[START] 共 {total} 张专辑，开始增量抓取封面")

    for index, album in enumerate(albums, start=1):
        title = str(album.get("title") or "").strip()
        artist = str(album.get("artist") or "").strip()
        label = f"{artist} - {title}"

        if not title or not artist:
            print(f"[{index}/{total}] [SKIP] 信息不完整: {label}")
            skipped += 1
            continue

        cover = album.get("cover", {})
        cover_status = ""
        cover_source = ""
        cover_file = ""

        if isinstance(cover, dict):
            cover_status = str(cover.get("status") or "").strip().lower()
            cover_source = str(cover.get("source") or "").strip()
            cover_file = str(cover.get("file") or "").strip()

        if has_existing_cover(album, output_dir):
            print(
                f"[{index}/{total}] [SKIP] 保留现有封面: {label} "
                f"(status={cover_status or '-'}, source={cover_source or '-'})"
            )
            skipped += 1
            continue
                
        print(f"[{index}/{total}] [SEARCH] {label}")

        try:
            item = search_itunes(title, artist)
            url = artwork_url(item or {})

            if not url:
                print(f"[{index}/{total}] [MISS] 未找到: {label}")
                missed += 1
                missed_items.append(label)

                album["cover"] = {
                    "file": None,
                    "source": "itunes",
                    "status": "missing",
                    "matchedTitle": None,
                }
                processed_since_save += 1
            else:
                target = output_dir / f'{album["id"]}.jpg'
                download_file(url, target)

                matched_title = item.get("collectionName") or item.get("trackName")
                matched_artist = item.get("artistName")
                year = release_year(item or {})

                album["releaseYear"] = year
                album["cover"] = {
                    "file": f"/music/covers/{target.name}",
                    "source": "itunes",
                    "status": "fetched",
                    "matchedTitle": matched_title,
                }

                print(
                    f"[{index}/{total}] [OK] 已获取: {label}"
                    f" -> {matched_artist} / {matched_title}"
                    f" / {year if year else 'year=?'}"
                )

                fetched += 1
                processed_since_save += 1
                time.sleep(args.sleep)

        except (HTTPError, URLError, TimeoutError, OSError) as error:
            print(f"[{index}/{total}] [ERROR] {label} -> {error}")
            errors += 1
            error_items.append(f"{label} -> {error}")
            processed_since_save += 1
        except Exception as error:
            print(f"[{index}/{total}] [ERROR] {label} -> {error}")
            errors += 1
            error_items.append(f"{label} -> {error}")
            processed_since_save += 1

        if processed_since_save >= args.save_every:
            save_albums(input_path, albums)
            processed_since_save = 0

    if processed_since_save > 0:
        save_albums(input_path, albums)

    print("\n[SUMMARY]")
    print(f"  fetched: {fetched}")
    print(f"  skipped: {skipped}")
    print(f"  missed : {missed}")
    print(f"  errors : {errors}")

    if missed_items:
        print("\n[MANUAL ACTION NEEDED] 以下专辑未找到，请手动添加封面或检查标题/作者：")
        for item in missed_items:
            print(f"  - {item}")

    if error_items:
        print("\n[ERROR DETAILS] 以下专辑处理失败：")
        for item in error_items:
            print(f"  - {item}")

    print("\n[DONE] 处理完成")
    

if __name__ == "__main__":
    main()