---
title: blog文章构建脚本 
date: 2023-12-16
tags: 
  - python 
  - shell
categories: 
  - Log
---

# blog文章构建脚本

写blog文章的时候写着写着，需求就来了，如果每次写文章之前，都要从以前的文章复制头文件配置，这是否有点太麻烦了，而且还容易出错，所以我就想，干脆写个脚本干这事多方便，快捷精准，其实也花不了多少时间

<!-- more -->

本篇文章由该脚本辅助完成：

```shell
$ blog blog文章构建脚本 -c log -t python\ shell
日志 '2023-12-16-blog文章构建脚本.md' 创建成功
点击 /Users/kiharari/kiharablog/zolan/_posts/2023-12-16-blog文章构建脚本.md 查看
```

在macOS下按住`⌘command`点击路径就能直接开始编辑，非常方便😋

## add_blog.py

```python
import os
import sys
from datetime import datetime

global directory
directory = "/Users/kiharari/kiharablog/zolan/_posts"

def create_markdown_file(title, category, tags):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S %z")
    content = f"""---
layout: post
title: {title}
date: "{timestamp} +0800"
image: 
category: {category}
tags: {tags}
---"""
    return content

def write_to_file(file_path, content):
    with open(file_path, 'w') as file:
        file.write(content)

def create_blog(title, category, tags):
    day = datetime.now().strftime("%Y-%m-%d")
    file_name = f"{day}-{title.replace(' ', '_')}.md"
    content = create_markdown_file(title, category, tags)

    file_path = os.path.join(directory, file_name)

    write_to_file(file_path, content)
    print(f"日志 '{file_name}' 创建成功")
    print(f"点击 {file_path} 查看")

def main():
    if len(sys.argv) < 2:
        print("Usage: blog <title> [-c <category>] [-t <tags>]")
        sys.exit(1)

    title = sys.argv[1]
    category = ""
    tags = ""

    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == '-c':
            i += 1
            category = sys.argv[i]
        elif sys.argv[i] == '-t':
            i += 1
            tags = sys.argv[i]
        else:
            print(f"Invalid option: {sys.argv[i]}")
            sys.exit(1)
        i += 1
        
    create_blog(title, category, tags)

if __name__ == "__main__":
    main()

```

将`add_blog.py`放到`~/`目录中，给予可执行权限`chmod +x add_blog.py`

## blog命令

因为参数的判断全都在python脚本中，`blog`shell命令就很简单

```shell
#~/bin/bash

python3 ~/add_blog.py "$@"
```

同样不要忘了给予可执行权限`chmod +x add_blog.py`

移动到路径中

```shell
mv blog /usr/local/bin
```

## 一些要注意的地方

也算是我踩过的一点点小坑吧

写入的内容`content`的格式是严格限定的

```python
	content = f"""---
layout: post
title: {title}
date: "{timestamp} +0800"
image: 
category: {category}
tags: {tags}
---"""
```

- 头三个`–-`必须严格跟在`”“"`后面，如果换行那么就会从第二行开始，这样就失效了，在markdown中会变成别的语法

- 可以看到变量名`content`处是有缩进的，下面的都不能缩进，因为这是`yaml`的语法，对缩进有限制，如果加了缩进就会导致不识别，无法完成网站推送

- 我使用了全局变量`directory`来保存文件目录，这没有任何问题，但是要注意的是，如果在用户目录下，是不能用`~/`替代的，要写全路径，直接在用户目录下用`pwd`命令，然后复制即可