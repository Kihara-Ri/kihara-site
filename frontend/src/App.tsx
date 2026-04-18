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
import SkillsStack from './pages/Skills/Stack';
import SkillsExperience from './pages/Skills/Experience';
import SkillsLearning from './pages/Skills/Learning';
import SecondPersonNovel from './pages/Projects/SecondPersonNovel';
import NotFound from './pages/NotFound';
import BlogHome from './pages/BlogPage/BlogHome';
import BlogPost from './pages/BlogPage/BlogPost';
import BlogArchive from './pages/BlogPage/BlogArchive';
import BlogByTag from './pages/BlogPage/BlogByTag';
import BlogPostLayout from './pages/layouts/BlogPostLayout';

// Context
import { ThemeProvider } from './context/ThemeContext';
import { MusicPlayerProvider } from './context/MusicPlayerContext';
import { ToastProvider } from './context/ToastContext';
import styles from './App.module.css';

function AppContent() {
  const location = useLocation();
  const isSecondPersonNovelPage =
    location.pathname === '/projects/second-person-novel' ||
    location.pathname === '/projects/second-person-novel/';
  const showFooter =
    location.pathname !== '/music' &&
    location.pathname !== '/music/' &&
    !isSecondPersonNovelPage;

  return (
    <div className={styles.appShell}>
      {isSecondPersonNovelPage ? null : <NavBar />}
      <main className={styles.routeShell}>
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
          <Route path="/projects/second-person-novel" element={<SecondPersonNovel />} />
          <Route path="/blogs" element={<BlogHome />} />
          <Route path="/blogs/tag/:tag" element={<BlogByTag />} />
          <Route path="/blogs/archive/:year" element={<BlogArchive />} />
          <Route path="/blogs/archive/:year/:month" element={<BlogArchive />} />
          <Route path="/blogs" element={<BlogPostLayout />}>
            <Route path=":slug" element={<BlogPost />} />
          </Route>
        
          {/* 404 处理 */}
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </main>
      {showFooter ? <Footer /> : null}
    </div>
  )
}

function App() {
    // * 为什么需要指定路由？
    // 用户点击链接并不会触发浏览器重新加载页面
    // 只有一个入口 HTML 单页面应用
    // React Router 拦截了链接跳转行为，在前端决定“该显示哪个组件”，实现“看起来像是跳转页面”，实质上是“切换组件视图”

  return (
    <ThemeProvider>
      <ToastProvider>
        <MusicPlayerProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </MusicPlayerProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App;
