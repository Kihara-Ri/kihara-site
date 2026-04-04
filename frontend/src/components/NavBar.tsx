import { Link } from 'react-router-dom';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from "@/context/ThemeContext";
import styles from './NavBar.module.css';

const isCurrentPath = (pathname: string, target: string) => {
  if (target === '/') {
    return pathname === '/';
  }
  return pathname === target || pathname.startsWith(target);
};

const NavBar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [scrolledDown, setScrolledDown] = useState(false);
  const [inHero, setInHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const themeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY && currentY > 10) {
        setScrolledDown(true); // 向下滚动
      } else if (currentY < lastScrollY) {
        setScrolledDown(false); // 向上滚动
      }

      const heroThreshold = window.innerHeight * 0.72;
      setInHero(location.pathname === '/' && currentY < heroThreshold);

      lastScrollY = currentY;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const navClassName = [
    styles.navbar,
    inHero ? styles.navbarHero : '',
    scrolledDown ? styles.navbarScrolled : '',
  ].join(' ').trim();

  const homeActive = isCurrentPath(location.pathname, '/');
  const aboutActive = isCurrentPath(location.pathname, '/about/');
  const skillsActive = isCurrentPath(location.pathname, '/skills/');
  const musicActive = isCurrentPath(location.pathname, '/music/');
  const blogsActive = isCurrentPath(location.pathname, '/blogs/');

  const handleThemeToggle = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = themeButtonRef.current?.getBoundingClientRect();

    toggleTheme(
      rect
        ? {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          }
        : {
            x: event.clientX,
            y: event.clientY,
          },
    );
  };

  return (
    <nav className={navClassName}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link to="/" className={styles.brandLink}><h2 className={styles.brandTitle}>Kihara</h2></Link>
        </div>
        <button
          type="button"
          className={styles.menuButton}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={styles.menuBar} />
          <span className={styles.menuBar} />
          <span className={styles.menuBar} />
        </button>
        <div
          className={[styles.mobileBackdrop, menuOpen ? styles.mobileBackdropOpen : ''].join(' ').trim()}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
        <ul className={[styles.navList, menuOpen ? styles.navListOpen : ''].join(' ').trim()}>
          <li className={styles.mobileHeader}>
            <span className={styles.mobileTitle}>Navigation</span>
            <button type="button" className={styles.mobileClose} onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button>
          </li>
          <li className={styles.navItem}>
            <Link className={homeActive ? styles.navLinkActive : undefined} to="/">Home</Link>
          </li>
          <li className={[styles.navItem, styles.dropdown].join(' ')}>
            <Link className={aboutActive ? styles.navLinkActive : undefined} to="/about">About</Link>
            <ul className={styles.dropdownMenu}>
              <li><Link className={[styles.menuLink, isCurrentPath(location.pathname, '/about/me/') ? styles.menuLinkActive : ''].join(' ').trim()} to="/about/me/">关于我</Link></li>
              <li><Link className={[styles.menuLink, isCurrentPath(location.pathname, '/about/site/') ? styles.menuLinkActive : ''].join(' ').trim()} to="/about/site/">关于网站</Link></li>
              <li><Link className={[styles.menuLink, isCurrentPath(location.pathname, '/about/now/') ? styles.menuLinkActive : ''].join(' ').trim()} to="/about/now/">最近</Link></li>
              <li><Link className={[styles.menuLink, isCurrentPath(location.pathname, '/about/books/') ? styles.menuLinkActive : ''].join(' ').trim()} to="/about/books/">看书</Link></li>
            </ul>
          </li>
          <li className={[styles.navItem, styles.dropdown].join(' ')}>
            <Link className={skillsActive ? styles.navLinkActive : undefined} to="/skills/">Skills</Link>
            <ul className={styles.dropdownMenu}>
              <li><Link className={[styles.menuLink, isCurrentPath(location.pathname, '/skills/stack/') ? styles.menuLinkActive : ''].join(' ').trim()} to="/skills/stack/">技术栈</Link></li>
              <li><Link className={[styles.menuLink, isCurrentPath(location.pathname, '/skills/experience/') ? styles.menuLinkActive : ''].join(' ').trim()} to="/skills/experience/">经验</Link></li>
              <li><Link className={[styles.menuLink, isCurrentPath(location.pathname, '/skills/learning/') ? styles.menuLinkActive : ''].join(' ').trim()} to="/skills/learning/">学习中</Link></li>
            </ul>
          </li>
          <li className={styles.navItem}>
            <Link className={musicActive ? styles.navLinkActive : undefined} to="/music/">Music</Link>
          </li>

          <li className={styles.navItem}>
            <Link className={blogsActive ? styles.navLinkActive : undefined} to="/blogs/">Blogs</Link>
          </li>

          <li className={styles.navItem}>
            <button
              ref={themeButtonRef}
              className={styles.iconButton}
              type="button"
              title="mode-toggle"
              onClick={handleThemeToggle}
            >
            {theme === "dark"
            ? <svg className={styles.navIcon} viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M450.275556 14.563556a499.712 499.712 0 1 0 559.217777 559.217777 42.666667 42.666667 0 0 0-64.910222-41.585777 328.647111 328.647111 0 0 1-452.721778-452.721778 42.666667 42.666667 0 0 0-41.528889-64.910222z m-70.769778 103.537777l-3.982222 12.231111a413.980444 413.980444 0 0 0 395.377777 536.803556l18.033778-0.398222a413.240889 413.240889 0 0 0 104.846222-18.204445l12.117334-4.039111-3.697778 10.467556a414.72 414.72 0 0 1-388.323556 269.539555A414.321778 414.321778 0 0 1 99.555556 510.179556a414.72 414.72 0 0 1 269.539555-388.323556l10.410667-3.754667z"
                ></path>
              </svg>
            : <svg className={styles.navIcon} viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M512 829.346909c23.365818 0 42.309818 18.944 42.309818 42.333091v63.464727a42.309818 42.309818 0 1 1-84.619636 0v-63.464727c0-23.389091 18.944-42.333091 42.309818-42.333091z m284.253091-92.928l44.869818 44.846546a42.333091 42.333091 0 1 1-59.834182 59.880727l-44.869818-44.916364a42.309818 42.309818 0 1 1 59.810909-59.810909z m-508.672 0c16.523636 16.523636 16.523636 43.287273 0 59.810909l-44.846546 44.893091a42.333091 42.333091 0 0 1-59.880727-59.834182l44.916364-44.869818c16.523636-16.523636 43.287273-16.523636 59.810909 0zM512 232.727273c154.228364 0 279.272727 125.044364 279.272727 279.272727s-125.044364 279.272727-279.272727 279.272727-279.272727-125.044364-279.272727-279.272727 125.044364-279.272727 279.272727-279.272727z m0 69.818182a209.454545 209.454545 0 1 0 0 418.90909 209.454545 209.454545 0 0 0 0-418.90909z m423.144727 167.144727a42.309818 42.309818 0 1 1 0 84.619636h-63.464727a42.309818 42.309818 0 1 1 0-84.619636h63.464727z m-782.824727 0a42.309818 42.309818 0 1 1 0 84.619636H88.855273a42.309818 42.309818 0 1 1 0-84.619636h63.464727zM811.194182 170.472727c11.240727 0 22.016 4.468364 29.952 12.404364h-0.023273c16.523636 16.523636 16.523636 43.310545 0 59.834182l-44.869818 44.869818a42.309818 42.309818 0 1 1-59.834182-59.810909l44.846546-44.893091a42.309818 42.309818 0 0 1 29.928727-12.404364z m-568.482909 12.381091v0.023273l44.869818 44.869818a42.309818 42.309818 0 1 1-59.810909 59.834182L182.853818 242.734545a42.333091 42.333091 0 1 1 59.834182-59.880727zM512 46.545455c23.365818 0 42.309818 18.944 42.309818 42.309818v63.464727a42.309818 42.309818 0 1 1-84.619636 0V88.855273C469.690182 65.489455 488.634182 46.545455 512 46.545455z"
                ></path>
              </svg>
            }
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default NavBar;
