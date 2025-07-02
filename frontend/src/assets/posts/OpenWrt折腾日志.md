---
title: OpenWrt折腾日志
date: 2023-12-11
tags: 
  - openwrt
  - internet
  - hardware
categories: 
  - Log
---

# OpenWrt折腾日志

买了一个R2S刷OpenWrt作软路由，简要记录一下折腾过程

<!-- more -->

## 树莓派单网口旁路由

## R2S软路由

固件采用的是下面的链接中的：

[https://github.com/biliwala/nanopi-openwrt/releases](https://github.com/biliwala/nanopi-openwrt/releases)



## 端口转发

在折腾openmediavault的时候由于未知问题插件一直装不上，所以一直没有进展，突然想到还有一件很重要的事没解决：如何从外网访问内网设备呢？

基本解决思路就是

1. 开启域名解析服务，将目前得到的动态ip与域名进行绑定
2. 在OpenWrt中开启动态DNS(DDNS)服务
3. 进行端口映射，将需要的服务端口映射到80端口上



### 域名解析

我这里使用的是阿里云的域名

进入域名控制台，在域名列表中找到需要进行解析的域名，在右侧点击`解析`

随后在以下界面填写信息

<img src="https://mdstore.oss-cn-beijing.aliyuncs.com/202308061758268.png" alt="截屏2023-08-06 17.57.54" style="zoom:33%;" />

主机记录填`@`就行，记录值填写目前自家网关的ip地址

### 开启DDNS

进入OpenWrt后台，在服务栏下的动态DNS中修改ipv4

<img src="https://mdstore.oss-cn-beijing.aliyuncs.com/202308061801628.png" alt="截屏2023-08-06 18.01.14" style="zoom:33%;" />

`启用`勾选☑️

查询主机名可以不填，目前我也没搞明白可以填什么🤔

DDNS服务提供商选择`aliyun.com`

域名填写上面解析的域名

用户名和密码为阿里云提供的AccessKey

```python
Access key id:
your id
Secret:
your key
```

完成后保存

### 端口映射

OpenWrt系统默认关闭了web访问，需要手动开启，取消勾选即可

<img src="https://mdstore.oss-cn-beijing.aliyuncs.com/%E6%88%AA%E5%B1%8F2023-08-06%2017.48.45.png" alt="截屏2023-08-06 17.48.45" style="zoom: 25%;" />

随后进入网络->防火墙->端口转发

<img src="https://mdstore.oss-cn-beijing.aliyuncs.com/%E6%88%AA%E5%B1%8F2023-08-06%2018.07.37.png" alt="截屏2023-08-06 18.07.37" style="zoom:25%;" />

添加转发规则，因为80、443端口被运营商封锁，所以需要用到端口转发

- 传输协议可以选择TCP，选择TCP+UDP也可以，如果是NAS的话则全选
- 外部区域选择wan
- 外部端口尽量选择1024以上的端口，避免占用别的进程
- 内部区域选择lan
- 内部ip地址对应内网设备
- 内部端口填80

这里我配置了两个端口转发

<img src="https://mdstore.oss-cn-beijing.aliyuncs.com/%E6%88%AA%E5%B1%8F2023-08-06%2018.11.54.png" alt="截屏2023-08-06 18.11.54" style="zoom:20%;" />

这里可以看到我成功使用域名访问了路由器后台