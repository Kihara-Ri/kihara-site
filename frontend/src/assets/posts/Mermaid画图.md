---
title: Mermaid画图
date: 2023-12-26
tags: 
  - Mermaid
  - 语法
  - 画图
categories: 
  - Technology
---

# Mermaid画图

随着 html 和 JavaScript 的深入学习，越发觉得 Mermaid 的功能强大，网络上关于 Mermaid 画图的教程往往都是新手向的，点到即止，信息密度极低且内容分散，故在此记录平时遇见的Mermaid 语法，积少成多，最后形成一个完整的知识体系，本文中关于平时遇到的问题与查阅到的解决方案都会列在参考链接中，以供快速查看原文

<!-- more -->

## subgraph的左右问题

查看右边的链接：[Mermaid Subgraphs Laid Out Inconsistently](https://stackoverflow.com/questions/71803509/mermaid-subgraphs-laid-out-inconsistently)

如下面一段代码

```mermaid
graph LR

	subgraph 旅馆 
		direction LR %% <-- here
		1 --> 2 --> 3 --> 4 --> 5 --> 6 --> 7 --> 8 --> 9 --> ...
	end
	
	subgraph 客人 
		direction LR %% <-- here
		A((1)) --> B((2)) --> C((3)) --> D((4)) --> E((5)) --> F((6)) --> G((7)) --> H((8)) --> I((9)) --> J((...))
	end
	
	1 -.-> A
	2 -.-> B
	3 -.-> C
	4 -.-> D
	5 -.-> E
	6 -.-> F
	7 -.-> G
	8 -.-> H
	9 -.-> I
	
```



## 其他的Mermaid图

### ER图

E-R图 (Entity Relationship Diagram)，实体-联系图，提供了表示实体类型、属性和联系的方法，用来描述现实世界的概念模型

**关系**

| 左值 | 右值 | 含义        |
| ---- | ---- | ----------- |
| `|o` | `o|` | 0个或1个    |
| `||` | `||` | 有且仅有1个 |
| `}o` | `o{` | 0个或多个   |
| `}|` | `|{` | 1个或多个   |

**示例**

```mermaid
erDiagram
    CAR ||--o{ NAMED-DRIVER : allows
    CAR {
        string registrationNumber
        string make
        string model
    }
    PERSON ||--o{ NAMED-DRIVER : is
    PERSON {
        string firstName
        string lastName
        int age
    }
```

### gantt 甘特图

甘特图，每项任务描述有5个配置，其含义如下

| 位置 | 含义         | 可选值                                                  |
| ---- | ------------ | ------------------------------------------------------- |
| 1    | 是否关键     | `crit/缺省`， crit会展示为红色                          |
| 2    | 状态         | `done/active/缺省`，完成灰色/激活蓝色                   |
| 3    | 别名         | `给定别名/缺省`任务别名                                 |
| 4    | 任务开始时间 | `YYYY-MM-DD/after 其他代号/缺省`                        |
| 5    | 任务结束时间 | `YYYY-MM-DD/持续时长/缺省`，h表示小时，d表示天，w表示周 |

```mermaid

gantt
    dateFormat  YYYY-MM-DD
    title       Adding GANTT diagram functionality to mermaid
    excludes    weekends
    %% (`excludes` accepts specific dates in YYYY-MM-DD format, days of the week ("sunday") or "weekends", but not the word "weekdays".)

    section A section
    Completed task            :done,    des1, 2014-01-06,2014-01-08
    Active task               :active,  des2, 2014-01-09, 3d
    Future task               :         des3, after des2, 5d
    Future task2              :         des4, after des3, 5d

    section Critical tasks
    Completed task in the critical line :crit, done, 2014-01-06,24h
    Implement parser and jison          :crit, done, after des1, 2d
    Create tests for parser             :crit, active, 3d
    Future task in critical line        :crit, 5d
    Create tests for renderer           :2d
    Add to mermaid                      :1d
    Functionality added                 :milestone, 2014-01-25, 0d

    section Documentation
    Describe gantt syntax               :active, a1, after des1, 3d
    Add gantt diagram to demo page      :after a1  , 20h
    Add another diagram to demo page    :doc1, after a1  , 48h

    section Last section
    Describe gantt syntax               :after doc1, 3d
    Add gantt diagram to demo page      :20h
    Add another diagram to demo page    :48h
```

### 饼图

关键字`pie`

```mermaid
pie
    title Key elements in Product X
    "Calcium" : 42.96
    "Potassium" : 50.05
    "Magnesium" : 10.01
    "Iron" :  5
```

### 时间轴图

关键字`timeline`

```mermaid
timeline
        title England's History Timeline
        section Stone Age
          7600 BC : Britain's oldest known house was built in Orkney, Scotland
          6000 BC : Sea levels rise and Britain becomes an island.<br> The people who live here are hunter-gatherers.
        section Bronze Age
          2300 BC : People arrive from Europe and settle in Britain. <br>They bring farming and metalworking.
                  : New styles of pottery and ways of burying the dead appear.
          2200 BC : The last major building works are completed at Stonehenge.<br> People now bury their dead in stone circles.
                  : The first metal objects are made in Britain.Some other nice things happen. it is a good time to be alive.
```

### 类图

类图属于UML中结构图中典型的一种，顾名思义，类图是用来描述类的，因此叫 class diagram ，由很多静态的说明性模型元素组成

使用`mermaid`绘制以说明类图

```mermaid
classDiagram
%% 结构体声明
	class Season {
	<< enum >>
	+Season SPRING
	+Season SUMMER
	+Season AUTUMN
	+Season WINTER
	
	+publicMethd() temp
	
	}

```

#### 元素

**类元素**

访问修饰符，用于表示类元素的可见范围

| 符号 | 含义               |
| ---- | ------------------ |
| `+`  | `public`           |
| `-`  | `private`          |
| `#`  | `protected`        |
| `~`  | `package/friendly` |
| `$`  | `static`           |
| `*`  | `abstract`         |
| `~~` | 泛型               |

**类注释**

用来标记一个类的元素据，以`<<`开始，`>>`结束，在html中，需要开关前后有一个空格即`<< interface >>`，常用的如下

| 符号              | 类型      |
| ----------------- | --------- |
| `<<interface>>`   | 接口      |
| `<<abstract>>`    | 抽象类    |
| `<<service>>`     | service类 |
| `<<enumeration>>` | 枚举      |

元素据可以是自定义的任何内容

#### 类关系

**继承**

类继承另一个类或接口继承另一个接口

```mermaid
classDiagram
direction LR
Parent <|-- Child
```


**实现**

类实现接口

```mermaid
classDiagram
direction LR
class Parent {
	<< interface >>
}
Child ..|> Parent

```

**关联**

表示一种`拥有`的关系，A类作为B类的成员变量，若B类也使用了A类作为成员变量则为双向关联

```mermaid
classDiagram
direction LR
class Car {
+run() void
}
class Driver {
+Car car
+drive() void
}
Driver --> Car
```

**依赖**

表示一种`使用`的关系，参数依赖、局部变量、静态方法/变量依赖

```mermaid
classDiagram
direction LR
class Car {
+run() void
}
class Driver {
+drive(car:Car) void
}
Driver ..> Car
```

**聚合**

是一种强关联关系，在代码语法上与关联无法区分

```mermaid
classDiagram
direction LR
class Car {
+run() void
}
class Driver {
+Car car
+drive() void
}
Driver "1" o-- "1" Car
```

**组合**

也是一种强关联关系，比聚合关系还要强

```mermaid
classDiagram
direction LR
Company "1" *-- "N" Dept
```

**综合图**

```mermaid
classDiagram
direction BT
%% 代谢基础水和氧气
class Water
class Oxygen
%% 生命接口
class Life {
    <<interface>>
    +metabolize(water:Water, oxygen:Oxygen)* void
}
Life ..> Water
Life ..> Oxygen
%% 动物
class Animal {
    <<abstract>>
    +String name
    +int age
    +String sex
    
    +breed()* void
}
%% 实现生命接口
Animal ..|> Life

%% 哺乳动物继承动物
class Mammal {
    +breed()* List~Mammal~
}
Mammal --|> Animal

class Dog {
    +Dog mate
    +breed()* List~Dog~
}
Dog --|> Mammal
Dog --> Dog

%% 鸟类继承动物，并且鸟有一双翅膀
class Wing
class Bird {
    +Wing left
    +Wing right
    +fly()* void
}
Bird "1" o-- "2" Wing
Bird --|> Animal

%% 鸟群
class BirdCluster {
    +List~Bird~ birds
    
    +lineup() void
}

BirdCluster "1" *-- "n" Bird
```



## References

1. [https://xsaxy.gitee.io/docs/markdown/扩展语法超集-Mermaid-流程图](https://xsaxy.gitee.io/docs/markdown/扩展语法超集-Mermaid-流程图)
2. [Mermaid Subgraphs Laid Out Inconsistently](https://stackoverflow.com/questions/71803509/mermaid-subgraphs-laid-out-inconsistently)
3. https://mermaid.js.org/intro/