---
title: Linux | vim的真正实力
slug: linux-vim
date: 2026-03-14
tags:
  - tooling
---

# vim的真正实力

网络上有很多人认为vim很难用, 与我们现在的键盘操作逻辑非常不符, 比如输出文字需要先进入插入模式, 而他们大多数情况下只知道使用 ++i++ , 保存退出需要使用`:wq`, 而绝大多数第一次接触到vim的时候都不知道怎么退出, 这也就给了刚接触vim的用户非常不好的印象, 认为它是上个世纪的古董计算机软件, 已经过时了, 并且在国内外很多vim教程的评论区中都有诸如 "谢谢🙏, 已经学会退出vim了/我学习了10年, 终于能退出vim了" 之类的调侃

但严肃地说, vim作为一款编辑器, 其实是一个天才的开创之举, 它打破了以往我们对于编辑器的认知, 通过设计各种模式和快捷操作, 让我们能够通过全键盘操作, 以代码或命令的形式来操控编辑[^1], 而不是通过鼠标点来点去, 不仅效率低下而且容易出错. 当我们审视了vim一段时间, 自然会了解到它的设计的天才之处

[^1]: 参考自: [南京大学 计算机科学与技术系 计算机系统基础 课程实验 2023: Configuring vim](https://nju-projectn.github.io/ics-pa-gitbook/ics2023/0.4.html)

<!-- more -->

我的 [neovim 配置仓库](https://github.com/Kihara-Ri/neovim-lua-config)

## 进阶快捷键操作

- ++shift+a++ 在行尾添加, 与 ++shift+4++ 不同的是前者会跳转到 INSERT MODE, 而后者不会 
- ++shift+i++ 在行首插入, 与 ++shift+0++ 不同的是前者会跳转到INSERT MODE, 而后者不会
- ++shift+c++ 剪切(change)行内光标后面的所有内容, 进入INSERT MODE, ++shift+d++ 有相似的功能, 但不会进入 INSERT MODE

使用 ++e++ **e**nd 跳转到下一个单词的末尾, 使用 ++w++ **w**ord 跳转到下一个单词的开头, 使用 ++b++ **b**ack 跳转到上一个单词的开头

在编辑时 NORMAL MODE 下就可以通过`:set relativenumber`进行编辑器配置的修改, 但是需要注意这种修改是临时的

如果在编辑的时候做了使用 ++u++ (undo) 退回了, 但是之后又后悔了, 可以使用 ++ctrl+r++ 回退`undo`操作, 套娃了属于是

使用`==`修正代码缩进, 这个用法很少有人提到

使用`/<content>`, `?<content>`进行匹配, 按 ++n++ 或 ++shift+8++ 跳转至下一个, 回退到上一个使用 ++shift+n++

锚点`m<character>`: **m**ark, 随便选择一个字母设置锚点, 比如`ma`, 然后下次使用`'a`回到锚点`a`

**替换操作**

全局替换:

``` vim
:%s/<target>/<wanted>/g
```

- `%`表达的是表示整个文件, 而不仅仅是这一行
- `s`表示 subtitute

如果要仅替换部分, 可以先选中目标文本范围, 然后再替换

缓冲区`:reg`: register, vim自带强大剪贴板

使用`@`记录和应用强大的宏(macro)功能

## 组合操作

- `dw`: **d**elete a **w**ord, 可以删除一个单词, `2dw`/`d2w`则可以删除两个单词
- `diw`: **d**elete **i**n a **w**ord, 光标在一个单词内部时可以无脑使用删除这个单词, 在中文中则是一句话
- `yiw`: **y**ank **i**n a **w**ord, 复制这一个单词
- :star: `ciw`: **c**hange **i**n a **w**ord, 修改这一个单词

每一个位置都能组合, 如果要改变`"<content>"`中的内容, 使用 `ci"` 同理, 括号`(<content>)`可以使用`ci(`

使用`%`跳转到下一个大括号收尾处, `d%`删除里面的所有内容

在行内可以使用`t(`使光标跳转到`(`的前面, 使用`f(`跳转到`(`, 如果有的话, 当然括号也可以换成别的符号

---

## 使用 neovim

### 安装 neovim

neovim 支持非常多的插件, 它能将你的vim编辑器打造得甚至比IDE的功能更加强大, 但是配置起来也很麻烦, 这里为了个性化的使用, 我适当进行了一些配置, 让它用起来感觉相当不错, 足以进行各个文件的代码编辑

最便捷的方法是使用包管理器安装 neovim

``` shell
sudo apt install neovim
```

但是这种方法有一个问题, 就是如果你的系统包管理器不是最新的, 或者包管理器没有获得足够新的 neovim 版本, 在安装其他插件的时候可能会出现一些问题, 如我在安装的时候就出现了版本过低不支持 lazy.nvim 的情况, 它提示我最低要求的版本为 0.8, 而我通过包管理器的方式安装只有 0.7 版本

``` shell
$ nvim --version
NVIM v0.7.2
Build type: Release
Lua 5.1
Compiled by team+vim@tracker.debian.org
```

因此, 这里建议自己编译最新版本, 在编译最新版本后, 得到的信息如下:

``` shell
$ nvim --version
NVIM v0.10.2-dev-24+g7834d80b8
Build type: RelWithDebInfo
LuaJIT 2.1.1713484068
Run "nvim -V1 -v" for more info
```

编译方法查看 [链接](https://github.com/neovim/neovim/tree/release-0.10)

安装依赖:

``` shell
sudo apt-get update
sudo apt-get install ninja-build gettext libtool libtool-bin autoconf automake cmake g++ pkg-config unzip curl doxygen
```

需要注意的一点:

``` shell
git clone https://github.com/neovim/neovim.git
cd neovim
# 切换到目标分支
git checkout release-0.10
```

然后无脑编译就完成了

## 配置 neovim

neovim 文件的默认路径为`~/.config/nvim/init.vim`, 因此如果没有这个文件的话需要自己创建, 然后根据指示配置

neovim 采用了模块化的配置策略, 这使得对配置的个性化逻辑更贴近于项目逻辑, 我们使用`Lua`进行配置的引入和编写, 在`nvim`目录下我们需要创建一个`init.lua`文件作为项目的主文件, 之后的所有配置, 我们只需要在这个文件中引入即可

对于核心的配置, 我们放在`/nvim/lua/core/options.lua`下, 在`init.lua`中引用时, 只需要使用

``` lua
require("core.options")
```

即可, neovim 会自动以`lua`文件夹为根目录

在配置 neovim 的时候, 我们最好要时刻记住 neovim 的模块化配置思路, 不要一股脑地把各种引用和函数实现都堆在一个文件里

推荐先学习一下 [kickstart.nvim](https://github.com/nvim-lua/kickstart.nvim) 来了解 neovim 项目轮廓, 方便以后我们自己的扩展

??? info "kickstart.txt"

    [kickstart.txt](https://github.com/nvim-lua/kickstart.nvim/blob/master/doc/kickstart.txt)

    ================================================================================
    INTRODUCTION                                                  *kickstart.nvim*

    Kickstart.nvim is a project to help you get started on your neovim journey.

                                                            *kickstart-is-not*

    It is not:
    - Complete framework for every plugin under the sun
    - Place to add every plugin that could ever be useful

                                                                *kickstart-is*
    It is:
    - Somewhere that has a good start for the most common "IDE" type features:
        - autocompletion
        - goto-definition
        - find references
        - fuzzy finding
        - and hinting at what more can be done :)
    - A place to _kickstart_ your journey.
        - You should fork this project and use/modify it so that it matches your style and preferences. If you don't want to do that, there are probably other projects that would fit much better for you (and that's great!)!

    vim:tw=78:ts=8:ft=help:norl:

### neovim 插件

首先我们需要选用一个插件管理器, 目前有很多插件管理器如 [vim-plug](https://github.com/junegunn/vim-plug), [lazy.nvim](https://github.com/folke/lazy.nvim), [packer.nvim](https://github.com/wbthomason/packer.nvim) 等

在 neovim 的 [官网](https://dotfyle.com/neovim/plugins/trending) 能查找到各种插件

配置插件的过程极大程度地参考了 [技术蛋老师](https://space.bilibili.com/327247876) 的视频 [【全程讲解】Neovim从零配置成属于你的个人编辑器](https://www.bilibili.com/video/BV1Td4y1578E/)

在这里列出我使用的插件, 详细插件介绍和配置方法放在列表下面, 按顺序安装更好, 因为它更符合我们上手了解的逻辑

- [lualine.nvim](https://dotfyle.com/plugins/nvim-lualine/lualine.nvim)
- [neo-tree.nvim](https://dotfyle.com/plugins/nvim-neo-tree/neo-tree.nvim)

???+ info "状态栏: lualine.nvim"

    状态栏: 使用 [lualine.nvim](https://dotfyle.com/plugins/nvim-lualine/lualine.nvim)

    在 lazy.nvim 中添加:

    ``` lua
    {
        'nvim-lualine/lualine.nvim',
        dependencies = { 'nvim-tree/nvim-web-devicons' }
    }
    ```

    图标需要自己额外安装, 所以要安装上面的依赖`nvim-web-devicons`

    有很多现成的可供选择的状态栏, 如:

    <center>![evil_lualine](https://user-images.githubusercontent.com/13149513/113875129-4453ba00-97d8-11eb-8f21-94a9ef565db3.png){ width="800" }</center>

    个性化参考 [Usage and customization](https://github.com/nvim-lualine/lualine.nvim?tab=readme-ov-file#usage-and-customization)

    对于状态栏的配置, 写入`lualine.lua`文件然后在`init.lua`中引用一下即可生效

???+ info "文件树: neo-tree.nvim"

    在终端中使用命令进行文件切换实在太过繁琐, 因此要有好的体验需要像 VSCode 一样有一个文件树, 推荐使用 [neo-tree.nvim](https://dotfyle.com/plugins/nvim-neo-tree/neo-tree.nvim)

    配合 [vim-tmux-navigator](https://github.com/christoomey/vim-tmux-navigator) 可以方便地使用键盘进行文件树和编辑器之间的切换

    使用 ++tab++ 展开和关闭文件内容, ++enter++ 或 ++o++ 打开文件并将光标移动到文件内容中, 使用 ++ctrl+hjkl++ 进行文件窗口切换

???+ info "语法高亮: nvim-treesitter"
    
    配合 [nvim-ts-rainbow](https://github.com/p00f/nvim-ts-rainbow) 将不同层级的括号使用不同颜色区分

    创建`treesitter.lua`配置文件添加配置

    ``` lua
    require'nvim-treesitter.configs'.setup {
      -- 添加不同语言
      ensure_installed = { "vim", "vimdoc", "bash", "c", "cpp", "javascript", "json", "lua", "python", "typescript", "tsx", "css", "rust", "markdown", "markdown_inline" }, -- one of "all" or a list of languages

      highlight = { enable = true },
      indent = { enable = true },

      -- 不同括号颜色区分
      rainbow = {
        enable = true,
        extended_mode = true,
        max_file_lines = nil,
      }
    }
    ```

???+ info "代码补全诊断: lsp"

    `lsp`的全称为 language server protocol, 可以让 Language Server 与编辑器相互沟通, 从而为代码提供补全、诊断、Code Action 等接近完整 IDE 的功能

    语法提示使用 [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig)

    使用 [mason.nvim](https://github.com/williamboman/mason.nvim) 管理 lsp 服务

    使用`:Mason`进入语言管理界面, 搜索安装其它语言服务可以使用vim中的搜索操作: `/rust`搜索 Rust 语言相关服务, 然后根据前面所说的 ++n++ 进行跳转, 最后使用 ++i++ 安装服务, 安装完成后命令行中会有提示

    ??? warning

        有些服务需要有`npm`或`nodejs`, 因此需要安装一下:

        ``` shell
        sudo apt-get install nodejs npm
        ```

???+ info "自动补全: nvim-cmp"

    [nvim-cmp](https://github.com/hrsh7th/nvim-cmp) 是一个编程语言补全插件

???+ info "搜索: telescope"

    这个插件依赖于 [ripgrep](https://github.com/BurntSushi/ripgrep) 运行, 因此需要先安装, 同时建议安装 [fd](https://github.com/sharkdp/fd?tab=readme-ov-file)

    ``` shell
    sudo apt-get install ripgrep
    sudo apt install fd-find
    ```

### 其它功能

#### **执行 shell 命令** 

在 neovim 中也可以执行 shell 命令, 并且有好几种方法

可以使用`:!`作为前缀临时执行命令, 比如

```shell
:!pwd
```

neovim 会在底部临时跳出一个小窗口来显示命令结果, 按下回车就会消失

使用`:term`会打开一个终端窗口, 这跟我们在VSCode中的情况类似, 可以使用 ++ctrl+d++ 或`exit`命令退出终端, 更详细地可以使用`:split | term`打开一个水平分割的终端窗口, 使用`:vsplit | term`打开垂直分割的终端窗口, 不过后者我不太常用

你也可以在`keymaps.lua`中规定绑定快捷键:

``` lua
vim.api.nvim_set_keymap('n', '<leader>t', ':split | term<CR>', { noremap = true, silent = true })
```

这样就可以按下 `<leader>` + ++t++ 来快速打开终端了

#### **执行代码**

可以通过创建快捷命令的方式执行代码, 以 C, Rust, Python 为例子:

``` lua
-- gcc 编译并运行 C 代码
vim.api.nvim_create_user_command('RunC', '!gcc % -o %:r && ./%:r', {})
-- cargo run
vim.api.nvim_create_user_command('RunRust', '!cargo run', {})
-- python3
vim.api.nvim_create_user_command('RunPython', '!python3 %', {})
```

!!! tip

    - 命令的首字母必须大写, 只需在 vim 的命令行窗口中输入`:RuncC`就能运行命令
    - `%`代表当前文件的全名, 包括路径
    - `%:r`代表当前文件的`root name`, 去掉扩展名, 如`main.c` --> `main`

#### 其它

使用`:help`, 如果你想做一些操作但是忘了怎么做, 活用这个命令

## 打包

我们前面花了大功夫配置了一大堆, 但是目前它只能在一台机器上使用, 如果我们同时使用多台 Linux 服务器的话这未免让配置过于繁琐, 为了使 neovim 的配置文件能够轻松复制到其他机器上, 我们最好还是编辑一个安装脚本, 并且使用 Docker 作为容器也许是一个不错的选择



## References

1. [Vim Tutorial for Beginners](https://www.youtube.com/watch?v=RZ4p-saaQkc)
2. [vim-plug](https://junegunn.github.io/vim-plug/)
3. [【全程讲解】Neovim从零配置成属于你的个人编辑器](https://www.bilibili.com/video/BV1Td4y1578E/)
4. [Neovim插件管理Packer转Lazy](https://www.bilibili.com/read/cv24014511/)
5. [【全程讲解】Neovim从零配置成属于你的个人编辑器](https://www.bilibili.com/video/BV1Td4y1578E/) 
6. [Neovim-Configuration-Tutorial](https://github.com/eggtoopain/Neovim-Configuration-Tutorial)
