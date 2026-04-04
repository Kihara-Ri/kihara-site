import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Skills from './pages/Skills';
import Music from './pages/Music';

// 导航栏 About 页面
import AboutMe from './pages/About/Me';
import AboutSite from './pages/About/Site';
import AboutMusings from './pages/About/Musings';
import AboutBooks from './pages/About/Books';
import AboutNow from './pages/About/Now';

// blog 页面
import BlogPost from './pages/BlogPage/BlogPost';
import BlogByTag from './pages/BlogPage/BlogByTag';
import BlogArchive from './pages/BlogPage/BlogArchive';
import BlogsMainLayout from './pages/layouts/BlogsMainLayout';
import BlogsHomeLayout from './pages/layouts/BlogsHomeLayout';
import BlogHome from './pages/BlogPage/BlogHome';
import BlogPostLayout from './pages/layouts/BlogPostLayout';
import TagOnlyLayout from './pages/layouts/TagOnlyLayout';
import SkillsStack from './pages/Skills/Stack';
import SkillsExperience from './pages/Skills/Experience';
import SkillsLearning from './pages/Skills/Learning';
import NotFound from './pages/NotFound';

// Context
import { ThemeProvider } from './context/ThemeContext';
import { MusicPlayerProvider } from './context/MusicPlayerContext';

function AppContent() {
  const location = useLocation();
  const showFooter =
    location.pathname !== '/music' &&
    location.pathname !== '/music/';

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />}>
          <Route index element={<Navigate to="/about/me/" replace />} />
          {/* 嵌套路由只是逻辑结构，还需要显式告诉组件“子路由渲染在哪 */}
          <Route path="me" element={<AboutMe />} />
          <Route path="site" element={<AboutSite />} />
          <Route path="now" element={<AboutNow />} />
          <Route path="musings" element={<AboutMusings />} />
          <Route path="books" element={<AboutBooks />} />
        </Route>

        <Route path="/skills" element={<Skills />}>
          <Route index element={<Navigate to="/skills/stack/" replace />} />
          <Route path="stack" element={<SkillsStack />} />
          <Route path="experience" element={<SkillsExperience />} />
          <Route path="learning" element={<SkillsLearning />} />
        </Route>
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
          <Route
            path="*"
            element={<NotFound title="博客里没有这篇文章" description="你访问的博客链接不存在，或者文章还没有发布到当前站点。" />}
          ></Route>
        </Route>
        
        {/* 404 处理 */}
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
      {showFooter ? <Footer /> : null}
    </>
  )
}

function App() {
    // * 为什么需要指定路由？
    // 用户点击链接并不会触发浏览器重新加载页面
    // 只有一个入口 HTML 单页面应用
    // React Router 拦截了链接跳转行为，在前端决定“该显示哪个组件”，实现“看起来像是跳转页面”，实质上是“切换组件视图”

  return (
    <ThemeProvider>
      <MusicPlayerProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </MusicPlayerProvider>
    </ThemeProvider>
  )
}

export default App;
