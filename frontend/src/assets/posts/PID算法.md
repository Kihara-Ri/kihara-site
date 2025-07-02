---
title: PID算法
date: 2024-02-23
tags: 
  - control
  - embedded
  - algorithm
categories: 
  - CS
---

# 🟠 PID 算法

$PID$(*Proportional integration differentiation*)算法是一种应用非常广泛的控制算法，$PID$是一种闭环的控制算法，输入会收到输出的影响，让输出不断接近设定的期望值

根据英文原名：proportional, integration, differentiation，顾名思义就是比例、积分和微分控制

<!-- more -->

数学表达式：
$$
u(t) = K_p[err(t)+\frac{1}{T_i}\int_0^t err(t)\mathrm dt + T_d\frac{\mathrm d err(t)}{\mathrm d t}]
$$
在离散系统中，有：
$$
u_k = K_p*err_k + K_i\sum_{j=0}^k err_j + K_d(err_k -err_{k-1})
$$
我们可以在式中看到，整个算法是由$P, I, D $三种算法组成

## 数学解释

### P算法

Proportional顾名思义就是对误差$err_k$取一定比例，来进行适当的调节

我们先看离散系统中的表达：
$$
K_p*err_k
$$
其中$err_k$表示误差，易看出误差越大，$P$的输出也越大

因此*P*算法是用来纠正理论值与实际值的差距的

### D算法

Differentiation就是导数的意思，我们从离散形式上也可以看的出来：
$$
K_d(err_k - err_{k-1})
$$
这个式子采用了相邻的两次误差的差值，差值越大，D的输出也越大，反应了瞬时的变化

我们可以看出，$D$算法的作用大致可以描述为**阻尼**，如果系统误差很大，或者$P$参数较大，那么$P$的输出会比较大，从而会导致系统的剧烈响应，也就是会非常剧烈地震荡，不够稳定，$D$算法在这其中就起到了阻尼的作用，使响应平稳

调节$D$算法，使得$P$算法的作用减弱

### I算法

Intergation就是积分，在离散形式下就是求和：
$$
K_i\sum_{j=0}^k err_{j}
$$
对误差的求和，也就是对误差的累加：如果存在误差（稳态误差），那么不论误差有多小，$I$的输出也会像滚雪球一样越滚越大

$I$算法的作用就是**消除稳态误差**，通过对误差的累加，可以实现对误差的放大作用，在很多情况下$P$算法的精度不足以达到完美控制，总有最后一点点小的稳态误差导致怎么都对不上，而$I$算法就是用来弥补上这一缺陷的，从而达到精确控制



![image-20240223162624553](https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/image-20240223162624553.png)