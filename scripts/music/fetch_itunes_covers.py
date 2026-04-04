#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from urllib.error import HTTPError
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
    request = urllib.request.Request(url, headers={"User-Agent": "kihara-site-cover-fetcher/1.0"})
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
    request = urllib.request.Request(url, headers={"User-Agent": "kihara-site-cover-fetcher/1.0"})
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


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch album covers from iTunes Search API.")
    parser.add_argument("--input", default="frontend/src/content/music/albums.json")
    parser.add_argument("--output-dir", default="frontend/public/music/covers")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    albums = json.loads(input_path.read_text(encoding="utf-8"))
    fetched = 0
    missed: list[str] = []

    for album in albums:
        if album.get("cover", {}).get("status") == "manual":
            continue

        item = search_itunes(album["title"], album["artist"])
        url = artwork_url(item or {})
        if not url:
            missed.append(f'{album["artist"]} - {album["title"]}')
            continue

        target = output_dir / f'{album["id"]}.jpg'
        download_file(url, target)

        album["releaseYear"] = release_year(item or {})
        album["cover"] = {
            "file": f'/music/covers/{target.name}',
            "source": "itunes",
            "status": "fetched",
            "matchedTitle": item.get("collectionName") or item.get("trackName"),
        }
        fetched += 1
        time.sleep(0.35)

    input_path.write_text(json.dumps(albums, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"fetched {fetched} covers")
    if missed:
        print("missed:")
        for item in missed:
            print(f"  - {item}")


if __name__ == "__main__":
    main()
