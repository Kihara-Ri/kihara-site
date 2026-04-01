import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import About from './pages/About';
import Skills from './pages/Skills';
import Music from './pages/Music';

// 导航栏 About 页面
import AboutMe from './pages/About/Me';
import AboutSite from './pages/About/Site.mdx';
import AboutMusings from './pages/About/Musings';
import AboutBooks from './pages/About/Books';

// blog 页面
import BlogPost from './pages/BlogPage/BlogPost';
import BlogByTag from './pages/BlogPage/BlogByTag';
import BlogArchive from './pages/BlogPage/BlogArchive';
import BlogsMainLayout from './pages/layouts/BlogsMainLayout';
import BlogsHomeLayout from './pages/layouts/BlogsHomeLayout';
import BlogHome from './pages/BlogPage/BlogHome';
import BlogPostLayout from './pages/layouts/BlogPostLayout';
import TagOnlyLayout from './pages/layouts/TagOnlyLayout';

// Context
import { ThemeProvider } from './context/ThemeContext';

function App() {
    // * 为什么需要指定路由？
    // 用户点击链接并不会触发浏览器重新加载页面
    // 只有一个入口 HTML 单页面应用
    // React Router 拦截了链接跳转行为，在前端决定“该显示哪个组件”，实现“看起来像是跳转页面”，实质上是“切换组件视图”

  return (
    <ThemeProvider>
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />}>
          {/* 嵌套路由只是逻辑结构，还需要显式告诉组件“子路由渲染在哪 */}
          <Route path="me" element={<AboutMe />} />
          <Route path="site" element={<AboutSite />} />
          <Route path="musings" element={<AboutMusings />} />
          <Route path="books" element={<AboutBooks />} />
        </Route>

        <Route path="/skills" element={<Skills />} />
        <Route path="/music" element={<Music />} />
        
        {/* -------------------------- Blog 页面------------------------------------------------------------ */}
        <Route path="/blogs" element={<BlogsMainLayout />}>

          {/* ── ① 首页（左+中+右） */}
          <Route element={<BlogsHomeLayout />}>
            <Route index element={<BlogHome />} />
          </Route>

          {/* ── ② 单篇文章（左+中+右，但右侧大纲不同） */}
          <Route element={<BlogPostLayout />}>
            {/* /blogs/:slug -> 单篇文章 */}
            <Route path=":slug" element={<BlogPost />}></Route>
          </Route>

          {/* ── ③ 标签页（仅中栏，左右隐藏） */}
          <Route element={<TagOnlyLayout />}>
            {/* /blogs/tag/:tag -> 标签页 */}
            <Route path="tag/:tag" element={<BlogByTag />}></Route>
          </Route>
          {/* /blogs/archive/2025(/06) -> 归档 */}
          <Route path="archive/:year/:month?" element={<BlogArchive />}></Route>

          {/* 404 */}
          <Route path="*" element={<h1>😰 404 Not Found 不存在你要找的文章</h1>}></Route>
        </Route>
        
        {/* 404 处理 */}
        <Route path="*" element={<h1>😳 404 Not Found</h1>}></Route>
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  )
}

export default App;
