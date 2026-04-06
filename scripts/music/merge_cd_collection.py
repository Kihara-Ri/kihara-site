#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import datetime as dt
import hashlib
import json
import re
import unicodedata
from pathlib import Path


def normalize_text(value: str | None) -> str:
    if value is None:
        return ""
    return unicodedata.normalize("NFKC", value).strip()


def normalize_key(value: str | None) -> str:
    return normalize_text(value).casefold()


def slugify(title: str, artist: str) -> str:
    source = normalize_text(f"{artist}-{title}").lower()
    ascii_only = re.sub(
        r"[^a-z0-9]+",
        "-",
        source.encode("ascii", "ignore").decode("ascii")
    ).strip("-")
    if ascii_only:
        return ascii_only
    digest = hashlib.md5(source.encode("utf-8")).hexdigest()[:10]
    return f"album-{digest}"

def parse_purchase_date(raw: str, year: int) -> tuple[str, str]:
    cleaned = normalize_text(raw)

    # 1) 完整日期：2022-10-21 / 2022/10/21
    full_match = re.fullmatch(r"(\d{4})[-/](\d{1,2})[-/](\d{1,2})", cleaned)
    if full_match:
        y, m, d = map(int, full_match.groups())
        parsed = dt.date(y, m, d)
        return parsed.isoformat(), cleaned

    # 2) 月/日：10/21
    md_match = re.fullmatch(r"(\d{1,2})/(\d{1,2})", cleaned)
    if md_match:
        m, d = map(int, md_match.groups())
        parsed = dt.date(year, m, d)
        return parsed.isoformat(), cleaned

    raise ValueError(f"无法识别日期格式: {raw}")

def split_price_and_note(raw: str) -> tuple[str | None, float | None, str | None, str | None]:
    cleaned = normalize_text(raw)
    if not cleaned:
        return None, None, None, None

    match = re.match(
        r"^(?P<price>\d+(?:\.\d+)?)\s*(?P<currency>RMB|JPY|円)?\s*(?P<note>.*)$",
        cleaned,
        re.IGNORECASE,
    )
    if not match:
        return None, None, None, cleaned

    price_text = match.group("price")
    currency = (match.group("currency") or "JPY").upper()
    if currency == "円":
        currency = "JPY"

    note = (match.group("note") or "").strip() or None

    try:
        price_value = float(price_text)
    except ValueError:
        price_value = None

    return f"{price_text}{currency if currency != 'JPY' else ''}", price_value, currency, note


def build_album(row: dict[str, str], year: int, album_id: str) -> dict[str, object]:
    title = normalize_text(row["名称"])
    artist = normalize_text(row["作者"])
    date_iso, date_label = parse_purchase_date(row["日期"], year)
    location = normalize_text(row["购买地点"])
    raw_remark = normalize_text(row.get("备注", ""))
    price_text, price_value, currency, note = split_price_and_note(raw_remark)

    return {
        "id": album_id,
        "title": title,
        "artist": artist,
        "releaseYear": None,
        "purchase": {
            "date": date_iso,
            "display": date_label,
            "location": location,
            "priceText": price_text,
            "priceValue": price_value,
            "currency": currency,
        },
        "note": note,
        "rawRemark": raw_remark or None,
        "cover": {
            "file": None,
            "source": None,
            "status": "missing",
        },
    }


def make_album_key(title: str, artist: str) -> tuple[str, str]:
    return normalize_key(title), normalize_key(artist)


def load_existing_albums(path: Path) -> list[dict[str, object]]:
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def collect_existing_keys(albums: list[dict[str, object]]) -> set[tuple[str, str]]:
    keys: set[tuple[str, str]] = set()
    for album in albums:
        title = str(album.get("title", ""))
        artist = str(album.get("artist", ""))
        keys.add(make_album_key(title, artist))
    return keys


def collect_existing_ids(albums: list[dict[str, object]]) -> set[str]:
    ids: set[str] = set()
    for album in albums:
        album_id = str(album.get("id", "")).strip()
        if album_id:
            ids.add(album_id)
    return ids


def make_unique_id(base_id: str, used_ids: set[str]) -> str:
    if base_id not in used_ids:
        return base_id

    index = 2
    while True:
        candidate = f"{base_id}-{index}"
        if candidate not in used_ids:
            return candidate
        index += 1


def validate_headers(fieldnames: list[str]) -> None:
    required = {"名称", "作者", "日期", "购买地点"}
    missing = required - set(fieldnames)
    if missing:
        joined = ", ".join(sorted(missing))
        raise ValueError(f"CSV 缺少必要列: {joined}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Merge CD collection CSV into existing albums.json without overwriting old entries."
    )
    parser.add_argument("--input", required=True, help="CSV 文件路径")
    parser.add_argument("--output", default="frontend/src/content/music/albums.json", help="目标 albums.json 路径")
    parser.add_argument("--year", type=int, default=dt.date.today().year, help="CSV 中日期所属年份")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        raise FileNotFoundError(f"找不到 CSV 文件: {input_path}")

    existing_albums = load_existing_albums(output_path)
    existing_keys = collect_existing_keys(existing_albums)
    used_ids = collect_existing_ids(existing_albums)

    with input_path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, skipinitialspace=True)
        reader.fieldnames = [normalize_text(name) for name in reader.fieldnames or []]

        if not reader.fieldnames:
            raise ValueError("CSV 为空，或没有表头。")

        validate_headers(reader.fieldnames)
        rows = list(reader)

    added_count = 0
    skipped_count = 0
    added_items: list[str] = []
    skipped_items: list[str] = []

    for row in rows:
        title = normalize_text(row.get("名称", ""))
        artist = normalize_text(row.get("作者", ""))

        if not title or not artist:
            skipped_count += 1
            skipped_items.append(f"(空标题或空作者) {artist} - {title}".strip())
            continue

        key = make_album_key(title, artist)
        if key in existing_keys:
            skipped_count += 1
            skipped_items.append(f"{artist} - {title}")
            continue

        base_id = slugify(title, artist)
        album_id = make_unique_id(base_id, used_ids)
        album = build_album(row, args.year, album_id)

        existing_albums.append(album)
        existing_keys.add(key)
        used_ids.add(album_id)

        added_count += 1
        added_items.append(f"{artist} - {title}")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(existing_albums, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"完成: 新增 {added_count} 条，跳过 {skipped_count} 条")
    if added_items:
        print("\n新增条目:")
        for item in added_items:
            print(f"  + {item}")

    if skipped_items:
        print("\n跳过条目:")
        for item in skipped_items:
            print(f"  - {item}")


if __name__ == "__main__":
    main()