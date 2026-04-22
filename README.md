## 当前部署方式

生产环境当前由 Nginx 反向代理到本机 `127.0.0.1:8080`，真正提供服务的是 `kihara-site` 的 systemd 服务。

- Nginx 入口：`/etc/nginx/sites-available/public-entry`
- systemd 服务：`kihara-site.service`
- 实际发布目录：`~/.deployments/kihara-site-stable`
- 外置前端目录：`~/.deployments/kihara-site-stable/frontend-dist`

## 一键部署

仓库已经提供了和当前机器实际环境一致的脚本：

```bash
npm run deploy
```

这条命令会完成下面几件事：

1. 先执行 `npm run build`
2. 同步 `release/kihara-site`
3. 同步 `backend/articles/` 和 `backend/tag_config.yaml`
4. 同步 `frontend/dist/` 到 `~/.deployments/kihara-site-stable/frontend-dist`
5. 重启 `kihara-site.service`
6. 校验本机 `127.0.0.1:8080` 和 `nginx -t`

## 可选环境变量

```bash
DEPLOY_ROOT=/home/kihara/.deployments/kihara-site-stable \
SERVICE_NAME=kihara-site \
PORT=8080 \
npm run deploy
```
