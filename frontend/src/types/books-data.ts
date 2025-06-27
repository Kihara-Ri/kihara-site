// 用于短期使用
// 后续接入管理后台后改用 json 管理数据 或用 CMS 拉取再生成

// 是否可以不使用 id ?
import type { BookCardInfo } from "../components/BookCard";

const books: BookCardInfo[] = [
  {
    cover: "/books-img/日本语.jpg",
    title: "日本语",
    author: "[日] 今田一春彦",
    translator: "皮细庚",
    tags: ['语言','文化'],
    language: "中文",
    publisher: "华东理工大学出版社",
    intro: "本书以平实的语言，从语言、词汇、书写规则、语法、外来语等角度，全方位地阐述了日语的有趣及精彩之处，并将它生动地展露在读者面前，读者甚至从中窥见日本人的民族心理和思维习惯。作者以发生在日本人日常生活中的事例为依据，将日语和其他语言做对比，把隐藏其中的奥秘娓娓道来。",
    link: "https://book.douban.com/subject/27591836/",
    judgement: "还算有意思的一本书，作者",
    review: "暂无"
  },
  {
    cover: "/books-img/美国四百年.jpg",
    title: "美国四百年",
    author: "[美] 布·斯里尼瓦桑",
    tags: ['历史','微观历史'],
    language: "中文",
    publisher: "海南出版社",
    intro: "美国的历史不仅是政治性，也是经济性的。美国人以公民身份行使自己的政治权利，以消费者的身份行使经济权利。自由市场代表着美国精神中的冒险、创新、不择手段、机会主义，它影响了美国的政治法律建设，又逐渐在种种社会运动中被法律和政策规制，它们彼此互动形成美国式资本主义，并塑造着多种物质文明和城乡景观风貌。",
    link: "https://book.douban.com/subject/35721558/",
    judgement: "讲述35个推动美国历史进程的重大发明、技术和行业的故事。",
    review: "暂无"
  }
]

export default books;