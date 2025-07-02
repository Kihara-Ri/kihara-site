---
title: VSCode背景图配置
date: 2024-03-13
tags: 
  - VSCode
  - config
categories: 
  - Log
---

# VSCode 背景图配置

使用默认的VSCode在面临长时间的编码时未免有点过于枯燥，于是我们便希望改变一下代码编辑器那一成不变的样子，添上一些我们喜欢的元素。有什么比添加背景图更引人注目呢？

回头看这页Log，现在掌握了更多前端知识的我难免觉得以前写下这些文字的时候过于无知

<!-- more -->

看来🐭🐭我已经沦落为一个二次元萌豚了（悲）

そうだよね、美少女やはり最高だぞ

## 插件

首先在VSCode的Extensions中搜索这个扩展

![image-20240313231306401](https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/image-20240313231306401.png)

启用后重新启动，会获得默认配置的背景图，然后我们可以在`settings.json`中自行修改，也可以进入作者的[GitHub主页](https://github.com/shalldie/vscode-background)进一步查看

在[Issues share](https://github.com/shalldie/vscode-background/issues/106)中可以看到大家分享的内容

<center>
<table><tr>
  <td><img src="https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/image-20240313232227567.png" width = "400"></td>
  <td><img src="https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/image-20240313232246629.png" width = "400"></td>
</tr></table>
</center>

## 理想的背景图配置

我们可以在`settings.json`中添加信息来说明我们想要的背景图片的插入方式，这里我以エミリアたん的人物立绘作说明

图片地址：https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/EMIRIA.JPG

可以采用图床的形式进行存储，这样就具有较好的普适性，避免了本地存储丢失的情况

### 分析画面信息

<img src="https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/EMIRIA.jpeg" alt="EMIRIA" style="zoom: 25%;" />

要恰当地插入图片，使得显示效果达到最佳，我们需要对图片插入方式做一些调整，因为编辑器窗口并不是固定大小的，而是长宽比、绝对大小经常变化的，因此我们要分析画面信息，并对一些情况下做画面的取舍

对于这张图片，我们首先可以发现：

1. 人物是处于图片中间位置的
2. 左右两边的信息不如中间重要，因为中间表现的是人物
3. 上面的信息比下面更重要，因为我们是看脸的，不是看衣服的👀

所以在这里，我们得到了图像信息展示的优先级：

在编辑器画面较宽的情况下，我们希望放大图片，以填充适应整个画面，我们不希望画面被拉伸改变比例，或有些地方没有被图片覆盖，这样会产生违和感；那么如何放大图片呢？根据刚刚的优先级规则，在两边范围足够的情况下，我们只能牺牲下半部分的图片信息

在编辑器画面较窄的情况下，我们只需牺牲左右两边的信息即可，上下的信息不需要改变

现在我们就可以根据这些原则来编写规则了

### 配置信息

**全屏显示配置信息**

```json
"background.enabled": true,
"background.useFront": true,
"background.fullscreen": {

    "images": ["https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/EMIRIA.JPG"],// url of background image
    "opacity": 0.87,
    "position": "center top",//图片水平剧中，垂直方向以顶部为基准，优先展示图片上部
    "size": "cover",//确保背景图覆盖整个编辑器，因此有些部分会被裁减
    "interval": 0
    },
    
```

<img src="https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/image-20240314002616490.png" alt="image-20240314002616490" style="zoom:20%;" />

这里最重要的是`position`和`size`

**仅代码区显示配置信息**

```json
"background.customImages": ["https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/EMIRIA.JPG"],
"background.style": {
		    "content": "''",
     "pointer-events": "none",
     "background-position": "center top",
     "background-size": "cover",
     "z-index": "9999",
     "background-repeat": "no-repeat",
     "opacity": 0.13
  },
```

<img src="https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/image-20240314002739074.png" alt="image-20240314002739074" style="zoom:20%;" />

这两种方案可以自行取用

需要注意两种不同的配置中，透明度`opacity`的值是相反的
