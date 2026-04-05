# Deploy Templates

This directory contains production templates for the current deployment shape:

- `nginx/kihara-site.conf`: Nginx entrypoint that proxies all traffic to the Go server.
- `systemd/kihara-site.service`: systemd unit for the Go application.

## Expected production layout

```text
/opt/kihara-site/
  backend/
    articles/
    tag_config.yaml
  release/
    kihara-site
```

## Suggested release flow

1. Run `npm run build` in the repo root.
2. Upload:
   - `release/kihara-site`
   - `backend/articles/`
   - `backend/tag_config.yaml`
3. Install the systemd unit.
4. Install the Nginx config and reload Nginx.
5. Restart the service with `sudo systemctl restart kihara-site`.

## Notes

- The Go binary already embeds the frontend build output.
- If you want to override embedded assets with an external frontend build directory, set `STATIC_DIR` in the systemd unit.
- If you move the binary elsewhere, update `ExecStart`.
- The current Go server will automatically fall back to API-only mode when `STATIC_DIR` is missing, which is why local Vite development still works.
