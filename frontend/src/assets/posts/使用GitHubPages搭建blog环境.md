---
title: 使用GitHub Pages搭建blog环境 
date: 2023-12-21
tags: 
  - GitHub
  - blog
categories: 
  - Log
---
# 🟠 使用GitHub Pages搭建blog环境

使用Hexo模版，借助GitHub Pages快速搭建一个Blog网站

<!-- more -->

## 基础操作

### 新建仓库 Repository

新建repository，名称为{username}.github.io

<font color="red">⚠️注意：这里的`username`最好跟自己的账户相同</font>，否则就会如我第一次创建时的情况相同，使得url特别长并且不雅观

**安装Node.js**

确保环境变量已配置，能正常使用`npm`命令

**安装Hexo**

Hexo是一个博客框架，使用命令

```shell
npm install -g hexo-cli
```

快速创建项目、页面、编译和部署Hexo博客

如果出现错误，可以尝试加上`sudo`

安装完毕之后，确保环境变量配置好，能正常使用`hexo`命令

### 初始化项目

使用命令创建项目：

```shell
hexo init {name}
```

这里报错：

> Not empty, please run ‘hexo init’ on an empty folder and then copy your files into it

这里提示我们要在一个空的文件夹中创建项目，那么我们创建一个名为`kiharablog`的文件夹

进入该文件夹，再次执行命令创建项目：

```shell
cd kiharablog
hexo init blog
```

或者在初始化的时候指明文件名，就可以在当前目录下直接创建目录

直接使用`sudo hexo init`命令就会在当前目录下创建项目，如果加上参数则会在目录中再创建一个文件夹

在这一步需要git clone项目，如果没有代理的话会非常慢，并且有概率失败

当出现`Start blogging with Hexo!`时即代表成功

进入到项目中，调用Hexo的`generate`命令，此命令将会编译生成HTML代码

```shell
hexo generate
```

完成后会生成一个public文件夹

接下来使用`serve`命令将博客在本地运行起来

```shell
hexo serve
```

在localhost:4000端口上就可以看到网站了

**新建**

使用命令

```shell
hexo n "start"
```

可以创建一个名为`start.md`的文件，这个文件的路径为`./source/_post/start.md`

**文件目录**

`public`下存放的是生成的静态页面

`source/_post`下存放的是写的markdown文稿

`themes`下存放的是博客的主题

`_config.yml`为博客的全局配置文件

`_config.landscape.yml`是博客主题配置文件

### 部署

我们需要将网站放到 GitHub Pages上，可以使用命令

```shell
hexo deploy
```

在这之前需要在项目的根目录即`blog`文件夹中的`_config.yml`中进行一些修改

在`Delpoyment`处，将新建的Repository的地址粘贴过来，并且制定分支为master

```yaml
# Deployment
## Docs: https://hexo.io/docs/one-command-deployment
deploy:
  type: git
  repo: git@github.com:Kihara-Ri/kihara.github.io.git
  branch: master

```

除此以外，还要在本项目目录下安装`hexo-deployer-git`插件：

```shell
npm install hexo-deployer-git --save
```

接下来执行部署命令



### 修理

虽然我们的命令执行成功了，但明显有很大的问题，我们没法直接通过项目的名称`kihara.github.io`进行页面的访问，不光如此，通过`https://kihara-ri.github.io/kihara.github.io`这种方式访问不仅不优雅，返回的网页还缺少样式，与`localhost:4000`中所呈现的html相差很大

**测试**

经过测试，发现即使未开启serve服务，依旧不影响对上面链接的访问，从这里就可以知道问题并不出在本地，而在GitHub的配置上

重新创建depository以后，将仓库名中的`username`更改之后原来的问题消失了

如果在创建仓库的时候勾选了README，那么在`main`分支中就会出现`README.md`，在网站发布的时候将会默认显示其中的内容，这时我们使用`hexo deploy`部署的内容将会被推送至`master`分支，需要在仓库中的`Pages`选项中将分支改为`master`，过一段时间，再次访问网页将会看到推送了正确的html

### 域名

如果要联系自己已有的域名，需要在服务商处进行设置：

<img src="https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/Screenshot%202023-11-14%20at%2018.22.17.png" alt="Screenshot 2023-11-14 at 18.22.17" style="zoom: 33%;" />

如上图，在域名解析中将记录类型改为`CNAME`，主机记录可以爱怎么填怎么填，记录值填github项目的url

此外，在项目的根目录下的`source`文件中，创建一个名为`CNAME`的文本，填上域名：

```shell
cd source

vim CNAME
```

```shell
limuyuan.top

:wq
```

接下来访问域名就能成功了

### MkDocs

使用[MkDocs](https://www.mkdocs.org)框架搭建

**发布**

手动发布使用以下命令：

```shell
mkdocs gh-deploy
```

但是在使用命令后会提示输入github的用户名和密码，实际上无论怎么输入都不会被通过的，因为github已经禁止使用密码通过ssh连接了，可以通过工作流自动发布

**workflow**

```yaml
name: publish site
on: # 在什么时候触发工作流
  push: # 在从本地main分支被push到GitHub仓库时
    branches:
      - main
  pull_request: # 在main分支合并别人提的pr时
    branches:
      - main
jobs: # 工作流的具体内容
  deploy:
    runs-on: ubuntu-latest # 创建一个新的云端虚拟机 使用最新Ubuntu系统
    steps:
      - uses: actions/checkout@v2 # 先checkout到main分支
      - uses: actions/setup-python@v2 # 再安装Python3和相关环境
        with:
          python-version: 3.x
      - run: pip install mkdocs-material # 使用pip包管理工具安装mkdocs-material
      - run: mkdocs gh-deploy --force # 使用mkdocs-material部署gh-pages分支

```

每次使用命令

```shell
git push -u origin main
```

工作流就会自动部署网页分支

### 发布和维护

使用[GitHub Actions](https://docs.github.com/zh/actions)进行部署，创建workflow:

1. 将Hexo文件夹中的文件 push 到储存库的默认分支，通常默认分支为 `main`
2. 将 `main` 分支 push 到 GitHub：

```shell
git push -u origin main
```

默认情况下`public/`不会被上传，确保`.gitignore`中包含`public/`

3. 使用`node --version ` 命令检查 Node.js 的版本

```shell
$ node --version
v21.4.0
```

4. 在 repository 中的 `Settings > Pages > Source `将`Source`改为 `GitHub Actions`
5. 在 repository 中建立 `.github/workflows/pages.yml`，然后填入以下内容：

```yaml
name: Pages

on:
  push:
    branches:
      - main # default branch

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          # If your repository depends on submodule, please see: https://github.com/actions/checkout
          submodules: recursive
      - name: Use Node.js 21.x
        uses: actions/setup-node@v2
        with:
          node-version: '21'
      - name: Cache NPM dependencies
        uses: actions/cache@v2
        with:
          path: node_modules
          key: ${{ runner.OS }}-npm-cache
          restore-keys: |
            ${{ runner.OS }}-npm-cache
      - name: Install Dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./public
deploy:
    needs: build
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

检查node version然后修改

## 使用Jekyll构建站点

Jekyll是可以创建简单的博客形态的静态站点，通过一个模版目录，其中包含原始文本格式的文档，通过一个转换器如Markdown和Liquid渲染器转化成一个完整的可以发布的静态网站

基础操作参见https://jekyllrb.com/

**clone 仓库**

在这里可以寻找感兴趣的主题：

http://jekyllthemes.org/

在GitHub页面中clone

```shell
git clone https://github.com/artemsheludko/zolan.git
```

命令行进入项目文件夹

安装ruby

使用命令

```shell
bundle install
```

安装依赖，这个命令会安装所有在`Gemfile`中列出的gem包及其依赖项

可能会出现下面的结果

```shell
Using rake 13.1.0
Following files may not be writable, so sudo is needed:
  /Library/Ruby/Gems/2.6.0
  /Library/Ruby/Gems/2.6.0/build_info
  /Library/Ruby/Gems/2.6.0/cache
  /Library/Ruby/Gems/2.6.0/doc
  /Library/Ruby/Gems/2.6.0/extensions
  /Library/Ruby/Gems/2.6.0/gems
  /Library/Ruby/Gems/2.6.0/specifications
```

这个时候在命令前加上`sudo`

**部署**

使用命令

```shell
jekyll serve
```

我在这里配置的时候出现了报错，尝试了很久没有解决，最后的方法是更新ruby：

```shell
# 使用Homebrew更新ruby版本
brew install ruby
```

将ruby版本放入PATH中，这里是`zshrc`

再次在目录中执行

```shell
bundle install
```

**上传**

```shell
$ git remote -v
origin	https://github.com/artemsheludko/zolan.git (fetch)
origin	https://github.com/artemsheludko/zolan.git (push)
# 修改origin到自己的repository
$ git remote remove origin
$ git remote add origin git@github.com:Kihara-Ri/Kihara-Ri.github.io.git
# 如果有改动，执行下面的命令
# $ git add .
# $ git commit -m "Your modified"

$ git push -u origin master
```

正常情况这样就可以用GitHub的域名进行网站页面的访问了

**问题**

在使用`jekyll s`命令生成网页后出现问题

```shell
Deprecation Warning: Using / for division outside of calc() is deprecated and will be removed in Dart Sass 2.0.0.
Recommendation: math.div($spacing-unit, 2) or calc($spacing-unit / 2)
More info and automated migrator: https://sass-lang.com/d/slash-div
   ╷
40 │   margin-bottom: $spacing-unit / 2;
   │                  ^^^^^^^^^^^^^^^^^
   ╵
    ../../../../minima-2.5.1/_sass/minima/_base.scss 40:18           @import
    minima.scss 48:3                                                 @import
    /Users/kiharari/kiharablog/my-awesome-site/assets/main.scss 1:9  root stylesheet
```

更新版本和依赖后能正常运行

版本不一致也可以使用命令

```shell
bundle exec jekyll serve
```

但是更多还是建议删除`Gemfile.lock`文件，然后重新`bundle install`

## References

1. [https://yang-xijie.github.io/WEBSITE/build/](https://yang-xijie.github.io/WEBSITE/build/)，这是一位清华本科毕业的学生写的，非常有参考价值

如果要进一步使用 Jekyll 构建blog，可以参考下面的文章

2. https://jiansoft.net/2020/04/28/JekyllFullTutorial.html

3. https://minixbeta.github.io/%E5%B7%A5%E5%85%B7/2014/02/15/github-jekyll-markdown.html
4. https://shopify.github.io/liquid/basics/introduction/
5. https://jekyllrb.com/docs/

接下来我会使用Hexo来构建blog网站