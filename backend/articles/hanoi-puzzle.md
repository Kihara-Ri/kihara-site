---
title: hanoi-puzzle
slug: hanoi-puzzle
date: 2025-10-06
tags:
  - algorithms
---


```bash
move(3, A, B, C)
│
├─ 调用 move(2, A, C, B)
│   │
│   ├─ 调用 move(1, A, B, C)
│   │   └─ 直接移动盘 1: A → C
│   │
│   ├─ 返回后移动盘 2: A → B
│   │
│   └─ 调用 move(1, C, A, B)
│       └─ 直接移动盘 1: C → B
│
├─ 返回后移动盘 3: A → C
│
└─ 调用 move(2, B, A, C)
    │
    ├─ 调用 move(1, B, C, A)
    │   └─ 直接移动盘 1: B → A
    │
    ├─ 返回后移动盘 2: B → C
    │
    └─ 调用 move(1, A, B, C)
        └─ 直接移动盘 1: A → C
```