# 高频使用的Linux命令

如果不记得命令中某些参数的含义，使用`tldr`快速查询实例, 使用`man`查看详细解释(但是有点难懂), 在 [explainshell](https://explainshell.com/) 中可以获得更好的解释

## 日常使用

下面的内容来源于 [the-art-of-the-command-line](https://github.com/jlevy/the-art-of-command-line) ，关于这个仓库，还有更多相关链接信息

++tab++ 自动补全参数

++ctrl+w++ 删除键入的最后一个单词

++ctrl+u++ 删除行内光标所在位置之前的内容

++ctrl+k++ 删除光标至行尾的所有内容

++alt+b++ 和++alt+f++ 可以以单词为单位移动光标

++ctrl+a++ 可以将光标移至行首

++ctrl+e++ 可以讲光标移至行尾

使用`!$`/`$_`查看上次输入的参数，`!!`查看上次键入的命令，更多内容查看`man`中的`history expansion`


## 批量移动文件

```bash
ls '[VCB-S&philosophy-raws][Ghost in the Shell：STAND ALONE COMPLEX]'* | xargs -I {} mv {} ./Season\ 1/
```

使用`ls`命令找出有上述前缀的文件，通配符`*`匹配一切后面的内容，然后通过`pipe`命令传递给`xargs`命令

`xargs -I`的含义是，对于输入的每一行结果，都将它们逐行作为参数替换到一个占位符中，上面的命令中使用的是`{}`，我们也可以用其他的符号来代替，比如下面的命令就用了`_`：

```bash
<前面的命令> | xargs -I _ <command> _ <其他可选参数>
```

这样就表明我们将前面命令输出的内容移动到了指定的想让它出现的位置了，有点**定语从句**的感觉

## 查询目录下的文件数量

```bash
ls -1 | wc -l
```

`ls -1`命令将每个文件按行列出，然后使用`wc -l`计数行数

## 查看程序状态

**查看服务**

所有启动的服务

``` bash
systemctl list-units --type=service --state=running
```

所有服务, 包括未启动的

``` bash
systemctl list-units --type=service
```

查看服务状态

``` bash
systemctl status <service-name>
```

**查看端口占用情况**

``` shell
netstat -tlunp | head
```

## grep 命令活用

`grep`命令的含义为: **global regular expression print**[^1]

[^1]: 来源: [Using Grep & Regular Expressions to Search for Text Patterns in Linux](https://www.digitalocean.com/community/tutorials/using-grep-regular-expressions-to-search-for-text-patterns-in-linux)

忽略大小写 (case) : `-i`/`--ignore-case`

反向匹配 match lines that **DO NOT** contain a specified pattern: `-v`/`--invert-match`

添加匹配出现的行数: `-n`/`--line-number`



### 正则表达式匹配

对于正则表达式匹配，我们可以使用`grep`命令加上`-E`参数，这个命令的功能非常强大

**匹配所有以`.md`结尾的文件**

``` bash title="以md结尾的文件"
ls | grep -E "./md$"
```

**查看当前进程数**

=== "grep 正则匹配"

    ``` bash
    ls /proc | grep -E "^[0-9]+$" | wc -l
    ```
    正则匹配查找所有的进程ID

=== "ps"

    ``` bash
    ps aux | wc -l
    ```
    使用这种方法会比上面的方法统计数量多一个, 因为在使用这个命令本身的时候会被记入进程



