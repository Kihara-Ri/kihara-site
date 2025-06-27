# 开发日志

## 6/16

完成加载组件的时候通过ip请求第三方API，随后返回ip所在地位置信息。功能正常，但是没有到公网环境下实装，有待测试

## 6/17

完成月份热力图的样式，随后就是加交互了，我希望鼠标悬浮在某一天的方块上时能够出现模态窗口显示当天的日志，当点击的时候跳转至整个月的日志html，但是有对应日期的锚点

## 6/18

简单解析 markdown 文件并转换为 html

遍历 `diary/` 目录中所有形如 `YYYY-M.md` 格式的文件，每个文件生成一个对应的 `YYYY-M.html` 页面

提取每天的日志并生成锚点跳转 `(id="M-D")` 用于前端跳转

所有 HTML 页面统一输出到 `public/diary/`

稍微有点不顺利的地方就是使用 TypeScript 写解析脚本的时候半天配置不好直接运行ts的方案，最后还是得先编译一次成js然后再运行js，有点略显笨重

- [ ] 热力图跳转改用 React Router 而非直接跳转
- [ ] 解析脚本最好能够判断哪些文件是被编辑过的，对于没有变过的文件，选择跳过不解析

## 6/19

部署采用 Nginx 进行静态托管和反向代理，我在一天之内踩了很多坑，也总算是明白了 Nginx 的内在逻辑了，听再多的课、再详细的讲解，都不如自己实际操作几次出几次错来得印象深刻

托管页面和反向代理配置:

`/etc/nginx/sites-available/personal-site`

```config
server {
  listen 8000;
  server_name kihara.cn;

  root /var/www/personal-site/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://localhost:8080; # 🌟 最后出现 404 Not found 的罪魁祸首！去掉最后的斜杠
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```
总配置文件:

`/etc/nginx/nginx.conf`

```config
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
  worker_connections 1024;
}

http {
  include mime.types;
  default_type application/octet-stream;

  sendfile on;
  keepalive_timeout 65;

  include /etc/nginx/sites-enabled/*;
}
```

Nginx 中的这两个配置很重要：

```config
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

它能决定我的后端是否能查到访问者的真实IP。 Nginx 在做反向代理时，所有请求都是从 Nginx 发给后端的，所以需要有:
```go
r.RemoteAddr
```
这个字段显示的是 Nginx 自己的地址，回环地址(`127.0.0.1`或`::1`)，同时 Nginx 会在请求头中自动加上一个 `X-Forwarded-For` 的头部，用于传递原始客户端IP，因此在后端只需要像这样获取IP即可:
```go
ip := r.Header.Get("X-Forwarded-For")
```

后端添加日志记录功能，后续还可以扩展 LogAccess 函数：

- 写入 JSON 格式
- 写入数据库（如 SQLite）
- 增加 Geo 信息记录
- 分析请求频率或恶意访问

后台运行
nohup ./backserver > ~/logs/back.log 2>&1 &

## 6/20

地球3D模型

为地球周围添加一圈光晕

优化两点连线的效果

## 6/21

可以将这些样式添加到 App.css 或按模块拆分。进一步优化：

✅ 输入框回车发送 + Shift 回车换行

✅ 加载动画 / “正在思考中...”

✅ 聊天气泡风格的消息记录

## 6/24



## 6/25

页脚自适应吸底:
- 内容较短: 页脚自动贴到视口底端 (距底部仍保留 40px 的空隙)
- 内容较长: 页脚随文档流正常下推, 滚动带最底部才看到

- [ ] framer motion ?
- [ ] 对大模型聊天记录提供星号标记
- [ ] NavBar 鼠标悬浮下拉窗口
- [ ] 自己写一个简易的 markdown 文件转义器

## 6/27

二级路由，嵌套路由，只是逻辑上声明了存在，但是没有说组件渲染在哪，需要自己显示声明，使用 `<Outlet />`

博客文档方案使用 MDX

读书卡片从外部导入读书数据，可以在卡片内部声明一个`export`的接口，然后让数据引用，后续加上管理后台以后再变成 json 格式, 或用 CMS 拉取再生成

默认导入/出和具名导入/出，一直分不清也没看到有人讲