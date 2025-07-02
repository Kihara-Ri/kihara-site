---
title: Rust入门(一)
date: 2024-03-22
tags: 
  - Rust
  - programming
categories: 
  - Tutorial
---

# Rust 入门(一)

<div style="text-align: center">
<img src="https://www.rust-lang.org/static/images/rust-logo-blk.svg" style="display: inline-block; vertical-align= middle;">
<img src="https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/rust_crab_logo.png" style="zoom: 12%; display: inline-block; vertical-align= middle;"/>
</div>

最近听说Rust是一门最近几年非常热门的语言，它结合了大量语言的优点，有媲美C/C++的性能，还更易于管理，安全性和易用性都很强，更是有着语言自身的特性，究竟是怎么回事，还得学习后作出自己的判断

以下的学习过程参照的是Rust的[官方教程](https://doc.rust-lang.org/book/)，粗略一读发现它写的非常详细，很适合新手入门，恨不得把知识塞到你嘴里赶紧用Rust开发程序了

<!-- more -->

## References

1. [https://doc.rust-lang.org/book/](https://doc.rust-lang.org/book/)
2. [https://rustycab.github.io/LearnRustEasy/](https://rustycab.github.io/LearnRustEasy/)

## Getting Started

### Installation

在Linux/macOS下安装Rust可以说是非常方便了，只需下面一条命令：

```bash
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```

确保能使用命令`rustc`，如果提示找不到命令，在`~/.zshrc`中加入路径

```bash
vim ~/.zshrc
# 加入环境变量
export PATH="$HOME/.cargo/bin:$PATH"
```

### Hello, World!

创建目录

```bash
mkdir Rust_projects
cd Rust_projects
mkdir hello_world
cd hello_world
```

创建`main.rs`写下

```rust
fn main() {
  println!("Hello, world!");
}
```

使用`rustc`编译文件并执行

```bash
rustc main.rs
./main
> Hello, world!
```

### Hello, Cargo!

`Cargo`是Rust的包管理工具

查看是否能够正常使用Cargo

```bash
cargo --version
```

**Creating a Prohect with Cargo**

回到项目目录，用下面的命令来创建一个带有`cargo`的项目

```bash
cargo new hello_cargo
cd hello_cargo
```

其中会产生一个`toml`文件(Tom’s Obvious, Minimal Language)，这是`cargo`的配置信息格式

源代码会保存在`src`文件夹下，但是你不必在这个目录下使用刚刚的方式编译，只需留在项目目录下使用

```bash
cargo build
```

因为默认的`build`是`debug build`，cargo会将这个二进制文件放在`debug`目录下，需要到这个目录下执行文件

```bash
$ ./target/debug/hello_cargo
Hello, world!
```

这略微有点麻烦，使用以下命令进行编译和执行

```bash
cargo run
```

检查是否能编译，但是不生成可执行文件

```bash
cargo check
```

这种方法能够快速检查代码是否有错误，如果生成可执行文件，对于一个大项目来说需要耗费很多时间，因此在持续性地写代码时，用这种方法做检查效率更高

简而言之：

- 创建新项目`cargo new`
- 生成项目`cargo build`
- 生成并执行`cargo run`
- 检查`cargo check`
- 查找build到`target/debug`目录下

如果要发布（当然这对现在的我们来说不重要），使用

```bash
cargo build --release
```

这样编译会进行优化，让代码执行得更快，同时编译时间也会增加

## Programming a Guessing Game

### 输入输出

首先先创建一个新项目

```bash
cargo new guessing_game
cd guessing_game
```

然后我们在`src/main.rs`下写下我们的代码

```rust
use std::io

fn main() {
    println!("猜数字游戏");
    println!("输入你猜的数字...");

    let mut guess = String::new();

    io::stdin()
        .read_line(&mut guess)
        .expect("读取失败");
    println!("你猜的数字是：{guess}");
}
```

为了获取用户输入和打印结果作为输出，我们引用了`io`，即input/output library，以这种形式

```rust
use std::io;
```

Rust在标准库中定义了很多东西，每个程序都能默认调用，被称为*预设prelude*，可以在它的标准库文档中看到所有的内容，如果库不在预设中，你就需要额外引入，采用`use`的声明方法

`println!()`是一个宏(macro)，接受参数将字符串打印到屏幕上

**创建变量来存储用户输入**

```rust
let mut guess = String::new();
```

这里的`let`是创建变量的声明，在Rust中变量在默认情况下是不可变的(immutable)，细节会在后面说明，但是目前我们只需要知道这么多

我们在变量名称前加上`mut`，就可以使变量可变(mutable)

右边是`guess`变量被绑定的值，这时调用`String::new`函数的结果，它会返回一个String的新实例，String类型是一段可增长的UTF-8编码的文本。`::`语法表示`new`是`String`类型的一个关联函数，`new`函数会创建一个新的空字符串

**接受用户输入**

调用`stdin`函数来允许处理用户输入

```rust
io::stdin()
    .read_line(&mut guess)
```

即使我们没有声明`use std::io`，我们也可以用这种方式来调用函数`std::io::stdin`，这一点和C++一样，`stdin`返回了`std::io::stdin`的实例(instance)，这是一种表示终端标准输入的句柄(handle)类型

`read_line(&mut guess)`调用了`read_line`方法来获取用户输入的handle，将`&mut guess`作为参数传递给`read_line`

在这里`&`和C++一样，都表达了引用(reference)，它的功能是让你的代码的多个部分都能访问一个数据片段，而不需要多次将这个数据复制到内存中。默认情况下引用和变量都是不可变的，因此要写`&mut guess`，具体原因会在后面的内容详细说明

**处理潜在的错误**

```rust
    .expect("读取失败");
```

注意这里空了四个空格(官方文档中也说明indent是用四个空格而不是Tab的)，用来表示它仍然是当个逻辑代码行的一部分

我们也可以这样写

```rust
io::std().read_line(&mut guess).expect("读取失败");
```

这是代码的完整形式，缺点是比较难读

`read_line`做的事不仅是将用户输入的内容放入我们传递给他的字符串中，它还会返回一个`Result`值，`Result`实际上是一个枚举(enumeration)，它是一个可以处于多个可能状态中的一个类型，当然返回的是一个确定的，不然这不就跟量子力学一样了么（笑），对于每一个可能的状态，我们称为变体(variant)

事实上，`Result`只有两种变体，也就是两种状态，`Ok`和`Err`，`Result`的实例具有`expect`方法，如果`Result`实例返回的值是`Err`，`expect`将会导致程序崩溃

如果不调用`expect`，程序可以编译，但是会受到警告，尚未使用`read_line`返回的`Result`值，表明程序没有应对错误的方法。一般情况下，当出现问题时，我们只要程序崩溃就可以了，因此可以使用`expect`

下面的打印和Python的方法非常相似，不多介绍

### 生成随机数

首先我们需要在依赖处引入`rand`库，打开`toml`文件，加入

```toml
[dependencies]
rand = "0.8.5"
```

之后使用`cargo build`我们就可以看到Rust自动加载了这个库

声明`rand`库

```rust
use rand::Rng
```

给`secret_number`赋值

```rust
let secret_number = rand::thread_rng().gen_range(1..=100);
```

这里我们调用了`rand::thread_rng`函数来提供特定的随机数生成器，然后我们在这个生成器上调用`gen_range`方法

`gen_range`方法接受的参数形式`start..=end`

### 比较

我们引入标准库的一个类型(type)

```rust
use std::cmp::Ordering
```

这个type也是一种枚举，有三种变体`Less`, `Greater`,`Equal`

然后在后面加上

```rust
match guess.cmp(&secret_number) {
        Ordering::Less => println!("guess < secret_number"),
        Ordering::Greater => println!("guess > secret_number"),
        Ordering::Equal => println!("You won"),
    }
```

使用`cmp`方法来比较两个值，这需要调用你需要比较的内容的引用，就好像我们要用某一件物品，我们不需要拿它的原件，只需要用复印件就可以了

下面的三种情况就是`Ordering`的三种变体，我们使用`match`表达式来决定下一步应该做什么，当对应某一种情况时进行相应的操作

这里值的传递逻辑需要思考一下

但是，**需要注意**这仍然不能让代码成功运行起来，尽管逻辑看上去正确，但实际上，Rust具有类型推断的功能，我们定义`let mut guess = String::new()`的时候，Rust就能推断出`guess`是一个`String`，而`secret_number`是数字类型，因此无法进行比较

所以我们需要将`guess`转换成32位数字`u32`

```rust
let guess: u32 = guess.trim().parse().expect("请输入数字");
```

在这里，我们又一次创建了变量`guess`，但是注意之前我们已经有了一个`guess`。这里Rust的机制*shadowing*允许我们通过重用变量名称来覆盖之前的值，这种方法常用来将值从一种类型转换为另一种类型

我们将新变量绑定到`guess.trim().parse()`，这里`trim()`函数用来去除开头和结尾的空格，因为我们在使用`read_line`时必须加上回车，这就回让字符串添加一个换行符。加入你输入了`5`，为了确认，你需要按下`enter`，因此最终保存的字符串其实是`5\n`(如果在Windows上则为`\r\n`)，而`trim`正是用来消除这个的，让最终结果仅为`5`

`parse`方法用来将字符串转换为另一种类型，如果在python中我们肯定会想到通过`parse()`括号中的内容来传递参数，但是在Rust中我们通过`let guess: u32`这个冒号告诉Rust变量的类型

现在告诉了`guess`是一个`u32`，Rust也会通过比较推断出`secret_number`也是一个`u32`

此外，由于`parse`方法潜在的错误，仅适用于逻辑上可以转换为数字的字符，如果传入不可转换成数字的字符则会导致失败，像我们之前处理`read_line`一样加入故障处理`expect`即可

到这里，我们就可以用`cargo run`正确地运行了！

### 循环

因为我们的小游戏需要不断猜测，以让用户有多次机会猜出数字，我们需要使用`loop`创建循环，使用`loop {}`包住循环体就可以了，但是需要注意的是，里面的代码必须带有缩进`indent = 4`四个空格

现在我们成功创建了循环，但是即使我们猜到了正确答案，也没有手段退出，当然使用`control + C`是可以强制退出的

要在程序中写入退出逻辑，直接在正确结果后加上`break`

```rust
Ordering::Equal => {
                println!("You won");
                break;
            }
```

### 处理无效输入

之前的程序中，我们输入非数字时会导致程序崩溃，现在我们需要增加忽略逻辑

```rust
let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => continue,
        };
```

在这个逻辑中`Err(_)`中的下划线(underscore)是一个通配符(catchall value)，也就是说无论`Err`中有什么信息，都只要继续执行程序就可以了。但实际上，这可能导致程序忽略掉`parse`可能遇到的**所有**错误

### Overview

至此我们就完成了小游戏的全部代码，我从中不禁感觉到Rust语言在语法上的奇特，和它对错误处理的执拗。你每进行一个操作，都需要考虑到潜在的错误，这也是我能够在官方教程中明显感受到的

```rust
use std::io;
use rand::Rng;
use std::cmp::Ordering;

fn main() {
    println!("猜数字游戏");
    let secret_number = rand::thread_rng().gen_range(1..=100);
    // println!("The secret number is: {secret_number}");
    loop {
        println!("输入你猜的数字...");

        let mut guess = String::new();

        io::stdin()
            .read_line(&mut guess)
            .expect("读取失败");
        println!("你猜的数字是：{guess}");

        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => continue,
        };
        //比较
        match guess.cmp(&secret_number) {
            Ordering::Less => println!("guess < secret_number"),
            Ordering::Greater => println!("guess > secret_number"),
            Ordering::Equal => {
                println!("You won");
                break;
            }
        }
    }
}
```

## Common Programming Concepts

>
>
>This chapter covers concepts that appear in almost every programming language and how they work in Rust. Many programming languages have much in common at their core. None of the concepts presented in this chapter are unique to Rust, but we’ll discuss them in the context of Rust and explain the conventions around using these concepts.
>
>Specifically, you’ll learn about variables, basic types, functions, comments, and control flow. These foundations will be in every Rust program, and learning them early will give you a strong core to start from.

### Variables and Mutability

**mut**

在Rust中，变量(variables)有两种类型，分为可变和不可变，具体是怎么回事，直接举例说明也许会更直观

```rust
    let x = 5;
    println!("The value of x is: {x}");
    x= 6;
    println!("The value of x is: {x}");

```

在这里我们使用`let x`定义了变量的值，看起来好像没有问题，但是实际在编译的时候就会报错，编译器会提示我们变量`x`是不可变的，`cannot assign twice to immutable variable 'x'`，我们不能给变量分配第二个值。正如我们之前处理过的一样，我们只需在`x`之前加上`mut`来表达它是可变的，这样我们就能得到正确的结果

```bash
The value of x is: 5
The value of x is: 6
```

**Constants**

Constants就是我们所常见的常量，它跟上面的区别是，constants是始终不可变的，我们使用`const`关键字声明而不是`let`

```rust
const THREE_HOURS_IN_SECONDS: u32 = 60 * 60 * 3
```

Constants的声明通常采用大写字母加下划线的组合(all uppercase with underscores between words)，它在程序运行的整个时间内都是有效的

**Shadowing**

这个词我也不知道怎么翻译比较恰当，对于`let`声明的变量，我们可以重复使用`let`来*shadow*掉我们之前定义的变量，这通常用来用来修改变量类型，不过我们还是可以通过一个例子来看一看shadowing的特点的

```rust
	   let y = 5;
    let y = y + 1;
    {
        let y = y * 2;
        println!("The value of y in the inner scope is: {y}");
    }
    println!("The value of y is: {y}");
```

第一行我们定义了变量`y`，它是一个不可变量，但我们可以通过重复使用`let`来改变`y`的值，也就是*shadowing*

之后我们在大括号中(curly brackets)再次使用`let`进行*shadowing*操作，打印出现在的值，最后在大括号外再次打印

结果是这样的

```bash
The value of y in the inner scope is: 12
The value of y is: 6
```

我们可以发现在大括号的内部作用域中的*shadowing*操作并不能在其作用域外产生效果，也就是说这只是一个临时的操作。因此在这里，我们可以发现*shadowing*这种操作就好像拿新的物品把旧的物品给**盖住**了，当我们把新的拿开，旧的其实还在那(这一点会在后面进行详细说明，因为这涉及到了Rust的语言特性)

最后，我们还需要了解的是，`mut`和`shadowing`是两种完全不同的操作，如果我们使用`let mut`来为一个变量作声明并且赋予它可变性，我们确实不需要使用*shadowing*就可以改变它的值，但是这就不允许我们改变这个变量的类型了，如果强行改变就会导致编译器报错
### Data Types

Rust将数据类型分为了两个子集：scalar 和 compound

Rust是一种静态类型的语言，因此它在编译的时候必须知道所有变量的类型，这一点与我所花费大量时间学过的python迥然不同(因为我并不是一个科班程序员，也没有写过任何前后端项目，对我来说开发小脚本和数据处理是更常见的应用)。Rust采用根据值和使用方式来推断我们想要使用的类型(Typescript貌似也有这样的推断机制)，因此当Rust没有办法根据已知信息推断出变量可能的类型时就需要我们声明，比如我们在小游戏代码中写到的一样

```rust
let guess: u32 = "42".parse().expect("Not a number!")
```

#### Scalar Types

Rust有四种主要的标量类型: integers, floating-point numbers, Booleans, 和 characters.这和绝大多数的编程语言是一样的，但是我认为还是很有必要重新呈现一下，因为Rust在细节上有着与其他编程语言不同的特质

**Integer Types**

整型变量分为两种，有符号数和无符号数，计算机基础课程上前几节课就会提到这个，简而言之就是有符号数使用数字开头第一位作为补码，用于表示数字的正负，因此在这种情况下，如果是一个八位的二进制数，它只能表达最多$2^7 -1$，即从-128到127，因为还得分一半空间给负数。而无符号数显然就能够充分利用所有的空间$2^8 - 1$，即0到255

下表是Rust中所有整型的表达

| Length  | Signed  | Unsigned |
| ------- | ------- | -------- |
| 8-bit   | `i8`    | `u8`     |
| 16-bit  | `i16`   | `u16`    |
| 32-bit  | `i32`   | `u32`    |
| 64-bit  | `i64`   | `u64`    |
| 128-bit | `i128`  | `u128`   |
| Arch    | `isize` | `usize`  |

其中`isize`和`usize`类型取决于运行程序的计算机的体系结构，如果你是64位的计算机，则为64位

除此以外，Rust在表达数字上还有非常方便的一点，你可以通过增加`_`来作为分隔符，让数字更容易阅读

| Number literals | Example       |
| --------------- | ------------- |
| Decimal         | `98_222`      |
| Hex             | `0xff`        |
| Octal           | `0o77`        |
| Binary          | `0b1111_0000` |
| Byte(仅`u8`)    | `b'A'`        |

在Rust中，默认的整型为`i32`

**Floating-Point Types**

在Rust中，有两种浮点类型`f32`和`f64`，并且默认类型为`f64`，在现代CPU上，它的速度与`f32`大致相同并且能有更高的精度

**The Boolean Type**

和大多数编程语言一样，Rust中的布尔类型的两个值为`true`和`false`(这里python是一个例外)，布尔值的主要应用场景是`if`表达式

**The Character Type**

Rust中最基础的字母类型是`char`，要注意`char`要使用**单引号**的文本，Rust的`char`类型大小为4个字节，并且表示Unicode Scalar Value，因此它还可以表示ASCII以外的东西，包括中日韩文字，emoji等，细节将在后面详细讨论

#### Compound Types

Rust有两种基础的复合类型：元组(tuples)和数组(arrays)

**The Tuple Type**

元组可以包含各种类型的值，拥有固定的长度，并且一旦声明就不能更改长度

我们可以用这样的方式生成元组

```rust
let tup: (i32, f64, u8) = (500, 6.4, 1);
```

同样，我们也可以这样解构(destructure)元组

```rust
let (x, y, z) = tup;
```

我们还可以使用`.`(period)跟上索引来直接访问元组中的元素

```rust
let float_number = tup.1;
```

**The Array Type**

数组中的每个元素都必须拥有相同的类型，而且与python和其他语言不同的是，Rust中的数组长度是固定的，这和当年折磨我的C++如出一辙，不过C++在这方面更为严格

在Rust中，如果你希望将数据分配在stack上而不是heap上时，或希望确保始终拥有固定数量的元素时，数组非常有用。但是如果你想要像在python中那样灵活方便地操纵数组，应该使用标准库中提供的向量

比如像这种情况下，使用数组会更好：

```rust
let month = ["January", "February", "March", "April", "May", "June", "July", "Augut", "September", "November", "December"];
```

声明数组

```rust
let a: [i32; 5] = [1,2,3,4,5];
```

注意这里用的是分号(semicolon)，如果编译器能推断的话，不写也是可以的

也可以指定初始值，生成指定长度的包含相同元素的数组

```rust
let a = [3;5];
```

访问数组跟python是一样的

```rust
let first = a[0];
let second = a[1];
```

### Functions

#### Functions

使用`fn`来声明(declare)函数

Rust使用*snake case*作为函数和变量名的常规样式，即所有字母小写，单词之间添加下划线

```rust
fn main() {
    print_labeled_measurement(5, 'h');
}

fn print_labeled_measurement(value: i32, unit_label: char) {
    println!("The measurement is: {value} {unit_label}");
}
```

大括号(curly brackets)用来告诉编译器函数体开始和结束的位置

通过输入函数名称和后面跟的一组括号(parentheses)来调用我们定义的函数

我们可以发现，我们在主函数后面定义的`print_labeled_measurement`，但是这个程序仍然可以执行(这一点在python中是做不到的)，因为Rust并不关心你在哪里定义了函数，它只关心在作用域中是否可以被调用(only that they’re defined somewhere in a scope that can be seen by the caller)

**Parameters**

参数也可以被更精准叫做*arguments*，但是这不重要，这在我们这儿是等价的

看上面的程序，我们在定义函数的时候声明了变量的类型`value: 32, unit_label: char`，这在Rust中是**必须**的，Rust故意设计成这样，因而编译器就可以在你根本不使用这些变量时也能知道变量的类型(前面提到的Rust有类型的推断功能，但是如果变量都没出现过，还怎么推断呢？)，而且如果编译器知道变量类型，它在返回错误信息的时候可能更有用，更利于debug

#### Statements and Expressions

这是很重要的一部分内容

Rust是一门 expression-based 语言，我们首先要分清 statements 和 expressions

- Statements 是执行某些操作但不返回值的指令
- Expressions 用来计算值的结果

```rust
fn main() {
    let y = 6;
}
```

在这里`let y = 6;`就是一个statement，以`;`作结尾表示语句完毕，因为statement不返回值，因此不能将这个语句分配给另一个变量

```rust
let = x (let y = 6); //error
```

这样的语句就是错误的，因为`let y = 6` 不返回值，所以`x`并没有任何内容可以绑定，那么什么是 expression 呢？这其中`6`就是一个expression，你可以想象成一个函数映射`6 -> 6`。调用函数、调用宏(macro)都是expression，用大括号创建一个新的作用域区块也是一个expression，比如

```rust
fn main() {
    let y = {
        let x = 3;
        x + 1
    };
    println!("The value of y is: {y}");
}
```

```bash
> The value of y is: 4
```

其中

```rust
{
    let x = 3;
    x + 1
}
```

就是一个块(block)，或者这样写可能更符合我们对表达式的认知

```rust
    let y = {let x = 3;x + 1};
```

我们可以看见`x + 1`并没有加`;`，如果加了分号就被转换成了语句，这样就不会返回任何值

#### Functions with Return Values

函数可以将值返回给调用它的代码，在Rust中，函数的返回值与函数体中最后的表达式(expression)是同义的(synonymous)，使用`return`关键字指定一个值来提前返回是ok的，但是大多数函数都会隐式返回最后一个表达式，我们使用`->`(arrow)并在后面声明类型就可以

```rust
fn five -> i32 {
    5
}

fn main() {
    let x = five();
    println!("The value of x is: {x}");
}
```

这与`let x = 5`表达的含义相同，因为`5`在这里就是一个完整的表达式，如果加上`;`就称为了一个statement，这就回导致编译器报错，函数将返回一个`i32`，但是statement并不会去求值，因此会返回`()`，这就是一个`unit type`

### Comments

Rust使用`//`双斜杠进行注释，这和大部分用`;`的语言相同，多行注释也是用同样的方法

此外，Rust中还有文档注释(Documentation comments)，使用三个斜杠`///`，并且支持Markdown标记语言来格式化文本(喜

### Control Flow

根据条件重复运行某些代码的能力是大多数编程语言中的基本功能，在Rust中最常见的控制方法就是`if`表达式和循环

#### if不同于其他语言的地方

在使用`if`表达式的时候，Rust有一些与其他语言不同的地方，比如这一段代码

```rust
fn main() {
    let number = 3;
    if number {
        println!("number is three");
    }
}
```

编译器是会报错的，它会告诉我们`number`必须是一个`bool`类型，当然你如果在VSCode中安装了**rust-analyzer**插件，会直接在编辑器中发现错误，并且能够看见`number`的类型

<img src="https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/image-20240324222253816.png" alt="image-20240324222253816" style="zoom:50%;" />

与其他语言不同，Rust不会自动尝试将非布尔类型转换为布尔类型，因此必须明确条件为布尔值，这也是Rust语言特性所突出强调的变量类型

当然我们也可以通过逻辑判断：

```rust
if number != 0 
```

这也许是更经常写的条件判断句

对于多种可能，Rust也采用`else if `来处理多种不同情况，我们也要注意，一旦找到第一个符合条件的情况，后面的情况即使符合条件，也不会被执行，因为Rust只执行第一个`true`条件，剩余的就不会被检查

当然，使用太多`else if`会导致代码混乱，如果有多个表达式，Rust也提供了`match`方法，这在我们之前的小游戏中用过了，它采用叫做*arm*的分支结构，代码可读性很好

#### 在let语句中使用if

这给我一种写python函数推导式的感觉

因为`if`属于表达式，因此它能返回值，我们可以在`let`语句的右边加上`if`用来判断分配变量

```rust
let condition = ture;
let number = if condition {5} else {6};
```

在Rust中，我们要铭记一个非常重要的概念！⚠️⚠️⚠️

> Remember that blocks of code evaluate to the last expression in them, and **numbers** by themselves are also expressions.
>
> 我们时刻要记住数字可以是一个映射f(x) = x，在这种情况下5 -> 5

整个`if`表达式的值都取决于执行哪个代码块，因此`if`的每一个臂(arm)或者分支返回的值都必须是相同的类型，如果我们将上面的情况改一下

```rust
let number = if condition {5} else {"six"};
```

编译器就会报错，这在我们人类的逻辑看起来好像并无不妥，但是我们从编译器的角度思考，Rust需要在编译的时候**明确**知道`number`变量是什么类型，编译器知道了`number`的类型就可以在任何地方验证可用，Rust没有办法做到让`number`的类型仅在运行时确定，如果要做到这样的功能，相比编译器会更加复杂吧，并且可靠性也会降低

#### loop循环

我们在之前的小游戏中就用到过`loop`了，它不需要条件就能进入循环，在循环中我们可以使用`break`来跳出循环，这在之前我们也使用过了，但实际上`break`关键字还可以携带语句，比如在这个例子中

```rust
fn main() {
    let mut counter = 0;
    let result = loop {
        counter += 1;
        if counter ==10 {
            break counter * 2;
        }
    };
    println!("The result is {}", result);
}
```

```bash
The result is 20
```

程序输出如我们所想

#### 消除歧义

Rust的循环结构有一个非常有意思的点，如果出现循环套着循环的结构，当然这在我们平时的编程中也很常见，`break`和`continue`位于内层循环，我们可以选择在循环上指定标签，然后通过在关键字上添加标签实现精准控制，消除歧义

循环标签采用单引号(single quote)`‘`

```rust
fn main() {
    let mut count = 0;
    'counting_up: loop {
        println!("count = {count}");
        let mut remaining = 10;
        loop {
            println!("remaining = {remaining}");
            if remaining == 9 {
                break;
            }
            if count == 2 {
                break 'counting_up;
            }
            remaining -= 1;
        }
        count += 1;
    }
    println!("End count = {count}");
}
```

```bash
>>
count = 0
remaining = 10
remaining = 9
count = 1
remaining = 10
remaining = 9
count = 2
remaining = 10
End count = 2
```

我们发现`count`为2时会跳出整个循环

#### while循环

当然上面的代码用`while`循环写的话会简洁很多，`while`允许我们对循环的进行添加条件

```rust
fn main() {
    let a = [10,20,30,40,50];
    let mut index = 0;
    while index < 5 {
        println!("the value is: {}", a[index]);
        index += 1;
    }
}
```

这种方法很好，但是Rust在应对这样的遍历时有更好的方法

#### for循环

上面的代码更容易出错，如果你减少了数组元素，但是又没有更新条件，就会发生错误。此外，我们在上面对循环条件作了检查，编译器添加了运行时代码来在循环的每次迭代中执行索引是否在数组范围内的条件检查，这会导致代码变慢

`for`循环可以为这个集合中的每一个项目执行代码的操作

```rust
fn main() {
    let a = [10,20,30,40,50];
    for element in a {
        println!("The value is: {element}");
    }
}
```

既保障了安全性又不失简介性，因此`for`循环是`Rust`中最常用的循环语句

当然，`for`循环也能像`while`循环一样做到按顺序生成一个数字到另一个数字之前结束的循环

```rust
fn main() {
    for number in 1..4 {
        println!("{number}");
    }
    println!("OVER")
}
```

```bash
>>
1
2
3
OVER
```

```rust
fn main() {
    for number in (1..4).rev() {
        println!("{number}");
    }
    println!("OVER")
}
```

```bash
>>
3
2
1
OVER
```

