import React from "react";
import styles from '../SectionLayout.module.css';

const SkillsExperience: React.FC = () => {
  return (
    <div className={styles.prose}>
      <h2>Experience</h2>
      <p>这一页强调的是我更擅长处理哪类问题，而不是按时间线罗列项目。</p>

      <div className={styles.list}>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>信息架构与页面重组</h3>
          <p>能把内容混乱的页面重新梳理成更清楚的结构，明确“个人信息”“能力信息”“内容信息”的边界。</p>
        </section>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>个人站与博客系统整合</h3>
          <p>处理文章渲染、博客首页、文章页、导航、主题切换，以及前后端并入后的整体体验。</p>
        </section>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>视觉与交互细节</h3>
          <p>会关注滚动行为、悬浮反馈、阅读宽度、布局稳定性，以及不必要的视觉噪音。</p>
        </section>
      </div>
    </div>
  );
};

export default SkillsExperience;
