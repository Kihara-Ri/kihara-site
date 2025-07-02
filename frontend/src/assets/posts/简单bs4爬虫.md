---
title: 简单bs4爬虫
date: 2024-03-31
tags: 
  - python
  - spider
categories: 
  - Log
---

# 简单bs4爬虫

使用bs4写一个脚本爬歌词，顺便聊一下感想

<!-- more -->

## 代码

怎么都感觉这篇post有点水💦

```python
import requests
from bs4 import BeautifulSoup

url = 'https://www.uta-net.com/song/348205/'

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
}

response = requests.get(url, headers=headers)

soup = BeautifulSoup(response.text, 'html.parser')
kashi_area_div = soup.find('div', id='kashi_area')

if kashi_area_div:
    for br in kashi_area_div.find_all('br'):
        br.replace_with('\n')
    print(kashi_area_div.text)
else:
    print("找不到相应的内容")

with open ('haru.md', 'w', encoding='utf-8') as file:
    file.write(kashi_area_div.text)
print("---------------------------------\n\n写入完成")
```

## 简单分析

上面的这个<svg class="icon" ><use xlink:href="#icon-Python"></use></svg>爬虫代码虽然看起来好像挺简单的，但是实际做起来也不是那么顺利，比较考验基本功吧

一开始直接用`requests.get(url)`来获取网页内容，没有加`headers`果然立马出问题，加上以后就能爬到内容了

需要注意的一点是歌词是全嵌在这个标签里的

![div](https://mdstore.oss-cn-beijing.aliyuncs.com/markdown/202403311616898.png)

也不是一句一句的，每句之间就用`<br>`标签来做换行，这里如果全部取出来的话根据bs4的特性，换行标签直接就没了，因此如果你不进行进一步处理的话，得到的歌词就是一整行，一点断句都没有，这肯定不是我们想要的东西

因此我们再用一次`find_all()`函数，选择所有的`<br>`标签，都转换成换行符就OK了

## 一点题外话

为什么要爬这个歌词，是因为我发现这些歌词网站给出的歌词竟然都不支持复制！不像国内的网站会弹出弹窗限制什么的，小日子的网站竟然直接就禁用你鼠标右键🤣

不过好在这个网站的结构非常简单，也基本没有反爬措施，小日子网站大多看着都挺旧的，属于是旧时代的残党了，不过这些网站竟然还一直保持最新的更新这是我没想到的，有些网站竟然也没有直接把歌词数据加载到前端让人轻易爬取

最近看到很多人在玩<svg class="icon" ><use xlink:href="#icon-wangluo"></use></svg>[Suno AI](https://app.suno.ai/)创作歌曲，然后看到他们也生成了挺不错的歌曲，我就试了一试

这首歌我挺喜欢的，想看看AI拿到这个歌词后会生成怎样的内容，结果我就把歌词粘贴到Suno AI上试了试，加上JPOP关键词，emmm...说实话不怎么样，但是JPOP味儿还是挺浓的，只不过跟真正的好歌比起来，变化和特色都差了很多

正如很多b站上的up主说的一样，工业化流水线的创作爆款歌的方式，现在看来更进一步了，我们在生活中可能听到这些流水线生产的歌的机会也许会更多了，大众的音乐审美也许会更加固化；但是，AI最擅长的事情就是平均，它学习了这么多的歌曲，保底有一个下限，这可比很多粗制滥造出来的歌曲强上了不少

所以说，这究竟是一件好事呢，还是坏事呢？谁知道呢

对了，现在的音乐人基本上不懂AI，正如前段时间的底层画师一样，他们对技术发展的恐惧的外在表现就是对新技术出现的傲慢，他们认为AI不可能理解绘画的，现在看来AI可能比他们更懂绘画；音乐人部分吸取了绘画的教训，在他们看来AI的各种能力还不足，这也不懂那也不懂，但是在我看来，AI背后的人是程序员，只要程序员懂，他们就有办法让AI懂，更何况未来的新一代的基于因果推断的AI也还在发展中，未来是什么样的，我们还真不知道