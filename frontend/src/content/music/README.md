# Music Collection Data

这套音乐页数据现在分成两部分：

- `albums.json`
  站点实际读取的内容源。前端直接消费这份文件。
- `../../../../scripts/music/import_cd_collection.py`
  把原始 `CD统计.csv` 导入成 `albums.json`。
- `../../../../scripts/music/fetch_itunes_covers.py`
  尝试从 iTunes Search API 自动抓取专辑封面，并把结果写回 `albums.json`，同时把图片下载到 `frontend/public/music/covers/`。

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

1. 先更新原始 `CD统计.csv`
2. 运行导入脚本更新 `albums.json`
3. 运行封面抓取脚本补齐 `cover`
4. 最后手动检查少数没匹配准的条目，必要时直接编辑 `albums.json`

## 常用命令

```bash
python3 scripts/music/import_cd_collection.py --year 2026
python3 scripts/music/fetch_itunes_covers.py
```

## 手动修正建议

- 如果自动抓错封面，直接改 `cover.file` 指向手动放进去的图片
- 如果你手动指定了本地图片，把 `cover.status` 改成 `manual`
- 如果备注里有更细的信息，优先写到 `note`，保留 `rawRemark` 作为原始记录
