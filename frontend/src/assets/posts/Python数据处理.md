---
title: Python数据处理
date: 2023-12-11
tags: 
  - python
  - data
  - matplotlib
categories: 
  - Log
---

# Python 数据处理

最近做实验有点多，因此经常使用python进行数据处理和画图，这里记录一下最近使用python碰到的问题和解决方法，算得上是一些总结和经验之谈吧

<!-- more -->

**读取`csv`文件**

```python
import numpy as np
import csv

with open("Abs_data.csv", "r") as csvfile:
    csvreader = csv.reader(csvfile)
    nm = [row[0:1] for row in csvreader][1:]
    Abs = [row[1:2] for row in csvreader][1:]
    
nm = np.array(nm).astype(float)
Abs = np.array(Abs).astype(float)
print(Abs)
# import matplotlib.pyplot as plt
# plt.plot(nm, Abs, color = 'orange')
# plt.rc('font', family = 'Heiti TC')
# plt.xlabel(r" 波长 $\mathrm{/nm}$")
# plt.ylabel(r"吸光度 $\mathrm{/Abs}$")
# plt.legend(loc = 1)
# plt.show()
```

上面是一个绘制不同波长下吸光度曲线的脚本，在打开`csv`文件的时候出现了问题![Screenshot 2023-10-18 at 15.10.22](https://mdstore.oss-cn-beijing.aliyuncs.com/Screenshot%202023-10-18%20at%2015.10.22.png)

我们来看一下它的问题，读取的`Abs`是一个空数组，但是同样的方法读取的`nm`却是正常的结果

原因在于`csv.reader`是一个可迭代对象，第一次提取`nm`的时候，内部指针已经到了文件的末尾，所以再次执行，已经没有数据可执行

解决方案：

可以先将数据存储在列表中，再转换成`Numpy`数组

```python
nm = []
Abs = []
with open("Abs_data.csv", "r") as csvfile:
    csvreader = csv.reader(csvfile)
    next(csvreader)
    for row in csvreader:
        nm.append(float(row[0]))
        Abs.append(float(row[1]))
        
nm = np.array(nm)
Abs = np.array(Abs)
```

简洁完美！

---

**字体**

使用字体前最好先查看有哪些字体可以使用，可以使用下面的代码来打印出`matplotlib`库中有的字体

```python
# 查询当前系统所有字体
from matplotlib.font_manager import FontManager
import subprocess

mpl_fonts = set(f.name for f in FontManager().ttflist)

print('all font list get from matplotlib.font_manager:')
for f in sorted(mpl_fonts):
    print('\t' + f)
```


总感觉这是一个很玄学的设定，如下面的代码

```python
import matplotlib.pyplot as plt
plt.plot(nm, Abs, color = 'orange')
plt.rc('font', family = 'Songti SC')
plt.xlabel(r"波长  $\mathrm{/nm}$")
plt.ylabel(r"吸光度 $\mathrm{/Abs}$")
plt.show()
```

但是只需将作图和设置字体的代码的位置进行调整，就可以正常运行🥲

```python
import matplotlib.pyplot as plt
plt.rc('font', family = 'Songti SC')
plt.plot(nm, Abs, color = 'orange')
plt.xlabel(r"波长  $\mathrm{/nm}$")
plt.ylabel(r"吸光度 $\mathrm{/Abs}$")
plt.show() 
```
<center>
<table><tr>
  <td><img src="https://mdstore.oss-cn-beijing.aliyuncs.com/Screenshot%202023-10-18%20at%2015.52.59.png" width = "400"></td>
  <td><img src="https://mdstore.oss-cn-beijing.aliyuncs.com/Screenshot%202023-10-18%20at%2015.53.13.png" width = "400"></td>
</tr></table>
</center>
 
**读取`csv`并且用python写入数据到`csv`中**


