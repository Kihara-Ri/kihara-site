---
title: Linux | 系统文件
date: 2024-08-21
tags:
  - Linux
categories:
  - CS
---

# 🟠 **Linux | 系统文件**

尝试在 :my-linux: Linux 上运行一些服务，并且监控系统的情况以了解服务对机器性能的需求

<!-- more -->

## **获取CPU占用情况**

通过读取`/proc/stat`文件可以得到CPU的状态信息

``` shell
$ cat /proc/stat
cpu  265457 224 193668 193624599 19900 0 8015 0 0 0
cpu0 78200 50 90042 48314597 6047 0 6719 0 0 0
cpu1 63349 81 36864 48424796 3958 0 416 0 0 0
cpu2 74610 58 44242 48411589 4931 0 624 0 0 0
cpu3 49297 33 22520 48473616 4963 0 254 0 0 0
intr 135358423 0 89790 12790837 0 0 0 3136867 0 0 0 0 99537518 0 0 319611 236020 0 0 0 0 0 0 0 0 0 0 0 0 2372427 0 38 94 0 0 0 0 7556 16851119 0 30 16516 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
ctxt 232196640
btime 1723714175
processes 14711
procs_running 1
procs_blocked 0
softirq 42450552 17 7365150 5 1263334 0 0 11826642 12083021 3 9912380
```

我们来解读一下这些信息：

`cpu0~3`显示了4个核的状态

:my-cpu: `cpu`项的输出包含了十段数字，并且我们可以发现最后3个为`0`，先了解一下前7个，从左到右依次为:

1. `user`为从系统启动到现在，在用户模式下运行的总时间，不包含`nice`优先级低于`0`的进程
2. `nice`为在用户模式下运行的所有`nice`优先级低于`0`的进程所消耗的总时间
3. `system`为系统启动到现在，在内核模式下运行的时间
4. `idle`为从系统启动到现在，CPU空闲的时间
5. `iowait`为CPU等待 I/O 操作完成的时间
6. `irq`为处理硬中断(Hardware Interrupts)的时间
7. `softirq`为处理软中断(Software Interrupts)的时间

后三段为`0`的数字含义为:

1. `steal`为被其他操作系统（虚拟机中的操作系统）`偷走`的时间，如果我们在虚拟化环境中运行这个系统，虚拟机监控程序可能会`偷走`一些CPU时间来执行其他虚拟机的操作
2. `guest`为在虚拟化环境中，CPU在客体操作系统(guest OS)上运行的时间
3. `guest_nice`为在虚拟化环境中，具有`nice`值的低优先进程在客体操作系统上运行的时间

因此如果你使用真实的硬件来运行这个系统，后面三项都是`0`

在`cpu`信息下面还有几行信息，分别进行简单的说明:

1. `intr`: 中断统计信息，第一列是中断发生的总数，后面的每列代表着每种中断的发生次数
2. `ctxt`: 上下文切换的次数，通俗地来说就是系统从一个进程切换到另一个进程的次数
3. `btime`: 系统自上次启动以来的时间，即通过这个数字我们可以知道系统是什么时候开始启动(运行)的以及运行了多久，时间以 [Unix 时间戳](https://en.wikipedia.org/wiki/Unix_time)的方式显示，通过命令行:
``` shell
date -d @1723714175
```
可以将时间转换成人类可读的格式

4. `processes`: 系统启动以来创建的进程总数
5. `procs_running`: 当前正在运行的进程总数
6. `procs_blocked`: 当前被阻塞的进程数量(等待 I/O 操作完成)
7. `softirq`: 软中断统计信息

明白含义后，我们可以尝试通过这些信息来计算CPU的使用率，需要注意上面的数字单位为 *jiffies* (时钟周期) /`1/100` 秒

我们的操作方法是每1秒采一次样，然后对前后两次采样的数据作差得到这段时间的变化量:

``` shell title="计算总时间差"
total_time_diff = (user2 + nice2 + system2 + idle2 + iowait2 + irq2 + softirq2 + steal2) 
- (user1 + nice1 + system1 + idle1 + iowait1 + irq1 + softirq1 + steal1)
```

``` shell title="计算空闲时间差"
idle_time_diff = (idle2 + iowait2) - (idle1 + iowait1)
```

``` shell title="计算CPU使用率"
cpu_usage = 100 * (total_time_diff - idle_time_diff) / total_time_diff
```

通过下面的脚本可以每1秒采一次样，并且将计算得到的CPU利用率记录在csv文件中:

=== "Python"

    ``` py linenums="1"
    import time
    from datetime import datetime
    import csv
    import os

    def get_cpu_times():
      with open("/proc/stat", "r") as f:
        line = f.readline().strip()
      cpu_times = list(map(int, line.split()[1:]))
      return cpu_times

    def calculate_cpu_usage(cpu_times1, cpu_times2):
      total_time_diff = sum(cpu_times2) - sum(cpu_times1)
      idle_time_diff = (cpu_times2[3] + cpu_times2[4]) - (cpu_times1[3] + cpu_times1[4])
      usage = 100 * (total_time_diff - idle_time_diff) / total_time_diff
      return usage

    def todayis():
      today = datetime.now().strftime("%Y-%m-%d")
      return today
    def current_time():
      current_time = datetime.now().strftime("%H:%M:%S")
      return current_time
      
    def main():
      csv_file = f"cpu_usage-{todayis()}.csv"
      if not os.path.exists(csv_file):
        with open(csv_file, "w", newline="") as f:
          writer = csv.writer(f)
          writer.writerow(["Time", "CPU Usage (%)"])

      try:
        print("主函数启动，开始采集数据")
        # 循环采样
        while True:
          cpu_times1 = get_cpu_times()
          time.sleep(1)
          cpu_times2 = get_cpu_times()
          cpu_usage = round(calculate_cpu_usage(cpu_times1, cpu_times2),2)
          print(f"{current_time()}: CPU Usage: {cpu_usage}%")
          with open(csv_file, "a", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([current_time(), cpu_usage])
          
      except KeyboardInterrupt:
        print("数据采集停止")

    if __name__ == "__main__":
      main()
    ```

=== "Shell"

    ``` shell linenums="1"
    #!/bin/bash

    # 获取当前日期，生成 CSV 文件名
    csv_file="cpu_usage-$(date +%Y-%m-%d).csv"

    # 如果文件不存在，创建文件并写入标题行
    if [ ! -f "$csv_file" ]; then
      echo "Time,CPU Usage (%)" > "$csv_file"
    fi

    # 获取 CPU 时间信息的函数
    get_cpu_times() {
      awk '/^cpu /{print $2, $3, $4, $5, $6, $7, $8, $9, $10, $11}' /proc/stat
    }

    # 计算 CPU 使用率的函数
    calculate_cpu_usage() {
      local cpu_times1=($1)
      local cpu_times2=($2)
      
      local total_time1=0
      local total_time2=0
      local idle_time1=$((cpu_times1[3] + cpu_times1[4]))
      local idle_time2=$((cpu_times2[3] + cpu_times2[4]))

      for i in "${cpu_times1[@]}"; do
        total_time1=$((total_time1 + i))
      done
      for i in "${cpu_times2[@]}"; do
        total_time2=$((total_time2 + i))
      done

      local total_time_diff=$((total_time2 - total_time1))
      local idle_time_diff=$((idle_time2 - idle_time1))
      local usage=$((100 * (total_time_diff - idle_time_diff) / total_time_diff))

      echo "$usage"
    }

    echo "主函数启动，开始采集数据"

    # 循环采样
    while true; do
      cpu_times1=$(get_cpu_times)
      sleep 1
      cpu_times2=$(get_cpu_times)
      cpu_usage=$(calculate_cpu_usage "$cpu_times1" "$cpu_times2")
      current_time=$(date +%H:%M:%S)

      echo "$current_time: CPU Usage: $cpu_usage%"
      echo "$current_time,$cpu_usage" >> "$csv_file"
    done
    ```

## **获取内存占用情况**

通过访问文件`/proc/meminfo`来获取内存信息:

``` shell
$ cat /proc/meminfo
MemTotal:        3831956 kB
MemFree:          220500 kB
MemAvailable:     349392 kB
Buffers:           21808 kB
Cached:           131604 kB
SwapCached:         1768 kB
Active:          1873608 kB
Inactive:        1555248 kB
Active(anon):    1758632 kB
Inactive(anon):  1532236 kB
Active(file):     114976 kB
Inactive(file):    23012 kB
Unevictable:       10896 kB
Mlocked:              16 kB
SwapTotal:        204796 kB
SwapFree:          71164 kB
Zswap:                 0 kB
Zswapped:              0 kB
Dirty:                64 kB
Writeback:             0 kB
AnonPages:       3284792 kB
Mapped:            80264 kB
Shmem:             15456 kB
KReclaimable:      68388 kB
Slab:             100848 kB
SReclaimable:      68388 kB
SUnreclaim:        32460 kB
KernelStack:        7184 kB
PageTables:        17156 kB
SecPageTables:         0 kB
NFS_Unstable:          0 kB
Bounce:                0 kB
WritebackTmp:          0 kB
CommitLimit:     2120772 kB
Committed_AS:    5835936 kB
VmallocTotal:   257687552 kB
VmallocUsed:       15792 kB
VmallocChunk:          0 kB
Percpu:              720 kB
CmaTotal:         524288 kB
CmaFree:           17284 kB
```

这里我们需要中断了解以下5项:

1. `MemTotal`: 系统的总内存量, 为系统中总的无力内存量, 它显示了系统可用的 RAM (随机存取内存) 的总和, 如果运行的程序超出了可用的物理内存, 系统会开始使用交换空间(虚拟内存), 并会导致性能下降
2. `MemFree`: 系统剩余的空闲内存, 完全空闲并且未被任何进程或系统使用的内存量
3. `MemAvailable`: 更真实地反应了系统的可用内存，考虑了缓存和缓冲区的内存, 如果这个数值很低, 系统就会开始使用交换空间
4. `SwapTotal`和`SwapFree`: 交换空间的使用情况，当物理内存不足时系统会使用硬盘上的空间作为虚拟内存的位置, 当`SwapFree`接近0时, 系统可能会因为内存不足而变得不稳定
5. `Committed_AS`: 系统已经分配的内存，可能高于物理内存总量，如果这个值过大，可能会引发 OOM(内存不足) 的问题

根据上面的信息, 我们很容易可以写出获取内存信息的方法:

``` py linenums="1"
def get_memory_usage():
  with open("/proc/meminfo", "r") as f:
    meminfo = f.readlines()
  mem_total = int(meminfo[0].split()[1])
  mem_available = int(meminfo[2].split()[1])
  mem_used = mem_total - mem_available
  mem_usage = 100 * mem_used / mem_total
  return round(mem_usage, 2)
```

## **数据可视化**

将上面的代码整合到一起, 我们就能得到一个简单的 Python 脚本, 它能每1秒读取一次并计算CPU和内存的使用率, 然后输出到一个csv文件中:

``` py linenums="1"
import time
from datetime import datetime
import csv
import os

def get_cpu_times():
  with open("/proc/stat", "r") as f:
    line = f.readline().strip()
  cpu_times = list(map(int, line.split()[1:]))
  return cpu_times

def calculate_cpu_usage(cpu_times1, cpu_times2):
  total_time_diff = sum(cpu_times2) - sum(cpu_times1)
  idle_time_diff = (cpu_times2[3] + cpu_times2[4]) - (cpu_times1[3] + cpu_times1[4])
  usage = 100 * (total_time_diff - idle_time_diff) / total_time_diff
  return usage

def get_memory_usage():
  with open("/proc/meminfo", "r") as f:
    meminfo = f.readlines()
  mem_total = int(meminfo[0].split()[1])
  mem_available = int(meminfo[2].split()[1])
  mem_used = mem_total - mem_available
  mem_usage = 100 * mem_used / mem_total
  return round(mem_usage, 2)

def todayis():
  today = datetime.now().strftime("%Y-%m-%d")
  return today
def current_time():
  current_time = datetime.now().strftime("%H:%M:%S")
  return current_time
  
def main():
  csv_file = f"system_usage-{todayis()}.csv"
  if not os.path.exists(csv_file):
    with open(csv_file, "w", newline="") as f:
      writer = csv.writer(f)
      writer.writerow(["Time", "CPU Usage (%)"])

  try:
    print("主函数启动，开始采集数据")
    # 循环采样
    while True:
      cpu_times1 = get_cpu_times()
      time.sleep(1)
      cpu_times2 = get_cpu_times()
      cpu_usage = round(calculate_cpu_usage(cpu_times1, cpu_times2),2)
      mem_usage = get_memory_usage()
      print(f"{current_time()}, CPU Usage: {cpu_usage}%, Memory Usage: {mem_usage}%")
      # 将数据写入csv
      with open(csv_file, "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([current_time(), cpu_usage, mem_usage])
      
  except KeyboardInterrupt:
    print("数据采集停止")

if __name__ == "__main__":
  main()
```

然后我们读取文件数据, 就可以用`matplotlib`画出图像, 当然输出的png格式图片只能在有图形界面的机器上查看, 对于没有图形界面的情况, `gnuplot`提供了在终端中使用字符串绘制粗略图像的功能

=== "Python"

    ``` py linenums="1"
    import matplotlib.pyplot as plt
    import csv
    from datetime import datetime

    # 数据文件路径
    csv_file = "system_usage-2024-08-24.csv"

    # 初始化数据列表
    times = []
    cpu_usages = []
    mem_usages = []

    # 读取CSV文件中的数据
    with open(csv_file, "r") as f:
        reader = csv.reader(f)
        next(reader)  # 跳过标题行
        for row in reader:
            times.append(datetime.strptime(row[0], "%H:%M:%S"))
            cpu_usages.append(float(row[1]))
            mem_usages.append(float(row[2]))

    # 创建图表
    plt.figure(figsize=(10, 5))

    plt.plot(times, cpu_usages, label='CPU Usage (%)', color='blue', marker='o')
    plt.plot(times, mem_usages, label='Memory Usage (%)', color='green', marker='o')

    plt.title("CPU and Memory Usage Over Time")
    plt.xlabel("Time")
    plt.ylabel("Usage (%)")
    plt.legend()

    # 保存图表为 PNG 文件
    plt.savefig("cpu_mem_usage.png")
    ```

=== "Shell"

    ``` shell
    gnuplot -p -e "
    set datafile separator ',';
    set xdata time;
    set timefmt '%H:%M:%S';
    set format x '%H:%M:%S';
    set term dumb;
    plot 'cpu_usage-YYYY-MM-DD.csv' using 1:2 title 'CPU Usage (%)' with linespoints, \
         'cpu_usage-YYYY-MM-DD.csv' using 1:3 title 'Memory Usage (%)' with linespoints;"
    ```

## **进一步地查看信息**

上面的操作仅仅让我们能够看到CPU和内存的使用率, 把握整体的大致情况, 但是没办法让我们知道具体一些进程的占用情况, 第三方的命令`top`和`htop`将监视界面已经做得较为完美了,但是有时查看起来过于繁杂, 我们可以使用 shell 命令来进行简单的查看

使用`ps`命令查看当前系统中运行的进程, 并按照CPU和内存使用率进行排序: 

``` shell
ps -eo pid,comm,%cpu,%mem --sort=-%cpu | head -n 10
```

- `-eo pid,comm,%cpu,%mem`: 列出进程的ID, 命令名, CPU使用率和内存使用率
- `--sort=-%cpu`: 按照CPU使用率排序, 并且使用降序
- `head -n 10`: 显示前10个进程

同理, 将`-%cpu`改成`-%mem`就可以按照内存使用率降序排序

现在我想通过访问内核工具来获取CPU和内存的使用情况, 并找到占用最多资源的进程, 而不依靠第三方工具, 可以通过读取`/proc/[pid]/stat`文件, 


## **监测特定进程的流量**

