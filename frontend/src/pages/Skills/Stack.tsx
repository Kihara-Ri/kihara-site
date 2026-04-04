import React from "react";
import TechGrid from "../../components/TechGrid";
import styles from '../SectionLayout.module.css';

const SkillsStack: React.FC = () => {
  return (
    <div className={styles.stackGrid}>
      <div className={styles.prose}>
        <h2>Stack</h2>
        <p>
          这里集中放我实际会用、并愿意继续深挖的技术。重点不是“我接触过什么”，而是“我能稳定交付什么”。
        </p>
      </div>

      <div className={styles.skillGrid}>
        <section className={styles.skillGroup}>
          <h3>Frontend</h3>
          <p>React、TypeScript、Vite、CSS Modules，以及页面结构、路由、状态与组件拆分。</p>
        </section>
        <section className={styles.skillGroup}>
          <h3>Visual / 3D</h3>
          <p>Three.js、WebGL 场景整合、视觉层级、界面氛围和轻量动画。</p>
        </section>
        <section className={styles.skillGroup}>
          <h3>Content</h3>
          <p>Markdown / MDX、博客渲染、信息组织、阅读体验和内容型页面搭建。</p>
        </section>
        <section className={styles.skillGroup}>
          <h3>Backend / Tooling</h3>
          <p>Go 服务接入、前后端联调、接口整理，以及本地开发脚本和构建流程。</p>
        </section>
      </div>

      <TechGrid />
    </div>
  );
};

export default SkillsStack;
