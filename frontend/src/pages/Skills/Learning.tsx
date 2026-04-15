import React from "react";
import styles from '../SectionLayout.module.css';

const SkillsLearning: React.FC = () => {
  return (
    <div className={styles.prose}>
      <h2>Learning</h2>
      <p>当前页面正在维护。</p>

      <div className={styles.list}>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>维护中</h3>
          <p>这一页的内容正在重组，暂时关闭展示。维护完成后会恢复。</p>
        </section>
      </div>
    </div>
  );
};

export default SkillsLearning;
