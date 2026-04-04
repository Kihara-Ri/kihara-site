import React from "react"
import { NavLink, Outlet } from "react-router-dom";
import layout from '../components/layout/PageLayout.module.css';
import styles from './SectionLayout.module.css';

const About: React.FC = () => {
  return (
    <div className={[layout.page, layout.main, layout.mainStretch].join(' ')}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>About</p>
          <h1 className={styles.title}>身份、站点与最近在意的事情</h1>
          <p className={styles.description}>
            这里专门回答“你是谁”“这个网站为什么这样做”以及“你最近在想什么”。
            把个人信息和能力展示拆开之后，阅读路径会更清楚。
          </p>
        </section>

        <nav className={styles.tabs} aria-label="About sections">
          <NavLink to="/about/me/" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`.trim()}>Me</NavLink>
          <NavLink to="/about/site/" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`.trim()}>Site</NavLink>
          <NavLink to="/about/now/" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`.trim()}>Now</NavLink>
          <NavLink to="/about/books/" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`.trim()}>Books</NavLink>
        </nav>

        <section className={styles.panel}>
          <Outlet />
        </section>
      </div>
    </div>
  );
};
export default About;
