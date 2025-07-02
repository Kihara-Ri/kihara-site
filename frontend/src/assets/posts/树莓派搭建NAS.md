---
title: 树莓派搭建NAS 
date: 2023-12-12
tags: 
  - 树莓派 
  - NAS 
  - internet 
  - Docker
categories: 
  - Log
---
# 🟠 NAS折腾日志

树莓派放在家里一直吃灰，刚好又不怎么想玩游戏，xss上的希捷2T移动硬盘直接拿下来做存储，树莓派刷`openmediavault`当云盘

<!-- more -->

目标：

- 实现云上上传下载存储
- 添加OLED显示器显示简单信息
- 做看番系统，磁力下载订阅番剧
- 接入公网，实现脱离局域网文件互传，摆脱一众网盘

方案：

- 个人云盘功能，用自己的服务器搭建网盘，常用的软件方案有nextcloud，seafile，可道云等

- 下载机功能，可随时下载资源，常用的软件方案有Transmission，aria2等媒体资源管理器，可以管理并且远程播放你的资源库，常用的软件方案有jellyfin，plex，emby等

## 搭建NAS系统

由于条件有限，目前只能找到一个树莓派4B和一个2T的移动硬盘，考虑采用开源的`openmediavault`作为NAS框架

在这之前，由于需要远程访问的功能，得考虑获得独立ip，这里我已经有了一个域名，这时就可以派上用场了

登录到树莓派后台，输入指令`sudo nano /etc/dhcpcd.conf`打开dhcp配置文件，将动态ip地址改为静态ip

![image-20230802155857483](https://mdstore.oss-cn-beijing.aliyuncs.com/image-20230802155857483.png)

`sudo reboot`进行重启



编辑hosts文件

```shell
sudo nano /etc/hosts
151.101.72.249 github.global.ssl.fastly.net
192.30.255.112 github.com
```



进行换源操作

修改Debian软件源

```shell
sudo nano /etc/apt/sources.list
deb http://mirrors.tuna.tsinghua.edu.cn/raspbian/raspbian/ buster main non-free contrib rpi
deb-src http://mirrors.tuna.tsinghua.edu.cn/raspbian/raspbian/ buster main non-free contrib rpi
```



```shell
sudo nano /etc/apt/sources.list.d/raspi.list
deb http://mirrors.tuna.tsinghua.edu.cn/raspberrypi/ buster main ui
```

将源换为清华源，这样的话在国内网络情况下访问会更快

`control+O`保存，`control+X`退出



不过经过我的实测，将源换为清华源后会出现个别报错导致后面无法正常安装

我的环境是具有代理的，因此可以不进行换源也能快速下载



随后进行更新

`sudo apt-get update`

`sudo apt-get upgrade`

更新完毕安装命令

```shell
wget -O - https://github.com/OpenMediaVault-Plugin-Developers/installScript/raw/master/install | sudo bash
```



安装过程大概需要等10min左右，安装好以后我们就可以进系统了

用户名：`admin`

密码：`openmediavault`

接下来，配置磁盘文件夹，实现局域网内的文件互传

## 局域网内文件互传

首先进入文件系统，选中我们的希捷移动硬盘，对其进行抹除，否则无法进行下一步

然后进行挂载

![图像2023-8-2 18.21](https://mdstore.oss-cn-beijing.aliyuncs.com/%E5%9B%BE%E5%83%8F2023-8-2%2018.21.jpg)

接下来，创建共享文件夹

![图像2023-8-2 18.22](https://mdstore.oss-cn-beijing.aliyuncs.com/%E5%9B%BE%E5%83%8F2023-8-2%2018.22.jpg)

启用SMB服务

![截屏2023-08-02 18.23.10](https://mdstore.oss-cn-beijing.aliyuncs.com/%E6%88%AA%E5%B1%8F2023-08-02%2018.23.10.png)

这里要注意在下面的共享中我们需要稍微编辑一下共享文件夹：

![图像2023-8-2 18.24](https://mdstore.oss-cn-beijing.aliyuncs.com/%E5%9B%BE%E5%83%8F2023-8-2%2018.24.jpg)

设置文件夹为`可浏览`，否则在macOS下将无法正确使用用户名密码登录，在Windows下将看不到共享文件夹

到这一步，局域网内文件互传已经配置好了，传输文件测试一下

![Screenshot 2023-08-02 175628](https://mdstore.oss-cn-beijing.aliyuncs.com/Screenshot%202023-08-02%20175628.png)

可见，网速还是挺一般的…

## Docker

### 设置omv-extras

- 修改openmediavault软件源

```shell
sudo nano /etc/apt/sources.list.d/openmediavault.list

deb https://mirrors.bfsu.edu.cn/OpenMediaVault/public/ usul main
deb https://mirrors.bfsu.edu.cn/OpenMediaVault/public/ usul-proposed main
deb https://mirrors.bfsu.edu.cn/OpenMediaVault/public/ usul partner
```

- 修改kernel-backports软件源

```shell
deb https://mirrors.tuna.tsinghua.edu.cn/debian/ buster-backports main contrib non-free
```

- 系统安全更新

```shell
deb https://mirrors.tuna.tsinghua.edu.cn/debian-security buster/updates main contrib non-free
# deb-src https://mirrors.tuna.tsinghua.edu.cn/debian-security buster/updates main contrib non-free
```

- OMV-Extras 扩展源

```shell
sudo nano /etc/apt/sources.list.d/omvextras.list

deb https://mirrors.bfsu.edu.cn/OpenMediaVault/openmediavault-plugin-developers/usul buster main
deb [arch=amd64] https://download.docker.com/linux/debian buster stable
deb http://linux.teamviewer.com/deb stable main
deb https://mirrors.bfsu.edu.cn/OpenMediaVault/openmediavault-plugin-developers/usul-testing buster main
deb https://mirrors.bfsu.edu.cn/OpenMediaVault/openmediavault-plugin-developers/usul-extras buster main
```



使用ssh连接，使用下面的命令

````shell
wget -O - https://github.com/OpenMediaVault-Plugin-Developers/packages/raw/master/install | bash
````

我这提示需要使用`sudo`命令，因此加上

````shell
wget -O - https://github.com/OpenMediaVault-Plugin-Developers/packages/raw/master/install | sudo bash
````

root权限也可以由以下方式开启：

在终端中输入

```shell
ssh 用户名@ip
```

由于直接登录root用户设置，所以直接输入

```shell
ssh root@ip
```

即可

这样就可以了，等待一会

系统栏下会出现一个`omv-extras`选项

系统提示我们缺少`openmediavault-compose`

## 树莓派启用root

可以使用普通用户登录，执行以下命令

```shell
sudo paasswd root
```

执行此命令后系统会提示输入两边root密码，接下来输入下面的命令来解锁root账户

```shell
sudo passwd --unlock root
```

用下面的命令切换到root管理员

```shell
su root
```

