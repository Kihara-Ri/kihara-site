---
title: Linux | 获取网络内容
slug: linux-2
date: 2023-12-16
tags:
  - tooling
---

# 🟠 cURL命令

认识cURL命令

蛋老师在这块的入门教程中讲得非常言简意赅

<!-- more -->

## 简单使用

简单的命令：

```shell
curl URL
```

测试能否与目标进行连接，还可以返回对方相应的资源，如果请求的是API，返回的结果就是API里 POST 的数据了

`curl`默认发送GET请求，添加`-X -POST`来发送POST请求

```shell
curl -XPOST URL -d <data>
```

更新数据

```shell
curl -XPUT URL -d <data>
```

删除数据

```shell
curl -XDELET URL -d <data>
```

HTTP首部

```shell
curl -XPOST URL -H <data> 
```

`-I`

```shell
$ curl -I https://www.bilibili.com
HTTP/2 200
date: Sat, 16 Dec 2023 14:31:00 GMT
content-type: text/html; charset=utf-8
support: nantianmen
vary: Origin,Accept-Encoding
idc: shjd
expires: Sat, 16 Dec 2023 14:30:59 GMT
cache-control: no-cache
x-cache-webcdn: MISS from blzone02
x-cache-time: 0
x-save-date: Sat, 16 Dec 2023 14:31:00 GMT
```

`-O`

下载目标文件到当前目录

```shell
curl -o <文件名> URL
```

下载大文件`--limit-rate`用来限制下载速度

`-L`跟随重定向

`-v`用于调试

`–proxy`设置代理

## References

1. https://curl.se/docs/tutorial.html
2. https://www.ruanyifeng.com/blog/2011/09/curl.html
3. https://www.ruanyifeng.com/blog/2019/09/curl-reference.html
4. https://www.bilibili.com/video/BV1n94y1U7Eu/