import { Link } from 'react-router-dom';
import  '../assets/styles/nav-bar.css';
import { useEffect, useState } from 'react';

const NavBar: React.FC = () => {
  const [scrolledDown, setScrolledDown] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY && currentY > 10) {
        setScrolledDown(true); // 向下滚动
      } else if (currentY < lastScrollY) {
        setScrolledDown(false); // 向上滚动
      }
      lastScrollY = currentY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    // 使用 <Link> 标签替代 <a> 实现无刷新跳转
    <nav className={`navbar ${scrolledDown ? 'with-shadow' : ''}`}>
      <div className="division">
        <div className="navbar-logo">
          <Link to="/" className="navbar-logo-link">logo</Link>
        </div>
        <ul className="navbar-displays">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/skills">Skills</Link>
          </li>
          <li>
            <Link to="/blogs">Blogs</Link>
          </li>
          <li>
            <Link to="/aichat">AIChat</Link>
          </li>
          <li><button>language</button></li>
          <li><button>mode</button></li>
        </ul>
      </div>
    </nav>
  )
}

export default NavBar;