---
title: Jellyfin rename 脚本
date: 2024-07-23
tags:
  - Python
  - Regex
categories:
  - Log
---

# Jellyfin rename 脚本

最近在 Jellyfin 上看番，发现一个问题：对于日常的追番，我们可以借助 AutoBangumi 等工具托管RSS订阅并由它自动生成格式，但是如果要下载一些老番，已完成的合集，我们直接通过qbittorrent下载的话，得到的文件，字幕组打包好的文件的确有规整的格式，但是这些冗长的文件格式对于 Jellyfin 这些媒体挂削器来说就成为了负担，经常会导致程序无法正常识别番剧，甚至有些视频文件重名，直接打不开。因此，我们需要将这些文件名称规范一下

<!-- more -->

## 命名规则

对于这些影视程序，一般都有相同的命名标准，我们需要遵循这样的命名结构：

``` plaintext title="命名结构"
/shows/大明王朝1566/S01E01-大明王朝1566.mp4
```

我们需要注意电影哪怕只有一个文件，也不能直接放在`shows`目录下，这样会识别不出，必须创建一个文件夹，程序是以文件夹来划分不同影视的

这里`S01`代表的是`Season 1`，`E01`代表的是`Episode 1`

在一些有多季度的番剧和电视剧中我们也可以单独创建`Season 1`、`Season 2`文件夹来划分不同季

## 正则表达式结构

现在进入问题：

有两部这样结构的番剧：

``` bash title="番剧名称"
# 家有女友
'[VCB-Studio] Domestic na Kanojo [01][Ma10p_1080p][x265_flac].mkv'

# 攻壳机动队
'[VCB-S&philosophy-raws][Ghost in the Shell：STAND ALONE COMPLEX][01][BDRIP][HEVC Main10P FLAC][1920X1040].mkv'
'[VCB-S&philosophy-raws][Ghost in the Shell：S.A.C. 2nd GIG][01][BDRIP][HEVC Main10P FLAC][1920X1040].mkv'
```

我们可以发现字幕组的命名策略大致不离开这个思路：由多个`[ ]`组成的部分用来描述番剧信息，其中我们需要关注的是前三项：
1. `[字幕组名称]`，有的字幕组会用`【 】`来代替
2. `[番剧名称]`，通常使用英文命名，当然我们例子中的第一部并没有使用`[ ]`进行包裹，不过我们仍有办法处理
3. `[集数]`，不排除有的字幕组有例外，但是绝大部分的字幕组都是如此命名，使用两位数字命名

对于上面的条件，我们使用下面的正则表达式来匹配:

```py title="正则表达式匹配"
regrex = re.compile(r"(?P<Fansub>\[[^\]]+\])(?P<Name>.*)\[(?P<Episode>[0-2]\d)\]")
```

我们匹配第一个`[ ]`中的所有信息作为字幕组信息`Fansub`，并且由第一个`]`作为闭合，然后选取仅含有两位数字的信息作为`Episode`的特征，且对于十位上的数字，仅匹配`0,1,2`，因为一般番剧集数不会超过30集，最后，`Fansub`和`Episode`中间的所有部分为番剧名称`Name`，然后将它们放到字典中。至此，我们就完成了匹配的基本任务了

但是正则表达式的容错率很低，如果我们要匹配更多变的内容，就需要编写更复杂的正则表达式，我们已经看到了上面这个正则表达式并不好阅读，但好在，Python提供了更方便阅读的写法，下面这个脚本就是使用这种方法写的

## 一个较为完善的版本

```py
#!/usr/bin/python3

import re
import os
#define colors
RED = "\033[91m"
RESET = "\033[0m"

# 在这里修改目标视频文件所在目录
dir = '/mnt/my_hdd/bangumi/Steins Gate 全集（第一季、第二季、剧场版 中日双语内封字幕）/Season 1'
regex = re.compile(r"""
    (?P<Fansub>\[[^\]]+\])           # 匹配 Fansub 部分，如 [KissSub]
    (?P<Name>.*)                     # 匹配名称部分
    (?P<Episode>                     # 匹配 Episode 部分
        (?:\[[0-2]\d\])|             # 匹配 [01] 到 [29]
        (?:[第]\d{1,2}[话])|          # 或者匹配 第x话
        (?:\[[A-Z]{1,2}\])           # 匹配特殊集
    )
    .*?
    (?:\s(?P<EName>.*))?             # 可选的 EName 部分
    \.                               # 匹配句点
""", re.VERBOSE)

# 寻找目录下的视频文件并返回路径
def find_videos(dir):
  videos = []
  for root, dirs, files in os.walk(dir):
    for file in files:
      if file.endswith('.mkv')|file.endswith('.mp4'):
        videos.append(os.path.join(root, file))
  return videos

def main():
  videos = find_videos(dir)
  Season = dir.split(" ")[-1] # 番剧季数
  for video in videos:
    video_name = video.split("/")[-1]
    type = video_name.split(".")[-1] # 视频文件扩展名
    match_impl = regex.match(video_name)
    if match_impl:
      # Fansub | Name | Episode | EName(optional)
      Name = match_impl.group("Name").strip().strip('[]') # 去除首尾可能存在的空格和[]
      Episode = match_impl.group("Episode").strip('[]')
      EName = match_impl.group("EName")
      # print(f"{match_impl.groupdict()}\n")
      # 重命名: S0{Season}E{Episode}-{video_name}.{type}
      if EName == None:
        os.rename(video, f"{dir}/S0{Season}E{Episode}-{Name}.{type}")
        print(f"{video_name}  ==>  \nS0{Season}E{Episode}-{Name}.{type}\n\n")
      else:
        os.rename(video, f"{dir}/S0{Season}E{Episode}-{Name}-{EName}.{type}")
        print(f"{video_name}  ==>  \nS0{Season}E{Episode}-{Name}-{EName}.{type}\n\n")
    else:
      print(f"{RED}重新检查文件{RESET}:", video_name)
  
  print("---------------------------------------")
  print("重命名完毕！")

if __name__ == "__main__":
  main()
```

当然上面的这个脚本还有很多未完善的地方，对于一些格式仍然没有办法成功匹配，要写好一个匹配度广的正则表达式真是太难了😩但是如果我们换换思路，这个字符串的匹配也许能做得更好

## References

1. [正则表达式指南](https://docs.python.org/zh-cn/3/howto/regex.html)
2. [电影电视剧动漫 标准命名规则，jellfin、emby、kodi都适用](https://www.shejibiji.com/archives/8295)