---
title: 自动计数脚本
date: 2024-04-19
tags: 
  - Python
  - shell
  - GitHub
categories: 
  - Log
---

# 🟠 Python | 自动计数脚本

实际上是对`github hook`的使用教程

<!-- more -->

写文档的时候突然有个想法，如果能用命令行程序统计我写的字数就好，这样看着每天不断增加的字数，坚持用英文写作表达的热情都高了不少，那么就试试吧，花了两个小时写了这样一个小脚本，它会自动检查脚本执行的路径，并且正确统计目录下的markdown文件的总字数，更方便的一点是，由于我的文档是托管在GitHub上的，每次我进行commit操作，这个脚本都会自动执行，然后把统计的字数更新在`README.md`文档中。这个脚本用到了一些小工具，如正则表达式、复杂命令行、shell进阶知识、GitHub工作流等。代码很不简洁，但是很清晰，主要是对我最近所学的一些训练。以下简单说明功能：

1. 检测路径统计`.md`字数
2. 更新写入`README.md`
3. 每次commit自动运行

源码地址：[word_count.py](https://github.com/Kihara-Ri/Musings/blob/main/word_count.py)

## 实现原理

### 函数解析

首先写好基本逻辑

- 定义`check_directory`函数方法检查当前目录

如果不是目标目录则自动跳转（跳转使用到了另一个函数方法），这个函数很重要，因为很多操作都要求在当前目录下进行。使用了正则表达式匹配寻找仓库的路径，如果发现当前shell的路径不在仓库中，那么就会自动切换，这里假设的前提是仓库名称是唯一的（一般情况下也是这样的），因此如果有不同路径下同名的文件夹就不一定能得到希望的结果

- 定义`change_dir`跳转到目标目录

给定参数为仓库文件夹名称，在这里使用了`find`命令来查找目标文件夹，但是因为权限问题只默认查找用户目录下的`Documents`, `Downloads`, `Desktop`三个文件夹（因为我是mac用户）。这里有一个细节我使用的是`subpross.run`而不是`os.system`，因为`os.system`不能更改Python脚本的工作目录，它会在一个子shell中运行

此外还有一个有意思的地方是这一条命令：

```bash
find ~/Documents -name "Musings" | xargs cd
```

这条命令看上去好像并没有问题对吧，我将找到的`Musings`的路径作为参数传递给`cd`命令，让他帮我自动跳转到这个目录下，但是实际上你运行这条命令的时候，shell并不会帮你跳转到目标目录，原因在于`xargs`实际上会为每个输入启动一个新的子进程来执行`cd`命令，即使 `cd` 被成功执行并更改了子进程的工作目录，这个变更也只限于该子进程，它并不会传递回你的原始shell，而正确的做法应该是这样：

```bash
cd "$(find ~/Documents -type d -name 'Musings' -print -quit)"
```

这是我个人认为比较有意思的点，目前我还没有见过有人提到这种类型的问题过

此外这个函数中还有一个细节，我在路径的使用时标注了`~`，并且开启了`shell = True`，因为将`~`展开为用户路径是shell的特性，如果没有开启shell，命令行程序就不认识这个路径

- 定义`count_words`递归遍历所有的`.md`文件，这个函数没什么值得讲的

- 定义`update_readme`来更新`README.md`，实际上就是把文档中的字符以行为单位读了一遍然后记录下来，再用数组的方式更改某一行，其他的保持不变

### pre-commit

最后一点值得说一下的就是提交到GitHub前的自动化了，我们需要找到`.git/hooks/pre-commit`，如果没有那么我们就需要复制一份sample

```bash
cp pre-commit.sample pre-commit
```

然后在这个脚本下面添加一条命令：

```bash
find ~/Documents ~/Downloads ~/Desktop -path '*/Musings/word_count.py' | xargs python
```

这条命令会在上面的三个文件夹中寻找这个脚本文件，然后返回路径，将这个路径作为标准输入传递给python执行，这样每次要进行commit的时候，这个`pre-commit`脚本都会先执行一次，完成我们的脚本功能

推送到GitHub后就是这样的了：

<img src="https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/Snipaste_2024-04-19_20-24-29.png" alt="Snipaste_2024-04-19_20-24-29" style="zoom: 25%;" />
