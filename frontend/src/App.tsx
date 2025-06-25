import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import NavBar from './components/NavBar';
import Home from './pages/Home';
import About from './pages/About';
import Skills from './pages/Skills';
import Blogs from './pages/Blogs';
import AIChat from './pages/AIChat';

function App() {
    // * 为什么需要指定路由？
    // 用户点击链接并不会触发浏览器重新加载页面
    // 只有一个入口 HTML 单页面应用
    // React Router 拦截了链接跳转行为，在前端决定“该显示哪个组件”，实现“看起来像是跳转页面”，实质上是“切换组件视图”

  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/aichat" element={<AIChat />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
