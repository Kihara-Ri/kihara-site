---
title: Linux 设置服务
slug: linux-5
date: 2024-06-15
tags:
  - tooling
---

# 🟠 Linux设置服务

最近在Linux系统上折腾各种程序，自然而然就想到了一个问题：怎么让程序开机自动启动，而不需要人来手动开启？这一点在Windows和Mac端非常容易，因为这些程序总是抢着设置开机自启动，然而这在Linux下显然不是这样的，因为你即使关掉shell窗口，都会导致很多程序停止运行，这一点我们之前碰到过很多次了，也非常容易解决，而这次的开机自启动，我们需要进行额外的配置

<!-- more -->

## 创建流程

需要设置启动命令，我们要创建一个`systemd`服务单元(Service Unit)文件，位于`/etc/systemd/system`，我们通过以下命令可以查看目录下有多少个服务文件：

```bash
ls /etc/systemd/system/ | grep .service
```

现在我们尝试为`mkdocs`创建一个服务单元文件：

```bash
sudo vim /etc/systemd/system/mkdocs.service
```

在文件中添加下面的内容：

```ini
[unit]
Description=Mkdocs Documentation Server
After=network.target

[Service]
User=orangepi
ExecStart=/home/orangepi/.local/bin/mkdocs serve -a 0.0.0.0:8000
Restart=on-failure
WorkingDirectory=/home/orangepi/Documents/kihara-ri.github.io

[Install]
WantedBy=multi-user.target
```

这些内容是什么意思我们暂且不管，我们先看看接下来如何进行配置。现在我们就已经算创建好了一个服务，需要重新加载一下`systemd`配置：

```bash
sudo systemctl daemon-reload
```

接着，启动并测试MkDocs服务：

启动：

```bash
sudo systemctl start mkdocs
```

查看服务状态：

```bash
sudo systemctl status mkdocs
```

设置Mkdocs服务开机自动启动：

```bash
sudo systemctl enable mkdocs
```

重启后我们访问一下状态：

```bash
$ sudo systemctl status mkdocs
[sudo] password for orangepi: 
● mkdocs.service
     Loaded: loaded (/etc/systemd/system/mkdocs.service; enabled; vendor pres>
     Active: active (running) since Mon 2024-07-15 14:27:11 UTC; 35s ago
   Main PID: 917 (mkdocs)
      Tasks: 1 (limit: 4519)
     Memory: 62.4M
        CPU: 24.546s
     CGroup: /system.slice/mkdocs.service
             └─917 /usr/bin/python3 /home/orangepi/.local/bin/mkdocs serve -a>

Jul 15 14:27:11 orangepi3b systemd[1]: Started mkdocs.service.
Jul 15 14:27:23 orangepi3b mkdocs[917]: WARNING -  Config value 'dev_addr': T>
Jul 15 14:27:23 orangepi3b mkdocs[917]: INFO    -  Building documentation...
Jul 15 14:27:23 orangepi3b mkdocs[917]: INFO    -  Cleaning site directory
Jul 15 14:27:47 orangepi3b systemd[1]: /etc/systemd/system/mkdocs.service:1: >
```

可以发现`mkdocs`服务已经正常启动了

## 服务单元

服务单元文件是`systemd`中用于定义和管理系统服务的配置文件，每个服务单元文件都包含有关如何**启动**，**停止**和**管理**服务的指令，想了解更多，请参考：[What is systemd?](https://www.linode.com/docs/guides/what-is-systemd/)

**[Unit]**：描述服务单元的元数据和依赖关系

```ini
[Unit]
Description=简要描述服务的作用
Documentation=服务相关文档的URL
After=依赖的其他服务或目标
Wants=配置非必须依赖
```

**[Service]**：定义如何启动和管理服务

```ini
[Service]
Type=服务类型: (simple, forking, oneshot, dbus, notify, idle)
ExecStart=启动服务的命令
ExecStop=停止服务的命令(可选)
ExecReload=重新加载服务的命令(可选)
Restart=服务崩溃后的重启策略: (on-failure, always, etc.)
User=运行服务的用户
WorkingDirectory=服务的工作目录
Environment=环境变量设置
```

- `Type`：服务类型，常见的类型有：
  - `simple`: 默认类型，`ExecStart`指定的进程为主进程
  - `forking`: `ExecStart`进程会创建出一个子进程并退出，子进程成为服务的主进程
  - `oneshot`: 服务一次性任务，通常在`ExecStart`完成后即退出
  - `notify`: 主进程在启动完成后会通知 `systemd`
- `ExecStart`: 启动服务的命令
- `ExecStop`: 停止服务的命令(可选)
- `ExecReload`: 重新加载服务的命令(可选)
- `Restart`: 重启策略，如服务崩溃后自动重启
- `User`: 运行服务的用户
- `WorkingDirectory`: 服务的工作目录

**[Install]**：定义服务单元的安装行为，通常用于设定服务在特定的目标(如系统启动)时启动

```ini
WantedBy=multi-user.target
```

`WantedBy`指定服务的目标，通常是`multi-user.target`，表示服务在多用户模式下启动

## systemctl命令

`systemctl`是用来控制`systemd`系统和服务管理器的命令行工具，主要负责在系统启动时启动和管理系统进程，基本命令如下：

```bash
# 启动
sudo systemctl start <service_name>

# 重启
sudo systemctl restart <service_name>

# 停止
sudo systemctl stop <service_name>

# 重新加载
sudo systemctl reload <service_name>
# 重新加载服务的配置文件，不是停止服务

# 启用服务
sudo systemctl enable <service_name>
# 设置服务在系统启动时自动启动

# 禁用服务
sudo systemctl disable <service_name>
# 禁止服务在系统启动时自动启动

# 查看服务状态
sudo systemctl status <service_name>

# 列出所有服务
sudo systemctl list-units --type=service

# 查看系统的整体状态
sudo systemctl status

# 查看系统启动日志
sudo journalctl -b

# 重新启动系统
sudo systemctl reboot

# 关闭系统
sudo systemctl poweroff

# 挂起系统
sudo systemctl suspend

```

在修改了任何`systemd`单元文件后，需要使用下面的命令重新加载`systemd`配置

```bash
sudo systemctl daemon-reload
```

## Docker容器中运行的程序

对于一些运行在Docker中的程序，如[AutoBangumi](https://www.autobangumi.org/deploy/quick-start.html)，我们仍然有办法让它开机自动启动：

```bash
sudo vim /etc/systemd/system/auto_bangumi.service
```

这里，我们要区分一下容器和镜像的区别，我们在创建容器的时候，使用的命令是`docker run`，现在我们有了容器，我们就不必再创建一个新的了，因此我们使用`docker start`

使用简单的命令查看docker状态和操作：

```bash
# 查看镜像
docker images

# 查看所有容器
docker ps -a

# 停止容器
docker stop CONTAINER_ID or NAME

# 启动容器
docker start CONTAINER_ID or NAME
```

现在我们就可以开始配置服务单元文件了：

```ini
[Unit]
Description=Auto Bangumi Docker Container
After=docker.service
Requires=docker.service

[Service]
Restart=always
ExecStart=/usr/bin/docker start -a AutoBangumi
ExecStop=/usr/bin/docker stop -t 2 AutoBangumi

[Install]
WantedBy=multi-user.target
```

然后：

1. 重新加载配置
2. 启动服务
3. 查看服务状态
4. `enable`开机自启动



