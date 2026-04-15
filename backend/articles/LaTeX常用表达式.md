---
title: LaTeX常用表达式
slug: latex
date: 2023-12-26
tags:
  - markdown
  - math
  - tooling
published: true
---

# ${\LaTeX}$

记录了常用的$\LaTeX$数学式表达，必然有收录不完整的地方

<!-- more -->

## 希腊字母

|    Name    |  Display   | Capital Case |  Display   |   Var Case    |    Display    |
| :--------: | :--------: | :----------: | :--------: | :-----------: | :-----------: |
|  `\alpha`  |  $\alpha$  |     `A`      |  $\Alpha$  |               |               |
|  `\beta`   |  $\beta$   |     `B`      |  $\Beta$   |               |               |
|  `\gamma`  |  $\gamma$  |   `\Gamma`   |  $\Gamma$  |               |               |
|  `\theta`  |  $\theta$  |   `\Theta`   |  $\Theta$  |  `\vartheta`  |  $\vartheta$  |
|   `\mu`    |   $\mu$    |    `\Mu`     |   $\Mu$    |               |               |
|  `\delta`  |  $\delta$  |   `\Delta`   |  $\Delta$  |               |               |
| `\epsilon` | $\epsilon$ |     `E`      | $\Epsilon$ | `\varepsilon` | $\varepsilon$ |
|  `\sigma`  |  $\sigma$  |   `\Sigma`   |  $\Sigma$  |  `\varsigma`  |  $\varsigma$  |
|   `\pi`    |    $\pi$    |    `\Pi`     |   $\Pi$    |   `\varpi`    |   $\varpi$    |
|  `\omega`  |  $\omega$  |   `\Omega`   |  $\Omega$  |               |               |
|   `\xi`    |   $\xi$    |    `\Xi`     |   $\Xi$    |               |               |
|  `\zeta`   |  $\zeta$   |   `\Zeta`    |  $\Zeta$   |               |               |
|   `\chi`   |   $\chi$   |    `\Chi`    |   $\Chi$   |               |               |
|   `\rho`   |   $\rho$   |    `\Rho`    |   $\Rho$   |   `\varrho`   |   $\varrho$   |
|   `\phi`   |   $\phi$   |    `\Phi`    |   $\Phi$   |   `\varphi`   |   $\varphi$   |
|   `\eta`   |   $\eta$   |    `Eta`     |   $\Eta$   |               |               |
| `\lambda`  | $\lambda$  |  `\Lambda`   | $\Lambda$  |               |               |
|  `\kappa`  |  $\kappa$  |   `\Kappa`   |  $\Kappa$  |               |               |
|   `\nu`    |   $\nu$    |    `\Nu`     |   $\Nu$    |               |               |
| `\upsilon` | $\upsilon$ |  `\Upsilon`  | $\Upsilon$ |               |               |
|   `\psi`   |   $\psi$   |    `\Psi`    |   $\Psi$   |               |               |
|   `\tau`   |   $\tau$   |    `\Tau`    |   $\Tau$   |               |               |
|  `\iota`   |  $\iota$   |   `\Iota`    |  $\Iota$   |               |               |
| `\omicron` | $\omicron$ |  `\Omicron`  | $\Omicron$ |               |               |

有代码的大写希腊字母，直接敲获得正体，使用`\var`前缀转化为斜体

如：`\Gamma` Γ（正） `\varGamma` $\varGamma$（斜）

没有代码的大写希腊字母，直接敲得斜体，使用`\text`命令转化为正体

如：`\Tau` $\Tau$直接敲（斜） `\text T` $\text T$（正）

（也可以使用`\rm`将下一个单词变正，`\text T`的作用范围只是下一个字母；可以尝试加`{}`）

> 可以发现上面有一些字母的大写形式没有被渲染，可能是它们有对应的英文字母大写的缘故，在英语键盘中可以直接输入出来

## 运算

### 简单运算

|       Type       |    Typeset     |
| :--------------: | :------------: |
|       `+`        |      $+$       |
|       `-`        |      $-$       |
|      `\pm`       |     $\pm$      |
|      `\mp`       |     $\mp$      |
|     `\times`     |    $\times$    |
|     `\cdot`      |    $\cdot$     |
|      `\div`      |     $\div$     |
|     `\bmod`      |    $\bmod$     |
|      `\cap`      |     $\cap$     |
|      `\cup`      |     $\cup$     |
| `\wedge` `\land` | $\wedge,\land$ |
|  `\vee` `\lor`   |  $\vee,\lor$   |
|      `\ast`      |     $\ast$     |
|      `\det`      |     $\det$     |

### 复杂运算

|                    Type                     |                   Typeset                   |
| :-----------------------------------------: | :-----------------------------------------: |
|                `\sqrt{abc}`                 |                $\sqrt{abc}$                 |
|               `\sqrt[n]{abc}`               |               $\sqrt[n]{abc}$               |
|              `\frac{abc}{xyz}`              |              $\frac{abc}{xyz}$              |
|               `\int_{a}^{b}`                |               $\int_{a}^{b}$                |
|              `\iiint_{a}^{b}`               |              $\iiint_{a}^{b}$               |
|               `\oint_{a}^{b}`               |               $\oint_{a}^{b}$               |
|     `\frac{\mathrm{d} y}{\mathrm{d} x}`     |     $\frac{\mathrm{d} y}{\mathrm{d} x}$     |
| `\frac{\mathrm{d}^{n} y}{\mathrm{d} x^{n}}` | $\frac{\mathrm{d}^{n} y}{\mathrm{d} x^{n}}$ |
|       `\frac{\partial f}{\partial x}`       |       $\frac{\partial f}{\partial x}$       |
|  `\frac{\partial ^{n} f}{\partial x^{n}}`   |  $\frac{\partial ^{n} f}{\partial x^{n}}$   |
|              `\sum_{i=1}^{n}`               |              $\sum_{i=1}^{n}$               |
|              `\prod_{i=1}^{n}`              |              $\prod_{i=1}^{n}$              |
|             `\bigcap_{i=1}^{n}`             |             $\bigcap_{i=1}^{n}$             |
|             `\bigcup_{i=1}^{n}`             |             $\bigcup_{i=1}^{n}$             |

(想要让角标出现在正上和正下方，使用块级公式而不是行内公式)

### 函数

|   Type    |  Typeset  |
| :-------: | :-------: |
| `\arccos` | $\arccos$ |
| `\arcsin` | $\arcsin$ |
| `\arctan` | $\arctan$ |
|  `\cos`   |  $\cos$   |
|  `\cosh`  |  $\cosh$  |
|  `\cot`   |  $\cot$   |
|   `\lg`   |   $\lg$   |
|   `\ln`   |   $\ln$   |
|  `\log`   |  $\log$   |
|  `\sin`   |  $\sin$   |
|  `\sinh`  |  $\sinh$  |
|  `\tan`   |  $\tan$   |
|  `\tanh`  |  $\tanh$  |

### 极限运算符

|   Type   | Typeset  |
| :------: | :------: |
|  `\lim`  |  $\lim$  |
| `\infty` | $\infty$ |
|  `\sup`  |  $\sup$  |
|  `\min`  |  $\min$  |
|  `\max`  |  $\max$  |

## 符号

> 一些键盘上可直接敲出的符号，前面加`\`即可。
>
> 如：`\%` →% `\_` →_

### 点缀

|                 Type                  |                Typeset                |
| :-----------------------------------: | :-----------------------------------: |
|                 `a^2`                 |                 $a^2$                 |
|                 `a_1`                 |                 $a_1$                 |
|               `\bar{a}`               |               $\bar{a}$               |
|               `\dot{a}`               |               $\dot{a}$               |
|              `\ddot{a}`               |              $\ddot{a}$               |
|               `\vec{a}`               |               $\vec{a}$               |
|               `\hat{a}`               |               $\hat{a}$               |
|              `\tilde{a}`              |              $\tilde{a}$              |
|            `\mathring{a}`             |            $\mathring{a}$             |
|               `f^{''}`                |               $f^{''}$                |
|              `90^\circ`               |              $90^\circ$               |
|        `\overset{\frown}\psi`         |        $\overset{\frown}\psi$         |
|           `\overset{?}{=}`            |           $\overset{?}{=}$            |
| `\overset{ping}{拼}\overset{yin}{音}` | $\overset{ping}{拼}\overset{yin}{音}$ |
|        `\overset{はい}{入}る`         |        $\overset{はい}{入}る$         |
|       `\underset{t\in R}{max}`        |       $\underset{t\in R}{max}$        |

### 二元关系

|     Type      |    Typeset    |
| :-----------: | :-----------: |
|      `<`      |      $<$      |
|      `>`      |      $>$      |
|     `\le`     |     $\le$     |
|     `\ge`     |     $\ge$     |
|  `\leqslant`  |  $\leqslant$  |
|  `\geqslant`  |  $\geqslant$  |
|      `=`      |      $=$      |
|     `\ne`     |     $\ne$     |
|      `:`      |      $:$      |
|     `\in`     |     $\in$     |
|   `\notin`    |   $\notin$    |
| `\ni` `\owns` |  $\ni \owns$  |
|     `\ll`     |     $\ll$     |
|     `\gg`     |     $\gg$     |
|    `\sim`     |    $\sim$     |
|   `\approx`   |   $\approx$   |
|    `\cong`    |    $\cong$    |
|   `\equiv`    |   $\equiv$    |
|   `\subset`   |   $\subset$   |
|   `\supset`   |   $\supset$   |
|  `\subseteq`  |  $\subseteq$  |
| `\subsetneqq` | $\subsetneqq$ |
|    `\perp`    |    $\perp$    |
|  `\parallel`  |  $\parallel$  |
|    `\mid`     |    $\mid$     |
|   `\propto`   |   $\propto$   |

### Miscellaneous Symbols

|           Type            |         Typeset          |
| :-----------------------: | :----------------------: |
|       `\therefore`        |       $\therefore$       |
|        `\because`         |        $\because$        |
|          `\ell`           |          $\ell$          |
|        `\partial`         |        $\partial$        |
|         `\infty`          |         $\infty$         |
| `\varnothing` `\emptyset` | $\varnothing\ \emptyset$ |
|         `\forall`         |        $\forall$         |
|         `\exists`         |        $\exists$         |
|        `\triangle`        |       $\triangle$        |
|         `\angle`          |         $\angle$         |
|          `\surd`          |         $\surd$          |
|         `\nabla`          |         $\nabla$         |
|      `\neg` `\lnot`       |      $\neg \ \lnot$      |
|         `\ldots`          |         $\ldots$         |
|         `\cdots`          |         $\cdots$         |
|         `\vdots`          |         $\vdots$         |
|         `\ddots`          |         $\ddots$         |
|           `\S`            |           $\S$           |

### 🎴扑克牌

|      Type      |    Typeset     |
| :------------: | :------------: |
|  `\spadesuit`  |  $\spadesuit$  |
|  `\heartsuit`  |  $\heartsuit$  |
| `\diamondsuit` | $\diamondsuit$ |
|  `\clubsuit`   |  $\clubsuit$   |

### 箭头

|             Type             |           Typeset            |
| :--------------------------: | :--------------------------: |
|     `\to` `\rightarrow`      |     $\to \ \rightarrow$      |
|         `\leftarrow`         |         $\leftarrow$         |
|        `\Rightarrow`         |        $\Rightarrow$         |
|         `\Leftarrow`         |         $\Leftarrow$         |
|      `\Longrightarrow`       |      $\Longrightarrow$       |
|       `\Longleftarrow`       |       $\Longleftarrow$       |
|      `\Leftrightarrow`       |      $\Leftrightarrow$       |
| `\iff` `\Longleftrightarrow` | $\iff \ \Longleftrightarrow$ |
|          `\uparrow`          |          $\uparrow$          |
|         `\downarrow`         |         $\downarrow$         |

### 包裹结构

|         Type          |        Typeset        |
| :-------------------: | :-------------------: |
| `\overrightarrow{AB}` | $\overrightarrow{AB}$ |
|    `\overline{AB}`    |    $\overline{AB}$    |
|   `\underline{abc}`   |   $\underline{abc}$   |
|     `\tilde{abc}`     |     $\tilde{abc}$     |
|   `\widetilde{abc}`   |   $\widetilde{abc}$   |
|   `\overbrace{abc}`   |   $\overbrace{abc}$   |
|  `\underbrace{abc}`   |  $\underbrace{abc}$   |

### 括号

### 普通括号

|        Type         |      Typeset       |
| :-----------------: | :----------------: |
|       `(` `)`       |       $(\ )$       |
|       `[` `]`       |       $[\ ]$       |
| `\lbrace` `\rbrace` | $\lbrace\ \rbrace$ |
| `\langle` `\rangle` | $\langle\ \rangle$ |
|   `\vert` `\vert`   |  $\vert \ \vert$   |

使用`\left \(`和`\right \}`打出大的包裹括号. 用`.`代替括号可以空出来一半的括号

### 绝对值/取模

`\left | a \right |` –> $\left | a \right |$

`\left \| \vec{a} \right \|` –> $\left \| \vec{a} \right \|$

### 向量

|                    Type                    |                  Typeset                   |
| :----------------------------------------: | :----------------------------------------: |
|  `\begin{matrix} a&b \\ c&d \end{matrix}`  |  $\begin{matrix} a&b \\ c&d \end{matrix}$  |
| `\begin{pmatrix} a&b \\ c&d \end{pmatrix}` | $\begin{pmatrix} a&b \\ c&d \end{pmatrix}$ |
| `\begin{bmatrix} a&b \\ c&d \end{bmatrix}` | $\begin{bmatrix} a&b \\ c&d \end{bmatrix}$ |
| `\begin{Bmatrix} a&b \\ c&d \end{Bmatrix}` | $\begin{Bmatrix} a&b \\ c&d \end{Bmatrix}$ |
| `\begin{vmatrix} a&b \\ c&d \end{vmatrix}` | $\begin{vmatrix} a&b \\ c&d \end{vmatrix}$ |
| `\begin{Vmatrix} a&b \\ c&d \end{Vmatrix}` | $\begin{Vmatrix} a&b \\ c&d \end{Vmatrix}$ |

两侧括号也可以用 `\left` `\right`+括号 来包裹

**一般矩阵**

```latex
\begin{bmatrix}
{a_{11}}&{a_{12}}&{\cdots}&{a_{1n}}\\
{a_{21}}&{a_{22}}&{\cdots}&{a_{2n}}\\
{\vdots}&{\vdots}&{\ddots}&{\vdots}\\
{a_{m1}}&{a_{m2}}&{\cdots}&{a_{mn}}\\
\end{bmatrix}
```

$$
\begin{bmatrix}
{a_{11}}&{a_{12}}&{\cdots}&{a_{1n}}\\
{a_{21}}&{a_{22}}&{\cdots}&{a_{2n}}\\
{\vdots}&{\vdots}&{\ddots}&{\vdots}\\
{a_{m1}}&{a_{m2}}&{\cdots}&{a_{mn}}\\
\end{bmatrix}
$$

**增广矩阵**

```latex
\left[
    \begin{array}{cc|c}
      1 & 2 & 3 \\
      4 & 5 & 6
    \end{array}
\right]
```

$$
\left[
    \begin{array}{cc|c}
      1 & 2 & 3 \\
      4 & 5 & 6
    \end{array}
\right]
$$

**阵列**

- 需要array环境：起始、结束处以{array}声明
- 对齐方式：在{array}后以{}逐行统一声明
- 左对齐：`l`；居中：`c`；右对齐：`r`
- 竖直线：在声明对齐方式时，插入 `|` 建立竖直线
- 插入水平线：`\hline`

```latex
\begin{array}{c|lll}
{↓}&{a}&{b}&{c}\\
\hline
{R_1}&{c}&{b}&{a}\\
{R_2}&{b}&{c}&{c}\\
\end{array}
```

$$
\begin{array}{c|lll}
{↓}&{a}&{b}&{c}\\
\hline
{R_1}&{c}&{b}&{a}\\
{R_2}&{b}&{c}&{c}\\
\end{array}
$$



### 方程组



```latex
\left\{
\begin{array}{c}
    a_{11}x_1+a_{12}x_2+\cdots+a_{1n}x_n=b_1 \\
    a_{21}x_1+a_{22}x_2+\cdots+a_{2n}x_n=b_2 \\
    \vdots \\
    a_{n1}x_1+a_{n2}x_2+\cdots+a_{nn}x_n=b_n
\end{array}
\right.
```

$$
\left\{
\begin{array}{c}
    a_{11}x_1+a_{12}x_2+\cdots+a_{1n}x_n=b_1 \\
    a_{21}x_1+a_{22}x_2+\cdots+a_{2n}x_n=b_2 \\
    \vdots \\
    a_{n1}x_1+a_{n2}x_2+\cdots+a_{nn}x_n=b_n
\end{array}
\right.
$$

## 文档布局

### 空格

|      Name       |    Type     |   Typeset   |
| :-------------: | :---------: | :---------: |
|     common      |    `aa`     |    $aa$     |
| interword space |   `a\ a`    |   $a\ a$    |
|      1 em       | `a\quad a`  | $a\quad a$  |
|      2 em       | `a\qquad a` | $a\qquad a$ |

### 紧缩

|    Name    |        Type         |       Typeset       |
| :--------: | :-----------------: | :-----------------: |
|            |        `aa`         |        $aa$         |
| thinspace  |       `a\!a`        |       $a\!a$        |
|  medspcae  |  `a\negmedspace a`  |  $a\negmedspace a$  |
| thickspace | `a\negthickspace a` | $a\negthickspace a$ |

### 字号

|        Type        |      Typeset       |
| :----------------: | :----------------: |
|       `text`       |       $text$       |
|    `\tiny text`    |    $\tiny text$    |
|   `\small text`    |   $\small text$    |
| `\normalsize text` | $\normalsize text$ |
|   `\large text`    |   $\large text$    |
|    `\huge text`    |    $\huge text$    |

### 字体

|         Type          |        Typeset        |
| :-------------------: | :-------------------: |
|  `\mathbf{ABCD1234}`  |  $\mathbf{ABCD1234}$  |
| `\mathcal{ABCD1234}`  | $\mathcal{ABCD1234}$  |
|  `\mathit{ABCD1234}`  |  $\mathit{ABCD1234}$  |
|  `\mathrm{ABCD1234}`  |  $\mathrm{ABCD1234}$  |
|  `\mathsf{ABCD1234}`  |  $\mathsf{ABCD1234}$  |
|  `\mathtt{ABCD1234}`  |  $\mathtt{ABCD1234}$  |
|  `\mathbb{ABCD1234}`  |  $\mathbb{ABCD1234}$  |
| `\mathfrak{ABCD1234}` | $\mathfrak{ABCD1234}$ |
| `\mathscr{ABCD1234}`  | $\mathscr{ABCD1234}$  |

## 其他符号

| Name         | Type     | Typeset  |
| ------------ | -------- | -------- |
| Aleph number | `\aleph` | $\aleph$ |
| 普朗克常数   | `\hbar`  | $\hbar$  |
| 维度         | `\dim`   | $\dim$   |
| 核           | `\ker`   | $\ker$   |

**标签**`tag`，这是一个需要在行内公式中才能正常使用的符号

`math\ fomula \tag{tag}`
$$
math\ fomula \tag{tag}
$$

| Type                           | Typeset                      |
| ------------------------------ | ---------------------------- |
| `\oplus`                       | $\oplus$                     |
| `\ominus`                      | $\ominus$                    |
| `\otimes`                      | $\otimes$                    |
| `\oslash`                      | $\oslash$                    |
| `\odot`                        | $\odot$                      |
| `\divideontimes`               | $\divideontimes$             |
| `\mapsto`                      | $\mapsto$                    |
| `\triangleq`                   | $\triangleq$                 |
| `\circ`                        | $\circ$                      |
| `\rightsquigarrow`  `\leadsto` | $\rightsquigarrow\ \leadsto$ |
| `\ni`                          | $\ni$                        |
| `\mho`                         | $\mho$                       |
| `\smile`                       | $\smile$                     |
| `\frown`                       | $\frown$                     |

需要注意的是，在多行数学式中，一般情况下可以使用`\\`来实现换行，但是也有在某些Markdown解析器中（尤其是GitHub的Markdown解析器），需要使用`\\\\`来实现换行

**加粗**

使用`\boldsymbol`
$$
F_i^* = \left(\sum_{f\in J(i)}F^{'}_j\right) \delta_i A(\boldsymbol{Z_i^S,Z_i^R,\theta_S,\theta_R}) + \left(\sum_{n=1}^{N_S}S_{n,i}\alpha_nD_n(\boldsymbol{Z_i^D;\theta_D})\right)A^{'}(\boldsymbol{Z_i^S,Z_i^R,\theta_S,\theta_R})
$$
可以看到小圆括号中的字母都被加粗显示了



等号对齐，递等式计算

```latex
\begin{align}
y &= x^2 + 2x + 1 \\
  &= (x + 1)^2
\end{align}
```

$$
\begin{align}
y &= x^2 + 2x + 1 \\
  &= (x + 1)^2
\end{align}
$$
方程组

```latex
\left\{
\begin{align}
x &= r(t - \sin t) \\
y &= r(1 - \cos t)
\end{align}
\right.
```

$$
\left\{
\begin{align}
x &= r(t - \sin t) \\
y &= r(1 - \cos t)
\end{align}
\right.
$$

正体：`\mathrm{d}`

$$
正体 ： \mathrm{d}
$$

**旋转矩阵：**

二维：

三维：

## 化学

使用化学式可以用`$\ce{}$`来调用

## References

1. [LaTeX 常用符号整理](https://yang-xijie.github.io/BLOG/Math/latex/)
2. [如何在 markdown 中表示矩阵？](https://zhuanlan.zhihu.com/p/269245898)
3. [LaTeX数学公式、常用符号大全](https://zhuanlan.zhihu.com/p/510451940)
4. [Latex简明速查手册(8页)](https://zhuanlan.zhihu.com/p/508559139?utm_source=ZHShareTargetIDMore&utm_medium=social&utm_oi=1068644434085781504https://zhuanlan.zhihu.com/p/508559139?utm_source=ZHShareTargetIDMore&utm_medium=social&utm_oi=1068644434085781504)
5. https://www.latexlive.com/help#d0