# Music Album Release

Use this guide when adding one or more albums to the site's music collection.

## Scope

This workflow covers:

- Adding album purchase records to `frontend/src/content/music/albums.json`
- Filling release years and cover metadata
- Adding cover files under `frontend/public/music/covers/`
- Rebuilding embedded frontend assets under `backend/web/frontend_dist/`
- Committing, pushing, and deploying when the user asks for those steps

## Input Rules

- Required album fields: title, artist, purchase location, price.
- If purchase date is omitted, use the current local date from the environment.
- Parse prices such as `692JPY`, `692 JPY`, and `692円` as price `692` with currency `JPY`.
- Preserve user notes after labels such as `备注:` in the `note` field.
- Keep the worktree safe: run `git status --short` first and do not revert unrelated user changes.

## Add Albums

Use the project tool rather than hand-editing JSON for new entries:

```bash
python3 scripts/music/album_manager.py add \
  --title "TITLE" \
  --artist "ARTIST" \
  --date "YYYY-MM-DD" \
  --location "LOCATION" \
  --price "PRICE" \
  --currency "JPY"
```

Add `--note "NOTE"` only when the user provided one.

If the tool reports a duplicate, inspect `frontend/src/content/music/albums.json` and either confirm the request is already satisfied or manually update missing metadata.

## Fill Covers And Metadata

Use the id printed by the add command:

```bash
python3 scripts/music/album_manager.py fetch-cover --id ALBUM_ID
```

After fetching, inspect the resulting record and confirm:

- `releaseYear`
- `cover.file`
- `cover.source`
- `cover.status`
- `cover.matchedTitle`

If automatic cover fetching misses or matches poorly, prefer a suitable existing local image. Put manual covers under `frontend/public/music/covers/` and set:

```json
"cover": {
  "file": "/music/covers/FILENAME.jpg",
  "source": "manual",
  "status": "manual"
}
```

For noisy or non-square artwork that must render cleanly at small sizes, generate a square 1200px JPEG:

```bash
ffmpeg -y -i INPUT.jpg \
  -vf "crop=min(iw\\,ih):min(iw\\,ih),hqdn3d=1.2:1.2:6:6,scale=1200:1200:flags=lanczos,unsharp=5:5:0.25:3:3:0.08" \
  -frames:v 1 -q:v 2 OUTPUT.jpg
```

## Validate

Run:

```bash
python3 -m json.tool frontend/src/content/music/albums.json >/dev/null
bash -lc 'source "$HOME/.nvm/nvm.sh" && npm run check'
bash -lc 'source "$HOME/.nvm/nvm.sh" && npm run build'
git diff --check
```

`npm run build` updates:

- `frontend/dist/`
- `backend/web/frontend_dist/`
- `release/kihara-site`

Large Vite chunk warnings are acceptable if the build exits successfully.

## Commit And Push

When requested:

```bash
git add -A
git commit -m "Add music collection albums" \
  -m "Add new album entries with purchase metadata, release years, and cover assets." \
  -m "Fetch or provide album artwork and rebuild the embedded frontend distribution."
git push origin "$(git branch --show-current)"
```

Make the message specific to the albums and changes performed.

## Deploy

When requested:

```bash
bash -lc 'source "$HOME/.nvm/nvm.sh" && npm run deploy'
```

If the deploy script fails only because the immediate post-restart `curl` races service startup, check manually:

```bash
sudo systemctl status kihara-site --no-pager --full
curl -I --max-time 10 http://127.0.0.1:8080/
sudo nginx -t
```

Report the commit hash, push target, service status, HTTP verification, nginx result, and whether the worktree is clean.

