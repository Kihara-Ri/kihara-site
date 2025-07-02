---
title: C语言：更底层
date: 2024-03-28
tags: 
  - C
  - compile
  - assembly
categories: 
  - CS
---

# 🟠 C | 更底层

本次记录的是对课程[南京大学-计算机系统基础实验课-W2C语言拾遗之机制](https://www.bilibili.com/video/BV16g4y1C7GB/)的学习，个人认为这堂1h40min的课讲了非常多的干货，并且提醒我让我注意到自己以前在学习C/C++时忽略的更底层的知识，当然这也有很大一部分原因是我们学校的计算机教学质量确实不怎么样(笑

如果想要对编程语言有更深的认识，或者未来想在计算机领域有更底层的学习，我认为这堂课，甚至整个系列的课程都有非常大的帮助

<!-- more -->

## 更基础的东西

函数是一个操作，但是你也可以认为它是一个数字，一个数字也可以算是一个最简单的函数，因为你输入它，你得到它，这个最简单的函数没有对输入的值进行任何额外的操作，但是它做了唯一的操作，那就是输出输入的东西

前几年来我一直都没有很好地理解

## 最简单的C程序

一些个人思考

- 为什么 C/C++ 中的数组分配需要指定大小？`string`类型为什么不需要指定大小

在我一开始学习 C++ 的时候，书上并没有给出`string`类型的变量的使用方法，这导致我之前在写算法程序的时候极为痛苦，并且怎么思考都想不明白为什么 C++ 会以这种让人头疼的形式声明并保存变量，以至于当我最初接触python的时候感到颇为爽快，大有把 C++ 踢到一边去的趋势。不过当我逐渐深入学习编程语言和操作系统，我才意识到 C/C++ 这么做的底层逻辑：所有的这些设计都是为了操作系统和性能服务的，当我们在 C++ 中要使用`string`类型变量的时候，需要这样做

```C++
#include<string>
```

参考以下视频：

- [栈为何如此之快?](https://www.bilibili.com/video/BV1GD421g7pA/)
- [WHY IS THE STACK SO FAST?](https://www.youtube.com/watch?v=N3o5yHYLviQ)

⚠️ 使用C语言来实现链表和双向链表

## 最简单的汇编程序

由于我的主力机器是 M1 Pro 芯片的 MacBook，因此默认在macOS上跑汇编程序，而当前国内却少有针对此类较新的机器的汇编入门教程，教程大多都比较老旧，在我几番寻找后才终于找到一些相关的入门讲解：

- [在 Apple Silicon Mac 上入门汇编语言](https://evian-zhang.github.io/learn-assembly-on-Apple-Silicon-Mac/)
- [learn-assembly-on-Apple-Silicon-Mac](https://github.com/Evian-Zhang/learn-assembly-on-Apple-Silicon-Mac)
- [Evian Zhang's naive blog](https://evian-zhang.github.io/index.html)

以上包含了作者的blog网站，是一个很优秀的人，有很多教程，值得参考学习，特别是在汇编入门的讲解中，重新讲了一遍整数浮点数、硬件基础等计算机基础知识，新瓶装旧酒，让本来觉得是老生常谈的我眼前一亮，依然学到了新的东西





