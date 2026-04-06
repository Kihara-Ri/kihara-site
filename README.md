## 需要修改的地方

- 音乐页面的模态窗口关闭按钮在浅色模式下需要修改颜色
- 专辑价格的地方需要带上货币的单位
- 换行符`\n`不生效


部署目录

```bash
sudo mkdir -p /opt/kihara-site/release
sudo mkdir -p /opt/kihara-site/backend

sudo cp release/kihara-site /opt/kihara-site/release/
sudo cp -r backend/articles /opt/kihara-site/backend/
sudo cp backend/tag_config.yaml /opt/kihara-site/backend/

sudo chown -R www-data:www-data /opt/kihara-site
sudo chmod +x /opt/kihara-site/release/kihara-site
```
