import React, { useMemo } from "react";
import { MarkdownArticle } from "../../features/blog/components/MarkdownArticle";

const buildTime = new Date().toLocaleString();

const AboutSite: React.FC = () => {
  const markdown = useMemo(() => `
# 关于本站

这个网站不是静态页面拼装，而是一套把展示页、博客系统、访客记录和 3D 首页放进同一条工程链路里的个人站。它的重点不是“功能很多”，而是几层关系足够清楚：前端负责展示和交互，后端负责内容和数据接口，Markdown 负责内容表达，渲染管线负责把内容安全而稳定地送到页面。

最近更新时间: ${buildTime}

## 1. 总体架构

- **前端层**：React + TypeScript + Vite，负责路由、页面结构、主题、博客阅读体验和首页 Three.js 场景。
- **后端层**：Go + Chi，负责文章索引、文章详情查询、博客概览、标签接口、访客记录和 IP 相关接口。
- **内容层**：博客正文以 Markdown 文件存在后端目录，元信息写在文章头部，标签规则由配置文件控制。
- **样式层**：以 CSS Modules 为主，配合少量全局主题变量；正文样式单独收口，避免导航和普通页面样式污染文章排版。
- **运行层**：根目录一键启动脚本同时拉起 Vite 和 Go 服务，开发环境下前端通过 <code>/api</code> 与后端联调。

整站可以概括成一句话：**Markdown 文件是内容源，Go 服务把内容整理成 API，React 页面再把这些 API 组织成可读的博客和个人站界面。**

<figure>
  <img src="/diagrams/site-architecture.svg" alt="本站前后端、内容层和 markdown 渲染管线架构图" />
  <figcaption>这张图把内容源、Go 后端、API、前端数据层、Markdown 渲染管线和最终页面装配放到一条连续链路里。</figcaption>
</figure>

## 2. 前端技术路线

- **路由**：React Router 管理首页、About、Skills、Blogs 以及 404。About 和 Skills 已拆成多级内容页，博客则有列表页、标签筛选、归档和文章详情。
- **组件组织**：页面壳、导航栏、页尾、首页模块、博客模块彼此分开，博客相关逻辑集中在 <code>frontend/src/features/blog/</code>。
- **样式策略**：普通页面用 CSS Modules；正文排版和目录侧栏也放在博客 feature 内部，减少样式串扰。
- **主题系统**：<code>ThemeContext</code> 跟随系统深浅色，主题值落到 CSS 变量，博客正文、卡片、目录和全站组件共用同一套颜色语义。
- **图形层**：首页的地球场景由 Three.js 驱动，React 只负责组合和生命周期；滚动时的玻璃滤镜通过直接更新 CSS 变量避免频繁重渲染场景。
- **内容渲染**：Markdown 由 <code>markdown-it</code> 渲染，代码块走 <code>highlight.js</code>，公式走 <code>KaTeX</code> + <code>markdown-it-texmath</code>，再叠加自定义插件完成标题锚点、注释、引用和目录信息收集。

## 3. 后端技术路线

- **服务入口**：<code>backend/main.go</code> 启动标准 HTTP 服务，路由由 <code>backend/router/router.go</code> 注册。
- **路由分发**：当前主要 API 包括 <code>/api/ipinfo</code>、<code>/api/visit</code>、<code>/api/tags</code>、<code>/api/overview</code>、<code>/api/articles</code> 和 <code>/api/articles/:slug</code>。
- **博客处理层**：<code>backend/handler/blog.go</code> 负责接住请求、懒加载文章存储、处理错误并输出统一 JSON。
- **博客领域层**：<code>backend/internal/blog/</code> 负责真正的文章扫描、Frontmatter 解析、元信息校验、按日期排序、标签统计和概览生成。
- **数据策略**：博客内容不走数据库，而是直接读本地 Markdown 文件；访客记录写入本地 JSON，更适合个人站而非高并发服务。

## 4. 前后端是如何配合的

这套站点的前后端关系并不是“前端写死页面，后端只是补几个接口”，而是明确分工：

- **后端负责内容真实性**：哪篇文章存在、发布时间是什么、标签是否合法、正文内容是什么，这些都以后端读取到的 Markdown 文件为准。
- **前端负责展示结构**：卡片、目录、分页、标签按钮、返回总览、上下篇导航这些交互都在前端完成。
- **接口是中间层**：前端不直接碰文章文件，只请求后端 API；后端也不关心页面布局，只返回适合前端消费的 JSON。

具体协作方式如下：

1. **博客首页加载**
- 前端通过 <code>frontend/src/features/blog/api/blogApi.ts</code> 请求 <code>/api/overview</code> 和 <code>/api/articles</code>。
- 后端从文章存储中汇总统计、日历数据、标签计数和文章列表。
- 前端把这些数据拆成首页主卡片、列表区和右侧粘性侧栏。

2. **文章详情加载**
- 进入文章页时，前端同时请求当前文章 <code>/api/articles/:slug</code> 和文章列表 <code>/api/articles</code>。
- 当前文章接口返回标题、日期、标签、摘要、正文和字数等字段。
- 文章列表接口提供按日期倒序排列的文章元信息，前端据此计算上一篇和下一篇。

3. **标签和筛选**
- 用户点击标签时，前端只改变筛选状态并重新请求 <code>/api/articles?tag=...</code>。
- 后端在统一的文章存储上过滤，而不是前端拿到所有内容后自己硬筛。

这样做的好处是：**文章排序、标签合法性、内容存在性这些规则只维护一份，在后端；页面布局和阅读交互只维护一份，在前端。**

## 5. 博客内容管线

- 文章源文件保存在 <code>backend/articles/</code> 中，采用 Markdown。
- 标签规则由 <code>backend/tag_config.yaml</code> 控制，决定标签白名单和内容校验强度。
- 后端启动时会读取 <code>ARTICLE_DIR</code> 和 <code>TAG_CONFIG_PATH</code>。如果没有显式注入环境变量，就回退到默认目录。
- <code>backend/internal/blog/store.go</code> 会扫描文章目录下的 <code>.md</code> 文件，只接受 Markdown 作为博客源。
- 每篇文章会先经过 Frontmatter 解析，再做 slug、标题、日期、摘要、标签、系列信息等元字段校验。
- 如果启用严格校验，任何文章错误都可以阻止博客存储初始化；如果关闭严格模式，则跳过非法文章并继续提供可用内容。
- 所有通过校验的文章会按发布时间倒序排序，因此“最新文章”“上一篇/下一篇”和博客列表都能共享同一套排序依据。
- <code>GetOverview()</code> 会在同一份文章集合上计算总字数、总文章数、标签计数、系列计数以及日历分布，不额外维护第二份缓存数据结构。

## 6. Markdown 功能与渲染管线

这是本站最核心的内容链路，因为博客、技术文档乃至“关于本站”本身，都依赖这一套机制。

### 6.1 内容源阶段

- 原始内容是 Markdown 文本，主要来自 <code>backend/articles/*.md</code>。
- Markdown 文件里除了正文，还包含头部元信息，用来描述标题、日期、标签、摘要、系列等字段。
- 后端把这些字段解析后返回给前端，正文仍保留为 Markdown 字符串，不在后端预先转成 HTML。

### 6.2 传输阶段

- 当用户进入文章页，前端调用 <code>fetchArticle(slug)</code> 请求文章详情。
- 后端返回的 JSON 中，<code>content</code> 字段仍然是原始 Markdown。
- 这样做的原因是：渲染权保留在前端，便于目录提取、主题适配、交互注释和统一样式控制。

### 6.3 前端渲染阶段

- 前端入口在 <code>frontend/src/features/blog/markdown/renderer.ts</code>。
- <code>createMarkdownRenderer()</code> 初始化一个 <code>markdown-it</code> 实例。
- 如果代码高亮开启，就把 <code>highlight.js</code> 注入到 <code>markdown-it</code> 的 <code>highlight</code> 回调中。
- 如果公式功能开启，就把 <code>markdown-it-texmath</code> 和 <code>KaTeX</code> 挂进去。
- 然后再执行 <code>applyCustomPlugins()</code>，把本站需要的扩展语法和后处理插件统一注册进去。

### 6.4 自定义插件阶段

本站的 Markdown 不是“原生 markdown-it 即用”，而是做了一层自己的内容增强：

- **标题处理**：为标题生成稳定锚点，并把标题信息写入渲染环境，供目录组件使用。
- **目录生成**：文章页右侧目录不是手写数据，而是从 Markdown 渲染时收集到的 heading 列表生成。
- **注释/附注**：正文里的解释性信息通过自定义标记转换成可点击的注释气泡和 tooltip。
- **引用与链接增强**：链接会带站内一致的样式类名，引用信息也会被整理成统一结构。

换句话说，Markdown 在这里不仅生成 HTML，还顺便产出了一份“结构化副产物”，也就是文章目录和交互所需要的元信息。

### 6.5 页面装配阶段

- <code>ArticleContent.tsx</code> 负责把 Markdown 渲染结果塞进正文容器。
- <code>ArticleOutline</code> 会用同一份 Markdown 再渲染一次隐藏测量稿，只为了拿到每个标题在真实排版中的位置。
- 目录组件再根据这些标题位置和当前滚动位置，计算出当前高亮的章节。
- 这也是为什么渲染管线要放在前端：因为目录高亮依赖最终 DOM 布局，而不是只依赖原始 Markdown 文本。

### 6.6 样式阶段

- 正文样式由 <code>ArticleContent.module.css</code> 单独管理。
- 代码块、行内代码、表格、引用块、标题锚点、注释浮层和链接都在这一层统一处理。
- 这层样式专门覆盖了正文里的 <code>ul / ol / li</code> 默认表现，避免被全局导航样式污染。

最终整条管线可以概括为：

1. Markdown 文件存放在后端目录。
2. Go 后端解析元信息并通过 API 返回 Markdown 正文。
3. 前端获取正文后调用 <code>renderMarkdown()</code>。
4. <code>markdown-it</code> 联合高亮、公式和自定义插件生成 HTML + 目录元信息。
5. React 页面把 HTML、目录、注释、样式和滚动行为装配成最终阅读页。

## 7. 开发与运行管线

- 前端开发命令是 <code>frontend/package.json</code> 里的 <code>vite</code> 流程，构建前先做 TypeScript 类型检查。
- 根目录提供一键启动脚本：<code>npm run dev</code> 会通过 <code>scripts/dev.sh</code> 同时拉起前后端。
- 这个脚本会自动注入博客文章目录和标签配置路径，避免开发时分别手动配置。
- 前端开发服务器通过 <code>VITE_API_PROXY_TARGET</code> 把 <code>/api</code> 转发到 Go 后端。
- 生产构建时，前端先通过 <code>tsc --noEmit</code> 做静态类型检查，再交给 Vite 打包；后端则维持独立的 Go 构建和测试链路。

## 8. 当前已实现的功能

- 首页：3D 地球、访客信息、精选文章、最新文章、主题切换和开屏过渡。
- About / Skills：已按“个人信息”和“能力信息”重新拆分，避免内容混杂。
- 博客：首页、标签筛选、归档、文章页、目录定位、上下篇导航、深浅色适配。
- 全站：固定导航栏、页尾、404 页面、博客路由整合。

## 9. 一些实现细节

- 首页的毛玻璃效果现在通过滚动更新 CSS 变量，而不是用 React 状态驱动整页重渲染，目的是避免 Three.js 场景频繁刷新。
- 博客文章页的目录采用独立侧栏，并通过 sticky 定位避开固定导航栏。
- 博客首页侧栏和文章页目录都用统一的偏移策略，保证滚动时停留位置稳定。
- 导航栏下拉菜单做了 hover bridge 处理，修掉了鼠标移动到菜单时容易断开的交互问题。
- 404 页面使用正常页面布局渲染，避免被固定导航栏遮挡。

## 10. 现在不做的事情

- 本站已经移除了 MDX，内容页统一回到 TSX 和 Markdown，减少额外构建层和内容源分裂。
- 博客不再以独立子项目运行，而是直接并入主站前后端。

## 11. 目前的边界

- 访客记录仍是本地 JSON 存储，适合个人站，不适合高并发场景。
- 前端包体仍然偏大，主要来自博客渲染链路、KaTeX 和图形依赖，后续可以继续做按路由拆包。
- 这套系统的目标不是通用 CMS，而是一套为个人表达和持续迭代服务的站点骨架。
  `, []);

  return <MarkdownArticle markdown={markdown} />;
};

export default AboutSite;
