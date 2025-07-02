---
title: Docker工作流 
date: 2023-12-16
tags: 
  - docker 
  - nodejs
categories: 
  - Technology
---
# Docker 工作流

简单认识docker，分清镜像和docker容器的区别，简单操作docker程序运行

<!-- more -->

## 工作流

**定制镜像文件 Dockerfile** –> docker build -> **镜像 Image** –> docker run -> **容器 Container**

使用`docker push`将制作好的镜像推送到 Docker Hub

使用`docker pull`将镜像拉取到本地

使用`docker run`使用容器运行镜像

## 命令拆解

### 初始化服务

初始化项目，使用

```shell
npm init -y
```

自动生成`package.json`文件

使用express框架来构建服务器，安装一下

```shell
npm install express
```

在macOS下如果失败尝试加上`sudo`

成功后会生成`node_modules`，在目录下的`package.json`中依赖项`dependencies`中可以发现键值对`express`

创建`app.js`文件

```shell
touch app.js
```

写入下面的代码

```js
const express = require('express');
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
    res.send("<p> hello world ! </p>")
});

app.listen(PORT, () => console.log("运行端口：3000"));
```

使用`node.js`试着在本地运行：

```shell
$ node app.js
运行端口：3000
```

### 配置文件

创建`Dockerfile`，注意大写

```shell
$ touch Dockerfile
$ vim Dockerfile
# 添加：
FROM node:18-alpine3.15 # 指定18版本的node，alpine3.15为linux的轻量级发行版
WORKDIR /work # 指定工作目录
COPY package.json . # 当前文件夹复制到镜像里的/work文件夹
RUN npm install # 运行安装命令，内容在package.json中
COPY . . # 本地全部文件复制到镜像的工作目录中
EXPOSE 3000 # 容器端口号和本地不一样
CMD ["node", "app.js"]

```

创建`.dockerignore`，把不想复制到镜像的文件和文件夹全都写进去

```shell
$ touch .dockerignore
$ vim .dockerignore

node_modules
Dockerfile
.dockerignore
.git
.gitignore
```

### 构建镜像

```shell
docker build .
```

这样，docker就会自行根据Dockerfile所在目录进行构建

注意，必须确保 Docker 服务已经启动，否则会报错：

```shell
ERROR: Cannot connect to the Docker daemon at unix:///Users/kiharari/.docker/run/docker.sock. Is the docker daemon running?
```

这表明 Docker 守护进程 (daemon) 没有运行，打开 Docker 客户端即可

如果发生错误，多半是网络问题，确保终端代理后再尝试

### 操作镜像

#### 查看镜像

```shell
$ docker images
REPOSITORY                                    TAG              IMAGE ID       CREATED              SIZE
<none>                                        <none>           1b1df0c73a59   About a minute ago   172MB
```

此命令会显示所有镜像

因为没有指定名称，`RESPOSITORY`的值为`<none>`

添加镜像名称

```shell
docker tag 1b1 yourid/nodejs:v1.0 # 用户名/镜像名:版本名
```

也可以在进行build的时候定义，加上`-t`参数代表`tag`

#### 登录

```shell
docker login
```

输入用户名密码

推送到 [Docker Hub](https://hub.docker.com)

```shell
docker push yourid/nodejs:v1.0
```

#### 删除镜像

```shell
docker rmi -f yourid/nodejs:v1.0
```

`rmi`表示`remove image`

#### 拉取镜像

```shell
docker pull yourid/nodejs:v1.0
```

### 🌟运行镜像

```shell
$ docker run -d imagename
cbc33e9290b82ea82836f11dab7e3b6c6088512f27376f0259321abe927dea72
```

`-d`为`detached mode`，在后台运行

**确认容器状态**

```shell
$ docker ps
CONTAINER ID   IMAGE                  COMMAND                  CREATED          STATUS          PORTS      NAMES
cbc33e9290b8   kiharari/nodejs:v1.0   "docker-entrypoint.s…"   40 seconds ago   Up 40 seconds   3000/tcp   great_ride
```

`ps`为`process status`

**端口映射**

```shell
-p 3000:3000 # 主机端口:容器端口
```

**定义容器名称**

```shell
--name imagename
```

**暂停容器**

```shell
docker stop id
```



用以上的命令来运行容器

```shell
$ docker run -d -p 3000:3000 --name hello kiharari/nodejs:v1.0
3b62f31cbb69b603a712184ea246747c779246869c4899fb0b41a343df748bbd

$ docker ps
CONTAINER ID   IMAGE                  COMMAND                  CREATED          STATUS          PORTS                    NAMES
3b62f31cbb69   kiharari/nodejs:v1.0   "docker-entrypoint.s…"   13 seconds ago   Up 12 seconds   0.0.0.0:3000->3000/tcp   hello
cbc33e9290b8   kiharari/nodejs:v1.0   "docker-entrypoint.s…"   4 minutes ago    Up 4 minutes    3000/tcp                 great_ride
```

现在访问`localhost:3000`就能正常看见服务器返回的内容了



### 访问容器

使用`docker exec`命令

```shell
docker exec -it <NAMES> /bin/sh
```

参数`i`代表交互`interactive`，参数`t`代表以终端方式进行的`interactive`，即`pseudo-TTY`伪终端

`/bin/sh`表示执行 shell，这是`Alpine`进入 shell 的方式



现在我们执行一下试试

```shell
$ docker exec -it hello /bin/sh
/work #
```

可以发现直接进入了之前设置的工作目录

退出容器使用命令`exit`

### 🌟同步目录和容器

**指定路径**

创建时加上参数`-v`，为`Volume`的缩写，需要用绝对路径

```shell
docker run -d -v /Users/kiharari/documents/调试代码/docker_try/:/work -p 3000:3000 --name hello kiharari/nodejs:v1.0
```

这里将本地的文件映射到了docker的工作目录下



当文件被**修改**时，需要用`nodemon`

```shell
npm i nodemon --save-dev
```

安装成功后可以在`package.json`中看到依赖项`nodemon`，修改`script`

```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1"
},
==>
"scripts": {
  "dev": "nodemon app.js"
},
```

如果`npm run dev`，就用`nodemon`执行

并且修改Dockerfile

```shell
CMD ["npm", "run", "dev"]
```

## 最后的命令

刚刚对镜像文件进行了一些修改，现在重新构建镜像：

```shell
docker build -t hello .
```

这将创建一个名称为`hello`的镜像

运行镜像，注意，在运行之前，由于我们会声明本地文件与镜像文件之间的绑定关系，因此镜像文件被删除，本地文件同样被删除，这通常是我们不想看到的，需要设置同步性，在第一个`-v`选项后增加第二个`-v`

```shell
-v /work/node_modules
```

这个参数声明`node_modules`文件夹不进行同步

并且如果镜像新增文件，本地同样会新增，如果不想本地新增，设置只读`read only`，在第一个`-v`最后加上`:ro`



因此，最后的命令为：

```shell
docker run -d -v /Users/kiharari/documents/调试代码/docker_try/:/work:ro -v /work/node_modules -p 3000:3000 --name hello kiharari/nodejs:v1.0
```

**删除容器**

```shell
docker rm -fv hello
```

记得加上`-v`删除对应的volume，否则volume会越积越多

## docker-compose

上面启动容器的命令未免太长太过繁琐，因此有了docker-compose这样的自动化方式，只需要在yaml文件中配置好对应的项就可以按照要求正确地创建镜像并运行

创建`docker-compose.yml`，缩进采用空格两行，`: `必须跟空格

```yaml
version: "3.8"
  services:
  docker_container:
    build: .
    ports:
    	- "3000:3000"
    volumes:
      - ./:/work:ro
      - /work/node_modules
```

`--build`如果有修改，就会重建，如果不加下次就会使用之前的缓存

```shell
docker-compose up -d --build
```

使用`docker images`查看创建的镜像：

```shell
$ docker images
REPOSITORY                                    TAG              IMAGE ID       CREATED         SIZE
docker_try-docker_container                   latest           3aa616599463   3 minutes ago   174MB
```

`docker-compose`清除容器

```shell
docker-compose down -v
```

`-v`清除对应的volume

## References

1. https://www.bilibili.com/video/BV1MR4y1Q738/