---
title: 在服务器上跑Jupyter
date: 2023-12-17
tags: 
  - Linux
  - Jupyter
categories: 
  - Log
---

# 在服务器上跑Jupyter

想用Jupyter notebook写一些实验性的python代码，但是每次都写在本地，还要额外开一个服务，而且还只能给自己看，也没法放到blog中，总感觉有些鸡肋，因此借此机会，尝试在云服务器中运行Jupyter notebook，这样就很方便可以运行python代码了

<!-- more -->

## **配置文件**

`jupyter_notebook_config.py`

对于Linux来说，它的位置在`/home/USERNAME/.jupyter/jupyter_notebook_config.py`

可以通过下面的命令生成：

```shell
jupyter notebook --generate-config
```

如果是`root`用户，加上`--allow-config`

执行成功后，返回：

```shell
Writing default config to: /root/.jupyter/jupyter_notebook_config.py
```

## **生成密码**

> 使用`ipython`手动设置的方法已经失效了，这里直接使用jupyter的方法，最后生成的`hashed_password`会保存`json`文件中，用vim命令去复制提取就可以了

当第一次通过 token 登录的时候，notebook服务器会让用户有机会在用户界面设置一个密码，浙江通过一个表单来询问当前的令牌以及新的密码，输入并点击`Login and setup new password`

下次登录的时候就可以直接选择输入密码而不需要 token

可以在配置文件中设置`--NotebookApp.allow_password_change=False`来禁止第一次登录的时候修改密码

通过`jupyter notebook password`来设置密码并保存到文件`jupyter_noterbook_config.json`中



```shell
$ jupyter notebook password
root@Kihara:/home# jupyter notebook password
Enter password:
Verify password:
[JupyterPasswordApp] Wrote hashed password to /root/.jupyter/jupyter_server_config.json
```

## **采用SSL加密通信**

采用密码的时候，配合带有网站证书的SSL可以避免哈希的密码被非加密的形式发送给浏览器

可以通过设置参数`certfile`来开启notebook服务器，进行一次安全协议模式的通信，其中`mycert.pem`是自签 (self-signed)证书

```shell
jupyter notebook --certfile=mycert.pem --keyfile mykey.key
```

自签证书可以通过`openssl`生成，生成一个有效期为365天，将`key`和证书数据都保存在同一个文件中

```shell
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout mykey.key -out mycert.pem
```

这行命令是用于生成一个自签名的 SSL 证书和私钥，通常用于设置 HTTPS 服务器。命令的各部分含义如下：

- `openssl`: 这是一个功能强大的工具，用于处理各种与 SSL 和 TLS 协议相关的任务。

- `req`: 这是一个用于证书签名请求（Certificate Signing Request, CSR）的管理命令。在这里，它被用来创建一个新的 SSL 证书请求。

- `-x509`: 这个选项指示 openssl 生成一个自签名的证书，而不是一个证书签名请求。x509 是用于 SSL 证书的标准格式。

- `-nodes`: 这个选项表示“no DES”，意味着在生成私钥时不对其进行密码保护。这意味着私钥文件不会被加密。

- `-days 365`: 这指定证书的有效期。在这个例子中，证书将在 365 天后过期。

- `-newkey rsa:2048`: 这个选项指示 openssl 创建一个新的 2048 位 RSA 私钥。RSA 是一种广泛使用的公钥加密算法。

- `-keyout mykey.key`: 这个选项指定私钥的输出文件名。在这个例子中，私钥将被保存到名为 `mykey.key` 的文件中。

- `-out mycert.pem`: 这个选项指定证书的输出文件名。在这个例子中，生成的自签名证书将被保存到名为 `mycert.pem` 的文件中。

总体来说，这个命令用于生成一个自签名 SSL 证书和相应的私钥。这在设置需要 SSL 加密的服务（如 HTTPS 服务器）时非常有用，尤其是在测试环境或内部网络中。自签名证书意味着它不是由受信任的证书颁发机构签发的，因此在用于公共网站时可能会导致浏览器警告

## **运行服务器**

修改配置文件`jupyter_notebook_config.py`

官方建议：

```python
# 证书的信息
c.NotebookApp.certfile = u'/absolute/path/to/your/certificate/mycert.pem'
c.NotebookApp.keyfile = u'/absolute/path/to/your/certificate/mykey.key'
# ip 设置为 *
c.NotebookApp.ip = '*'
c.NotebookApp.password = u'sha1:bcd259ccf...<your hashed password here>'
c.NotebookApp.open_browser = False

# 设置一个固定的接口
c.NotebookApp.port = 8000
```

这里官方教程是建议`c.NotebookApp.ip`设置为`*`，但实际上这样操作可能会连接失败，可以选择设置为`0.0.0.1`或者设置为服务器的IP

最终配置如下：

```python
c.NotebookApp.ip = '*' # 允许任何 IP 访问
c.NotebookApp.password = u'hashed password'
c.NotebookApp.open_browser = False
c.NotebookApp.port =8000 #可自行指定一个端口, 访问时使用该端口
c.NotebookApp.notebook_dir = '/root/notebooks'  # 工作目录
```

**运行**

启动notebook服务器

```shell
jupyter notebook --allow-root
```

在本地浏览器输入`服务器IP:80`，再输入刚刚设置的密码，即可访问Jupyter notebook

---

注意上面的命令只能在命令行开启时持续运行，当命令行关闭时，服务会自动挂掉，需要在服务器后台运行服务，需要`nohup`和`&`命令：

`nohup`:

- `nohup` 是 “no hang up”的缩写，用于在用户注销或关闭终端后继续运行相应的进程
- 当使用 `nohup` 运行命令时，任何由该命令产生的输出默认会被重定向到名为 `nohup.out` 的文件中，除非另有指定
- 这样可以防止进程接收到 "挂断" 信号（SIGHUP），从而在用户退出或断开连接时不会被终止

**`&`**:

- 在命令的末尾放置一个 `&` 符号可以将命令置于后台执行
- 这意味着命令会立即返回，而不是占用当前的终端或命令行会话
- 您可以继续在同一个终端中执行其他命令，而 `jupyter notebook` 服务会在后台运行



## **演示**

```shell
$ nohup jupyter-notebook --allow-root &
[1] 28476
root@Kihara:~# nohup: ignoring input and appending output to 'nohup.out'
```

**输出解释**:

- `[1] 28476`: 这是后台运行的进程的信息。`[1]` 是作业号，`28476` 是进程号（PID）。这些信息对于跟踪和管理后台进程很有用
- `nohup: ignoring input and appending output to 'nohup.out'`: 这是 `nohup` 命令的标准输出。它表示 `nohup` 正在忽略输入，并且将所有输出追加到文件 `nohup.out` 中。这意味着任何通常会显示在终端上的输出现在会被写入到 `nohup.out` 文件中



> 如果访问失败了，则有可能是服务器防火墙设置的问题，最简单的方法是在本地建立一个`ssh`通道：
>
> 在本地终端中输入
>
> ```shell
> ssh username@address_of_remote -L 127.0.0.1:1234:127.0.0.1:8000
> ```
>
> 这样就可以在`localhost:1234`端口直接访问远程的Jupyter notebook了



## References

1. [如何访问服务器的 Jupyter notebook](https://zhuanlan.zhihu.com/p/69869583)

2. [搭建 Jupyter Notebook 服务](https://developer.aliyun.com/article/1247401)