---
title: 分汤
slug: soup-servings
date: 2025-10-07
tags:
  - algorithms
---

来自 [leetcode 808.分汤](https://leetcode.cn/problems/soup-servings?envType=daily-question&envId=2025-08-08)

## 问题抽象化

每一轮在下面的四种选择中选一种:

1. A - 4, B - 0
2. A - 3, B - 1
3. A - 2, B - 2
4. A - 1, B - 3

终止条件为: `A <= 0 || B <= 0`

目标: 得到以A触发终止条件的概率, 其中如果A和B同时触发条件的时候取概率的一半

精度要求: $10^{-5}$

## 数学表达

看到这种有状态变化的问题, 首先就可以考虑从动态规划的角度来思考, 状态转移方程为:

$$
dp(i, j) = \frac{1}{4}(dp(i - 4, j) + dp(i - 3, j - 1) + dp(i - 2, j - 2) + dp(i - 1, j - 3))
$$

我们在查看当前状态的时候有:

```c++
if (i <= 0 && j <= 0) return 0.5;
if (i <= 0) return 1;
if (j <= 0) return 0;
if (i > 0 && j > 0) return dp[i][j];
```

## 迭代

有了状态转移方程后就可以考虑迭代:

```c++
// 确定初始条件
vector<vector<double>> dp(n + 1, vector<double>(n + 1));
dp[0][0] = 0.5;
for (int i = 1; i <= n; i++) {
  dp[0][i] = 1.0;
}

// 迭代
for (int i = 1; i <= n; i++) {
  for (int j = 1; i <= n; j++) {
    dp[i][j] = (dp[max(0, i)][j] + 
               dp[max(0, i - 3)][max(j - 1)] + 
               dp[max(0, i - 2)][max(j - 2)] +
               dp[max(0, i - 1)][max(j - 3)]) / 4.0;
  }
}
```

上面取最大值以避免出现复数, 相当于省下了条件语句

我们可以用下面的代码找到这个满足精度的最小的数 `n = 179`, 我们只需要在算法中加入以上的判断即可, 以防超时

```c++
#include <iostream>
#include <vector>
#include <algorithm>

double soupServings(int n) {
  std::vector<std::vector<double>> dp(n + 1, std::vector<double>(n + 1));
  dp[0][0] = 0.5;
  for (int i = 1; i <= n; i++) {
    dp[0][i] = 1.0;
  }

  for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= n; j++) {
      dp[i][j] = (dp[std::max(0, i - 4)][j] + dp[std::max(0, i - 3)][std::max(0, j - 1)] +
                  dp[std::max(0, i - 2)][std::max(0, j - 2)] + dp[std::max(0, i - 1)][std::max(0, j - 3)]) / 4.0;
    }
  }
  return dp[n][n];
}

int main() {
  for (int i = 0; i < 1000; i++) {
    double p = soupServings(i);
    if (p > 0.99999) {
      std::cout << "找到满足条件的最小概率P = " << p << " 时\n最小的数为: " << i << std::endl;
      return 0;
    }
  }
}
```

## 记忆化搜索

前面的动态规划已经可以解决这个问题, 但它的问题是从下往上迭代会出现大量无效的计算, 可以使用记忆搜索提高效率

```c++
std::vector<std::vector<double>> memo;

double dfs(int a, int b) {
  if (a <= 0 && b <= 0) return 0.5;
  else if (a <= 0) return 1;
  else if (b <= 0) return 0;
  if (memo[a][b] > 0) return memo[a][b];

  memo[a][b] = 0.25 * (dfs(a - 4, b) + dfs(a - 3, b - 1) + 
                       dfs(a - 2, b - 2) + dfs(a - 1, b - 3));
  return memo[a][b];
}

double soupServings(int n) {
  n = ceil((double) n / 25);
  if (n >= 179) return 1;
  
  memo = std::vector<std::vector<double>>(n+1, std::vector<double>(n+1));
  return dfs(n, n);
}
```

这种记忆化搜索很巧妙地把`memo`写在`dfs`里面了, 随着递推爆炸式地向下搜索, 并且每次向下搜索都会检查`memo`的值, 如果不为`0`则说明之前已经得到结果了, 就不用再往下搜索分解当前结果了
