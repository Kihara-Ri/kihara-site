import { NavLink, Outlet } from "react-router-dom";
import layout from '../components/layout/PageLayout.module.css';
import styles from './SectionLayout.module.css';

const Skills: React.FC = () => {
  return (
    <div className={[layout.page, layout.main, layout.mainStretch].join(' ')}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Skills</p>
          <h1 className={styles.title}>技术栈、项目经验与正在补齐的能力</h1>
          <p className={styles.description}>
            这里专门回答“你会什么”“做过什么类型的工作”和“你正在补哪一块能力”。
            和 About 分开后，能力信息会更容易判断。
          </p>
        </section>

        <nav className={styles.tabs} aria-label="Skills sections">
          <NavLink to="/skills/stack/" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`.trim()}>Stack</NavLink>
          <NavLink to="/skills/experience/" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`.trim()}>Experience</NavLink>
          <NavLink to="/skills/learning/" className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`.trim()}>Learning</NavLink>
        </nav>

        <section className={styles.panel}>
          <Outlet />
        </section>
      </div>
    </div>
  )
};
export default Skills;
