# Music Collection Data

这套音乐页数据现在分成两部分：

- `albums.json`
  站点实际读取的内容源。前端直接消费这份文件。
- `../../../../scripts/music/album_manager.py`
  统一管理音乐专辑数据：支持单条新增、CSV 全量导入、CSV 增量合并，以及按范围抓取封面。

## 为什么用 JSON

`albums.json` 比组件内硬编码数组更适合长期维护：

- 前端可以直接导入，不需要额外解析步骤
- 字段结构稳定，方便脚本批量处理
- 排版上仍然足够可读，适合手动修正

## 单条记录结构

```json
{
  "id": "oasis-definitely-maybe",
  "title": "Definitely Maybe",
  "artist": "Oasis",
  "purchase": {
    "date": "2026-01-28",
    "display": "1/28",
    "location": "Disk unionお茶の水駅前店",
    "priceText": "880",
    "priceValue": 880.0,
    "currency": "JPY"
  },
  "note": null,
  "rawRemark": "880",
  "cover": {
    "file": "/music/covers/oasis-definitely-maybe.jpg",
    "source": "itunes",
    "status": "fetched"
  }
}
```

## 推荐维护方式

1. 如果只是新增一张专辑，优先使用 `add`
2. 如果你维护了原始 `CD统计.csv`，按需求使用：
   全量重建 `replace-from-csv`
   增量追加 `merge-csv`
3. 只给目标专辑补封面时，使用 `fetch-cover --id ...`
4. 最后手动检查少数没匹配准的条目，必要时直接编辑 `albums.json`

## 常用命令

```bash
python3 scripts/music/album_manager.py add \
  --title "Funeral" \
  --artist "Arcade Fire" \
  --date "2026-04-22" \
  --location "メルカリ" \
  --price 800

python3 scripts/music/album_manager.py merge-csv \
  --input /path/to/CD统计.csv \
  --year 2026

python3 scripts/music/album_manager.py replace-from-csv \
  --input /path/to/CD统计.csv \
  --year 2026

python3 scripts/music/album_manager.py fetch-cover \
  --id arcade-fire-funeral
```

## 设计约定

- `add` 不再要求你先造一份临时 CSV
- `fetch-cover` 默认不会扫全库；需要显式传 `--all` 才允许
- 价格文本统一写成 `800 JPY`、`158 RMB` 这种形式，避免出现裸数字
- `merge-csv` 与 `replace-from-csv` 共用同一套日期和备注解析逻辑

## 手动修正建议

- 如果自动抓错封面，直接改 `cover.file` 指向手动放进去的图片
- 如果你手动指定了本地图片，把 `cover.status` 改成 `manual`
- 如果备注里有更细的信息，优先写到 `note`，保留 `rawRemark` 作为原始记录
