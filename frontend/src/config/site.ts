export const siteConfig = {
  homeHero: {
    title: 'Kihara',
    subtitleTag: 'Personal Atlas',
    descriptionZh:
      '我在这里写博客，记录语言、光照、音乐和一些缓慢展开的想法。 这一次访问会被定位到地球表面，并从我的位置向你拉出一条航线。',
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
      eyebrow: 'Index',
      title: '从开屏进入正文之后',
      text:
        '这一页适合承担个人网站首页的分发功能：用少量但有方向的内容，把写作、项目、阅读与最近状态组织起来。这里先放一版结构化样本，后面再逐步替换成真实内容。',
    },
    featuredWriting: [
      {
        category: 'Essay',
        title: '地图与光照之间的个人网站',
        summary: '一篇关于首页开屏、空间感与访客叙事如何结合的笔记，适合作为置顶文章位。',
      },
      {
        category: 'Notebook',
        title: '语言学习中的缓慢方法',
        summary: '记录一套偏长期主义的语言学习方式，不追求速成，而强调积累与复现。',
      },
      {
        category: 'Code',
        title: '把地球做成首页入口',
        summary: '从 Three.js 到时间模型，整理首页地球组件的设计取舍与实现细节。',
      },
    ],
    currentSignals: [
      '正在重构首页，使其同时承担入口叙事与博客分发功能。',
      '最近在看地图、光照和语言之间如何互相借喻。',
      '打算把书评、技术笔记和随想拆成更清晰的三条内容线。',
    ],
    shelves: [
      { label: 'Writing', value: '技术笔记 / 语言 / 随想' },
      { label: 'Making', value: '地图 / 前端 / 小工具' },
      { label: 'Reading', value: '历史 / 方法 / 文字感' },
      { label: 'Now', value: '重做首页与博客入口结构' },
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
