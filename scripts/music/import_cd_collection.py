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


def normalize_text(value: str) -> str:
    return unicodedata.normalize("NFKC", value).strip()


def slugify(title: str, artist: str) -> str:
    source = normalize_text(f"{artist}-{title}").lower()
    ascii_only = re.sub(r"[^a-z0-9]+", "-", source.encode("ascii", "ignore").decode("ascii")).strip("-")
    if ascii_only:
        return ascii_only
    digest = hashlib.md5(source.encode("utf-8")).hexdigest()[:10]
    return f"album-{digest}"


def parse_purchase_date(raw: str, year: int) -> tuple[str, str]:
    cleaned = normalize_text(raw)
    month_text, day_text = [part.strip() for part in cleaned.split("/", 1)]
    parsed = dt.date(year, int(month_text), int(day_text))
    return parsed.isoformat(), cleaned


def split_price_and_note(raw: str) -> tuple[str | None, float | None, str | None, str | None]:
    cleaned = normalize_text(raw)
    if not cleaned:
      return None, None, None, None

    match = re.match(r"^(?P<price>\d+(?:\.\d+)?)\s*(?P<currency>RMB|JPY|円)?\s*(?P<note>.*)$", cleaned, re.IGNORECASE)
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


def main() -> None:
    parser = argparse.ArgumentParser(description="Import CD collection CSV into a readable JSON content file.")
    parser.add_argument("--input", default="/Users/kiharari/Desktop/CD统计.csv")
    parser.add_argument("--output", default="frontend/src/content/music/albums.json")
    parser.add_argument("--year", type=int, default=dt.date.today().year)
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    with input_path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, skipinitialspace=True)
        reader.fieldnames = [normalize_text(name) for name in reader.fieldnames or []]
        rows = list(reader)

    albums = []
    id_counts: dict[str, int] = {}
    for row in rows:
        base_id = slugify(row["名称"], row["作者"])
        next_index = id_counts.get(base_id, 0) + 1
        id_counts[base_id] = next_index
        album_id = base_id if next_index == 1 else f"{base_id}-{next_index}"
        albums.append(build_album(row, args.year, album_id))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(albums, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {len(albums)} albums to {output_path}")


if __name__ == "__main__":
    main()
