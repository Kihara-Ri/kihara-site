# Deploy Notes

The checked-in files in this directory are templates, not the exact live configuration on the current host.

- `nginx/kihara-site.conf`: generic Nginx reverse-proxy example
- `systemd/kihara-site.service`: generic systemd unit example

## Current live shape

The active machine currently deploys to:

```text
~/.deployments/kihara-site-stable/
  backend/
    articles/
    tag_config.yaml
  frontend-dist/
  release/
    kihara-site
```

The running service is `kihara-site.service`, and its override points `STATIC_DIR` at the external `frontend-dist` directory.

Nginx terminates TLS and proxies `kihara.cn` traffic to `127.0.0.1:8080`.

## Recommended release flow

Run the repo-level deploy command:

```bash
npm run deploy
```

That command will:

1. Build the frontend and backend
2. Sync the binary, article content, and tag config into the live deployment directory
3. Sync `frontend/dist/` into the external `frontend-dist` directory
4. Restart `kihara-site.service`
5. Verify the local service endpoint and `nginx -t`

## Notes

- The Go binary embeds frontend assets, but the live service currently prefers `STATIC_DIR`.
- If you change the live deployment root, update the systemd override or pass a different `DEPLOY_ROOT` to `npm run deploy`.
