---
title: 多个python的解决方案 
date: 2023-12-14
tags: 
  - python 
  - shell
categories: 
  - Log
---

# 多个Python的解决方案

刚开始编程的时候，作为初学者，总是会犯各种各样的错误，并且出了问题也不知道怎么办，经常寻求网络上各种质量层次不齐的帖子，用尽各类土方法，有时能解决问题，但是治标不治本，有时甚至会让事情变得更糟，并且很多方法并没有进行详尽的说明，很多时候知其然不知其所以然，导致出了别的问题根本无法修复，最后，我们可能会碰到这种情况：

<img src="https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/Screenshot%202023-12-12%20at%2022.16.54.png" alt="Screenshot 2023-12-12 at 22.16.54" style="zoom: 33%;" />

安装了一堆python，相同版本的不同版本的各种路径的都有，这真的让人很头疼😨，并且python与pip的管理已经乱套了，想使用的python版本使用pip命令安装模块根本对不上。通常情况下，我们只会使用一个特定版本的python，本文以我的实际遭遇为例，我会给出抛出几个问题，并且给出解决方案

<!-- more -->

## pip3 与 python3

大部分情况下我们看到的命令都是以`pip`和`python`的形式出现的，但是有时安装后会发现直接这样输入命令会提示不存在命令，要输入`pip3`和`python3`才能正常调用命令，这虽然差别不大，但是总让人觉得别扭，并且在实际情况下，你是不能直接复制粘贴执行别人的代码的，你还得动一下鼠标键盘，加上这可恶的数字3，这无疑会非常影响命令执行效率和心情，如果反复报错，就感到厌烦了

**更新有时可以解决问题**，尝试更新pip和python

**如果更新也解决不了**，可以采用别名的方式，即在命令行中输入`pip`，实际上系统会认为这是`pip3`，在命令行中输入：

```shell
vim ~/.zshrc
```

这会打开用户目录下的隐藏文件`.zshrc`，这是macOS系统下命令行打开前会执行的优先级最高的文件，添加这两行：

```shell
alias pip="pip3"
alias python="python3"
```

## pip安装模块至特定版本python

以我的情况为例，我想使用`python3.12`，并且它的目录是`/usr/local/bin/python3.12`

但是我的`pip`命令却是在`/opt/homebrew/`或者别的其他目录下，现在我输入命令：

```shell
$ pip -V
pip 23.3.1 from /Library/Frameworks/Python.framework/Versions/3.12/lib/python3.12/site-packages/pip (python 3.12)
```

可以发现，尽管python的版本是相同的，但是这两个相同版本的python却在不同目录下，因此使用`pip`命令时并不能为我所希望使用的python安装模块

> 通常情况下，在python官网下载的python的目录会在/usr/local/bin/下，而使用homebrew命令安装的python和pip，虽然更快捷简便，但是安装目录会在/opt/homebrew/中

具体确认可以使用`which python`和`python -V`等命令

如果要为特定版本的python安装模块，需要使用以下命令：

```shell
/usr/local/bin/python3.12 -m pip install selenium
```

指定了目录，这样`selenium`模块就会被正确地安装在我们所希望的`python3.12`中了

如果为了更加方便，还可以这样做：

```shell
vim ~/.zshrc
# 设置python别名
alias python="/usr/local/bin/python3.12"
# 将特定版本pip安装命令简化为pip
alias pip="/usr/local/bin/python3.12 -m pip"
# 将python3.12引入PATH
export PATH="/usr/local/bin/python3.12:$PATH"
```

最后按下␛使用`:wq`保存退出vim，如果该文件为只读，使用`:wq!`