import { Link } from 'react-router-dom';
import  '../assets/styles/nav-bar.css';
import '../assets/styles/dropdown.css';
import { useEffect, useState } from 'react';
import { useTheme } from "@/context/ThemeContext";
import MusicIcon from '/icons/UI/music.svg';

const NavBar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
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
          <Link to="/" className="minecraft"><h2>Kihara</h2></Link>
        </div>
        <ul className="navbar-displays">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li className="dropdown">
            <Link to="/about">About</Link>
            <ul className="dropdown-menu">
              <li><Link to="/about/me/">关于我</Link></li>
              <li><Link to="/about/site/">关于网站</Link></li>
              <li><Link to="/about/musings/">一些想法</Link></li>
              <li><Link to="/about/books/">看书</Link></li>
            </ul>
          </li>
          <li>
            {/* 记录我正在做的事情 */}
            {/* 我已经学会的技术 */}
            {/* 完成的项目 */}
            {/* 放简历，并提供PDF下载 */}
            <Link to="/skills/">Skills</Link>
          </li>

          <Link to="/music/"><img src={MusicIcon} alt="logo" /></Link>

          <li>
            {/* <Link to="/blogs">Blogs</Link> */}
          </li>
          {/* 语言切换: 中|英 */}
          {/* <li className="icon-button" title="language" onClick={handleLangToggle}>
            <svg className="nav-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path d="M213.333333 640v85.333333a85.333333 85.333333 0 0 0 78.933334 85.12L298.666667 810.666667h128v85.333333H298.666667a170.666667 170.666667 0 0 1-170.666667-170.666667v-85.333333h85.333333z m554.666667-213.333333l187.733333 469.333333h-91.946666l-51.242667-128h-174.506667l-51.157333 128h-91.904L682.666667 426.666667h85.333333z m-42.666667 123.093333L672.128 682.666667h106.325333L725.333333 549.76zM341.333333 85.333333v85.333334h170.666667v298.666666H341.333333v128H256v-128H85.333333V170.666667h170.666667V85.333333h85.333333z m384 42.666667a170.666667 170.666667 0 0 1 170.666667 170.666667v85.333333h-85.333333V298.666667a85.333333 85.333333 0 0 0-85.333334-85.333334h-128V128h128zM256 256H170.666667v128h85.333333V256z m170.666667 0H341.333333v128h85.333334V256z"
                ></path>
            </svg>
          </li> */}
          {/* 模式切换: 浅色|深色 */}
          <li className="icon-button" title="mode-toggle" onClick={toggleTheme}>
            {theme === "dark"
            ? <svg className="nav-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M450.275556 14.563556a499.712 499.712 0 1 0 559.217777 559.217777 42.666667 42.666667 0 0 0-64.910222-41.585777 328.647111 328.647111 0 0 1-452.721778-452.721778 42.666667 42.666667 0 0 0-41.528889-64.910222z m-70.769778 103.537777l-3.982222 12.231111a413.980444 413.980444 0 0 0 395.377777 536.803556l18.033778-0.398222a413.240889 413.240889 0 0 0 104.846222-18.204445l12.117334-4.039111-3.697778 10.467556a414.72 414.72 0 0 1-388.323556 269.539555A414.321778 414.321778 0 0 1 99.555556 510.179556a414.72 414.72 0 0 1 269.539555-388.323556l10.410667-3.754667z"
                ></path>
              </svg>
            : <svg className="nav-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M512 829.346909c23.365818 0 42.309818 18.944 42.309818 42.333091v63.464727a42.309818 42.309818 0 1 1-84.619636 0v-63.464727c0-23.389091 18.944-42.333091 42.309818-42.333091z m284.253091-92.928l44.869818 44.846546a42.333091 42.333091 0 1 1-59.834182 59.880727l-44.869818-44.916364a42.309818 42.309818 0 1 1 59.810909-59.810909z m-508.672 0c16.523636 16.523636 16.523636 43.287273 0 59.810909l-44.846546 44.893091a42.333091 42.333091 0 0 1-59.880727-59.834182l44.916364-44.869818c16.523636-16.523636 43.287273-16.523636 59.810909 0zM512 232.727273c154.228364 0 279.272727 125.044364 279.272727 279.272727s-125.044364 279.272727-279.272727 279.272727-279.272727-125.044364-279.272727-279.272727 125.044364-279.272727 279.272727-279.272727z m0 69.818182a209.454545 209.454545 0 1 0 0 418.90909 209.454545 209.454545 0 0 0 0-418.90909z m423.144727 167.144727a42.309818 42.309818 0 1 1 0 84.619636h-63.464727a42.309818 42.309818 0 1 1 0-84.619636h63.464727z m-782.824727 0a42.309818 42.309818 0 1 1 0 84.619636H88.855273a42.309818 42.309818 0 1 1 0-84.619636h63.464727zM811.194182 170.472727c11.240727 0 22.016 4.468364 29.952 12.404364h-0.023273c16.523636 16.523636 16.523636 43.310545 0 59.834182l-44.869818 44.869818a42.309818 42.309818 0 1 1-59.834182-59.810909l44.846546-44.893091a42.309818 42.309818 0 0 1 29.928727-12.404364z m-568.482909 12.381091v0.023273l44.869818 44.869818a42.309818 42.309818 0 1 1-59.810909 59.834182L182.853818 242.734545a42.333091 42.333091 0 1 1 59.834182-59.880727zM512 46.545455c23.365818 0 42.309818 18.944 42.309818 42.309818v63.464727a42.309818 42.309818 0 1 1-84.619636 0V88.855273C469.690182 65.489455 488.634182 46.545455 512 46.545455z"
                ></path>
              </svg>
            }
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default NavBar;
