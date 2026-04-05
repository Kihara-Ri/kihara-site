export const siteConfig = {
  homeHero: {
    title: 'Hello, World',
    subtitleTag: 'Another day on Earth',
    descriptionZh:
      '我在这里写博客，记录语言、光照、音乐和一些缓慢展开的想法。 这一次访问会被定位到地球表面你的位置，并建立我们之间的联系',
    descriptionEn:
      "I'm here writing about languages, light, music, and thoughts that unfold slowly. This visit is placed on the globe and traced from my side to yours.",
    timePrefix: 'Tokyo',
    timeZoneLabel: 'UTC+9',
    legendMe: 'Me',
    legendYou: 'You',
    visitorLabels: {
      currentVisitor: 'Current Visitor',
      detectedRegion: 'Detected Region',
      routeDistance: 'Route Distance',
      visitorCount: 'Visitor Count',
    },
  },
  homeContent: {
    introduction: {
      eyebrow: 'Prefix',
      title: 'Fragments of a wandering mind',
      text:
        '无论你是通过何种途径来到这里的，我都希望我的内容能让你觉得这次访问是值得的。不管你正在做什么，遇到了什么问题，在寻找什么，我都希望我的一些小巧思能给你一些启发',
    },
    featuredWriting: [
      {
        category: 'Project',
        title: '一个自我实现的个人网站',
        summary: '我不是一个很擅长想象的人，但我最擅长的是总结与联想，我希望把我所有学习过的东西通过小巧思连接起来，做成我自己的项目',
      },
      {
        category: 'Notebook',
        title: '杂七杂八，有的没的',
        summary: '什么内容都可能出现，技术是手段不是目的，表达是形式不是内容，我想把我在各个领域的零碎想法都放在这里，看看它们之间能不能碰撞出什么有趣的东西',
      },
      {
        category: 'Code',
        title: '不如说是产品经理',
        summary: '不是很擅长写代码，但很喜欢做产品，喜欢把想法变成实实在在看得见摸得着的东西，但我从不期待它们有用，最好的产品的诞生往往just for fun',
      },
      {
        category: 'Write',
        title: '写',
        summary: 'Even with the rest belated, everything is antiquated Are you writing from the heart? \nEven in his heart, the Devil has to know the water level\nAre you wrting from the heart?',
      }
    ],
    currentSignals: [
      '维护博客页面，迁移旧内容',
      '打造产品集的旅游路线规划与展示工具',
      '统一服务器日志接口，可视化数据',
    ],
    shelves: [
      { label: 'Writing', value: '技术笔记 / 语言 / 随想' },
      { label: 'Making', value: '地图 / 前端 / 小工具' },
      { label: 'Reading', value: '历史 / 方法 / 编程' },
      { label: 'Learning', value: '无线电 / 语言 / 操作系统'},
      { label: 'Now', value: '重构这个网站' },
    ],
    blogHighlights: {
      featuredWorks: [
        {
          slug: 'docker',
          label: 'Workflow',
          note: '整理容器化环境和日常开发流程，适合挂在首页作为长期入口。',
        },
        {
          slug: 'blog',
          label: 'Tooling',
          note: '偏个人工具链的文章，代表这类博客会如何从记录走向可复用。',
        },
        {
          slug: 'mermaid',
          label: 'Markdown',
          note: '一篇更偏表达方式的笔记，适合补足技术之外的展示面。',
        },
      ],
      latestLabel: 'Latest Post',
    },
  },
} as const;
