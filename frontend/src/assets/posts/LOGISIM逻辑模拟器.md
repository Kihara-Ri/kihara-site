---
title: LOGISIM逻辑模拟器
date: 2024-04-20
tags: 
  - C
  - Python
categories: 
  - CS
---

# 🟢 LOGISIM 逻辑模拟器

这个小玩具是我在南京大学操作系统概述课上面看到的，本身的代码比较底层，可能没有比较坚实代码基础的同学都不大看得懂代码在干什么。这个程序实现了数码管在终端的模拟，每一秒跳一次，使用C语言来模拟数字电路，使用Python来构造模板然后输出到终端上。这个小项目令我感到惊叹的地方是，我们简单地通过终端的shell就让两个程序进行了交互，将C语言每秒运行的输出传递到Python中，然后Python随机给出输出。很多情况下，我们总是想着一个程序或者一个文件完成所有的工作，往往忽略了很多的工作可以通过不同的语言模块化完成，各取所长

<!-- more -->

## 数字电路的模拟

数字电路的模拟部分采用了C语言

```c title="头文件 logisim.h"
#include <stdio.h>
#include <stdbool.h>
#include <unistd.h>

//导线
typedef bool wire;

// Flip-flops触发器
typedef struct {
    bool value; // The current value stored in the flip-flop
    wire *in; // Pointer to the input wire
    wire *out; // Pointer to the output wire
} reg;

//逻辑门 NAND

// NAND gate
#define NAND(X,Y) (!((X) && (Y)))

// NOT gate
#define NOT(X) (NAND(X,1))

// AND gate
#define AND(X,Y) (NOT(NAND(X,Y)))

// OR gate
#define OR(X,Y) (NAND(NOT(X), NOT(Y)))

// Clock cycles
#define CLOCK_CYCLE while (1)
```


```c title="源文件 logisim.c"
#include <logisim.h>
#include <stdio.h>

// Wires and registers in the circuit
wire X,Y,X1,Y1,A,B,C,D,E,F,G;
reg b1 = {.in = &X1, .out = &X};
reg b0 = {.in = &Y1, .out = &Y};

int main() {
    CLOCK_CYCLE {
        X1 = AND(NOT(X),Y);
        Y1 = NOT(OR(X,Y));
        A = D = E = NOT(Y);
        B = 1;
        C = NOT(X);
        F = Y1;
        G = X;

        b0.value = *b0.in;
        b1.value = *b1.in;
        *b0.out = b0.value;
        *b1.out = b1.value;

        #define PRINT(X) printf(#X " = %d; ", X)
        PRINT(A);
        PRINT(B);
        PRINT(C);
        PRINT(D);
        PRINT(E);
        PRINT(F);
        PRINT(G);
        printf("\n");
        fflush(stdout);
        sleep(1);
    }
}
```

编译使用下面的命令：

```bash title="编译"
gcc -o logisim -I. logisim.c
```

## 模板构建

采用Python构建模板，将数字信号转换成直观的图像输出到终端

```py title="seg-display.py"
import fileinput

TEMPLATE = '''
     AAAAAAAAA
    FF       BB
    FF       BB
    FF       BB
    FF       BB
     GGGGGGGG
   EE       CC
   EE       CC
   EE       CC
   EE       CC
    DDDDDDDDD
'''

# These are ANSI Escape Codes
# This site to copy: https://symbl.cc/cn/unicode/blocks/block-elements/
CLEAR = '\033[2J\033[1;1f'
WHITE = '\033[37m░\033[0m'
BLACK = '\033[31m█\033[0m'

for line in fileinput.input():
    exec(line, (ctx := {}))
    
    disp = CLEAR + TEMPLATE
    
    for ch in 'ABCDEFG':
        block = {
            0: WHITE,
            1: BLACK,
        }.get(ctx.get(ch, 0), '?') # .get(ctx[ch], '?')
        disp = disp.replace(ch, block)
        
    print(disp)
```

使用管道将两个程序连接起来:

```bash
./logisim | python seg-display.py
```

现在我们就能看到两个程序正常工作了：

![GIF Recording 2024-04-21 at 1.34.14 PM](https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/GIF%20Recording%202024-04-21%20at%201.34.14%20PM.gif)
