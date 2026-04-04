import React from "react";
import styles from '../SectionLayout.module.css';

const AboutNow: React.FC = () => {
  return (
    <div className={styles.prose}>
      <h2>Now</h2>
      <p>
        这里放的是最近一段时间真正占据注意力的内容，不是长期简介，也不是技能清单。
      </p>
      <div className={styles.list}>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>正在打磨的网站</h3>
          <p>重构博客、整理页面层级、收紧视觉细节，让个人站点从“能用”变成“能长期维护”。</p>
        </section>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>正在补的技术块</h3>
          <p>前端工程细节、Three.js 场景表现、以及更稳定的组件组织方式。</p>
        </section>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>最近的非技术投入</h3>
          <p>继续学日语，也保持阅读。对表达方式和语言系统本身一直有兴趣。</p>
        </section>
      </div>
    </div>
  );
};

export default AboutNow;
