---
title: Conda使用
date: 2023-12-30
tags: 
  - conda
  - python
categories: 
  - Log  
---

# conda使用

包含的内容：如何安装miniconda3

<!-- more -->

## 安装

```bash
mkdir -p ~/miniconda3
curl https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-arm64.sh -o ~/miniconda3/miniconda.sh
bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3
rm -rf ~/miniconda3/miniconda.sh
```

初始化zsh和bash

```bash
~/miniconda3/bin/conda init bash
~/miniconda3/bin/conda init zsh
```

初始化后记得重新加载一下`.zsh`，可以通过命令加载：

```bash
source ~/.zshrc
```

创建新环境

```bash
conda create --name myenv python=3.8
```

激活和停用环境：

```bash
# 激活
conda activate myenv
# 停用
conda deactivate
```

在当前激活的环境中安装包：

```bash
conda install numpy
```

列出所有可用的环境：

```bash
$ conda env list

# conda environments:
#
base                     /Users/kiharari/miniconda3
myenv                 *  /Users/kiharari/miniconda3/envs/myenv
                         /opt/anaconda3
                         /opt/anaconda3/envs/spyder
                         /opt/anaconda3/envs/spyder-
```

切换到不同的环境：

```bash
conda activate otherenv
```

删除环境：

```bash
conda env remove --name myenv
```

查找可用的包版本：

```bash
conda search numpy
```

更新环境中的包：

```bash
conda update numpy
```

查看环境中已经安装的包：

```bash
$ conda list

# packages in environment at /Users/kiharari/miniconda3/envs/myenv:
#
# Name                    Version                   Build  Channel
ca-certificates           2023.12.12           hca03da5_0
libcxx                    14.0.6               h848a8c0_0
libffi                    3.4.4                hca03da5_0
ncurses                   6.4                  h313beb8_0
openssl                   3.0.12               h1a28f6b_0
pip                       23.3.1           py38hca03da5_0
python                    3.8.18               hb885b13_0
readline                  8.2                  h1a28f6b_0
setuptools                68.2.2           py38hca03da5_0
sqlite                    3.41.2               h80987f9_0
tk                        8.6.12               hb8d0fd4_0
wheel                     0.41.2           py38hca03da5_0
xz                        5.4.5                h80987f9_0
zlib                      1.2.13               h5a0b063_0
```



## 虚拟环境

conda会创建一个虚拟环境，这有点像docker，因此在默认情况下，使用`pip`会指向虚拟环境中的pip

```bash
$ which pip
/Users/kiharari/miniconda3/envs/myenv/bin/pip
```

不过，需要注意的是，如果你将`pip`设置了别名，这里可能会混乱，最好先**禁用**这个别名

```bash
unalias pip
```

或者使用下面的shell脚本进行切换：

```shell
pip() {
    if [ -n "$CONDA_PREFIX" ]; then
        "$CONDA_PREFIX/bin/pip" "$@"
    else
        /path/to/default/pip "$@"
    fi
}
```



