---
title: Ubuntu使用ssh密钥登录服务器
date: 2024-03-10
tags: 
  - ssh
  - ubuntu
categories: 
  - Log
---

# Ubuntu 使用ssh密钥登录服务器

介绍如何快速在Linux系统上生成密钥，并且使用其与GitHub进行通信

<!-- more -->

## 流程

1. 使用`ssh-keygen`命令生成ssh密钥，采用`ed25519`算法
2. 密钥的保存位置在`/home/usrname/.ssh/`目录下，如果没有这个目录就创建一个
3. 将公钥保存在服务器上，如果需要，为私钥提供读写权限
4. 添加私钥路径在`config`中

## 具体操作

### 生成密钥

首先生成密钥：

```bash
ssh-keygen -t ed25519 -C "any words that you want to keep"
>>
Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/kihara/.ssh/id_ed25519):
```

这里提示保存的文件路径，如果使用默认的名称则会以`id_ed25519`保存，这有可能会覆盖之前以同样方式生成的密钥

这一步我们就得到了公钥和私钥，有`.pub`的是公钥，我们需要把公钥上传到服务器

### 上传服务器

对于一般的服务器，我们可以以这样的方法上传：

```bash
ssh-copy-id -i ~/.ssh/<公钥> username@ip
```

这里的`-i`参数表示 identity file，用以验证身份

上传至服务器的具体操作看下面的视频有详细讲解：

 <iframe width="560" height="315" src="//player.bilibili.com/player.html?aid=1000800556&bvid=BV1Sx4y1y7B2&cid=1448122038&p=1&autoplay=0&muted=true" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>

#### 上传Github

对于上传GitHub的密钥，需要在[https://github.com/settings/profile](https://github.com/settings/profile)上的`SSH and GPG keys`栏中添加新的 SSH key

复制公钥

```bash
cat github_key.pub
```

在macOS上也可以这样直接将文本内容复制到剪贴板

```bash
pbcopy <  ~/.ssh/github_key.pub
```

将显示的公钥复制到GitHub上保存

现在，GitHub服务器就知道我们的公钥了，我们可以通过上面的`-i`参数来传递私钥访问GitHub服务器，但是这还是有点麻烦，现在在`.ssh`目录下创建`config`文件（如果没有的话）

```bash
vim config
```

在文件中添加私钥路径`IdentityFile ~/.ssh/github_key`，或者可以用下面的命令

```bash
echo "IdentityFile ~/.ssh/github_key" >> config
```

这样，我们在进行ssh的时候就会自动读取私钥

```bash
$ ssh -T git@github.com
The authenticity of host 'github.com (20.205.243.166)' can't be established.
ED25519 key fingerprint is SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'github.com' (ED25519) to the list of known hosts.
Hi Kihara-Ri! You've successfully authenticated, but GitHub does not provide shell access.
```

#### 阿里云服务器

在阿里云服务器中，有一个`.pem`的密钥文件，我们从密钥对中生成，然后下载到本地，将这个文件保存到`.ssh`目录下，现在它的名字是`cloudware_WSL.pem`

然后，我们还要给这个密钥文件读写权限：

```bash
sudo chmod 600 cloudware_WSL.pem
```

这个命令表明只有文件拥有者拥有读写权限

最后将ssh信息加入到`config`文件中：

```bash
cat <<EOF >> config
Host cloudware
  HostName <ip>
  User root
  Port 22
  IdentityFile /home/kihara/.ssh/cloudware_WSL.pem
EOF
```

现在我们只需要输入服务器的Host名称就可以正常访问了！

```bash
ssh cloudware
```
