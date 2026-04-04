import React from "react";
import styles from '../SectionLayout.module.css';

const SkillsLearning: React.FC = () => {
  return (
    <div className={styles.prose}>
      <h2>Learning</h2>
      <p>这里保留正在持续补齐的能力，而不是散落在 About 里的个人兴趣描述。</p>

      <div className={styles.list}>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>工程化细节</h3>
          <p>继续补前端工程边界、包体控制、路由组织和更稳定的状态管理习惯。</p>
        </section>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>图形表现</h3>
          <p>更自然的 Three.js 场景过渡、材质氛围、性能控制，以及 UI 和 3D 的融合方式。</p>
        </section>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>基础能力</h3>
          <p>信息论、数字电路、数据结构与算法这些底层知识还在继续巩固，它们更像长期底座而不是短期任务。</p>
        </section>
      </div>
    </div>
  );
};

export default SkillsLearning;
