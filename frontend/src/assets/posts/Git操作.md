---
title: Git操作 
date: 2023-12-13
tags: 
  - git 
  - github
categories: 
  - Technology
---
# Git操作

Git 常用命令，满足日常使用的绝大多数情况

<!-- more -->

## git初始化仓库

**初始化**

使用`git init`命令初始化一个git仓库

```shell
git init
```

git仓库会生成一个`.git`目录，该目录包含了资源的所有元数据，其他的项目目录保持不变

制定目录作为git仓库

```shell
git init gitrepo
```

这样的话，就会在`gitrepo`目录下出现`.git`

**追踪**

需要先用`git add`命令告诉git开始对文件进行追踪，然后提交

```shell
git add *.py
git add README
git commit -m "初始化版本"
```

第一个命令使用了通配符，将会将所有python文件加入追踪

第二个命令将README文件加入追踪

第三个命令将加入追踪的文件进行提交，`-m`参数后面可以增加备注，Linux系统中使用单引号`''`，在Windows系统中使用双引号`“”`，而macOS中貌似没有强制要求

**git clone**

`git clone`命令的格式如下

```shell
git clone <repo> <directory>
```

`<directory>`为本地仓库

**配置**

使用`git config`命令进行设置

显示当前的git配置信息

```shell
git config --list
```

编辑git配置文件

```shell
git config -e  # 针对当前仓库
git config -e --global  # 系统上所有的仓库
```

提交用户信息

```shel
git config --global user.name "<用户名>"
git config --global user.email <邮箱>
```

## git基本操作

git主要分为

- workspace
- staging area
- local repository
- remote repository

最简单的操作流程：

```shell
git init
git add .
git commit
```

常用命令

| 命令               | 说明                                   |
| ------------------ | -------------------------------------- |
| `git add`          | 添加文件到暂存区                       |
| `git status`       | 查看仓库当前状态，显示有变更的文件     |
| `git diff`         | 比较文件的不同，即暂存区和工作区的差别 |
| `git commit`       | 提交暂存区到本地仓库                   |
| `git reset`        | 回退版本                               |
| `git rm`           | 将文件从暂存区和工作区删除             |
| `git mv`           | 移动或重命名工作区文件                 |
| `git checkout`     | 分支切换                               |
| `git switch`       | 更清晰地切换分支                       |
| `git restore`      | 恢复或撤销文件的更改                   |
| `git log`          | 查看历史提交记录                       |
| `git blame <file>` | 以列表形式查看指定文件的历史修改记录   |
| `git remote`       | 远程仓库操作                           |
| `git fetch`        | 从远程获取代码库                       |
| `git pull`         | 下载远程代码并合并                     |
| `git push`         | 上传远程代码并合并                     |

## 分支管理

使用`git pull`拉取远程主机`origin`的`master`分支，与本地的`brantest`分支合并

```bash
git pull origin master:brantest
```

如果远程分支是与当前分支合并，则冒号后面的部分可以省略

```bash
git pull origin master
```

如果想要推送到`main`，则将`master`改为`main`

## gitignore

创建`.gitignore`使用`touch .gitignore`命令，在根目录创建`.gitignore`文件，然后写入不想被git追踪的项目即可

注意，这时那些不想被项目追踪的项目还在，如果之前已经推送到远程仓库了的话，仅仅添加了之后是不会删除的，要停止跟踪某个文件，但不将其从系统中删除，使用命令`git rm --cached <filename>`将暂存区文件删除

因此，如果有要取消跟踪的文件，首先提交任何未完成的代码更改，然后运行：
```shell
git rm -r --cached .
```

这条命令将会从暂存区，也就是索引中删除所有已经更改的文件，然后运行

```shell
git add .
git commit -m ".gitignore is now working"
```

## 如何参与别人的仓库

如果想向别人的仓库提交你自己的更改，通常需要通过创建一个拉取请求 (Pull Request) ，直接推送到别人的仓库通常是不被允许的

1. **Fork 仓库**，在别人的仓库中点击`Fork`，这样就可以克隆一个一模一样的在你自己的仓库界面下，并且会告诉你这个仓库与原作者的仓库有关联
2. 更改并提交，将Fork来的仓库通过ssh链接clone到本地后，进行更改然后提交，可以创建一个新的分支，比如我在进行一些更改后，将分支命名为

```shell
git checkout -b chromedriver
```

提交的时候注意分支

```shell
git push origin chromedriver
```

这样就成功在远程仓库中创建了一个新的分支，不过要注意，到此为止的修改仍然还只是你自己的仓库，从本地推送到了远程仓库，并没有向原仓库拥有者发起推送

<img src="https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/Screenshot%202023-12-13%20at%2016.15.27.png" alt="Screenshot 2023-12-13 at 16.15.27" style="zoom: 33%;" />

3. 发起拉取请求，这里的拉取请求是请求原仓库拉取你的库，点击黄色block中的绿色按钮可进入请求界面，在其中进行说明

<img src="https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/Screenshot%202023-12-13%20at%2016.24.02.png" alt="Screenshot 2023-12-13 at 16.24.02" style="zoom:33%;" />

成功了之后如上图所示
