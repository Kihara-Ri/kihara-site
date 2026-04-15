import { NavLink, Outlet } from "react-router-dom";
import layout from '../components/layout/PageLayout.module.css';
import styles from './SectionLayout.module.css';

const Skills: React.FC = () => {
  return (
    <div className={[layout.page, layout.main, layout.mainStretch].join(' ')}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <section className={styles.hero}>
            <p className={styles.eyebrow}>Skills</p>
            <h1 className={styles.title}>能力</h1>
            <p className={styles.description}>
              技术栈、经验以及正在学习、获取希望得到的能力
            </p>
          </section>

          <nav className={styles.tabs} aria-label="Skills sections">
            <NavLink to="/skills/stack/" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`.trim()}>Stack</NavLink>
            <NavLink to="/skills/experience/" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`.trim()}>Experience</NavLink>
            <NavLink to="/skills/learning/" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`.trim()}>Learning</NavLink>
          </nav>
        </aside>

        <section className={styles.panel}>
          <Outlet />
        </section>
      </div>
    </div>
  )
};
export default Skills;
