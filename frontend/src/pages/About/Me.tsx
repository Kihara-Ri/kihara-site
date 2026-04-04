import React from "react";
import styles from '../SectionLayout.module.css';

const AboutMe: React.FC = () => {
  return (
    <div className={styles.prose}>
      <h2>关于我</h2>
      <p>
        我主要把时间花在写代码、拆页面结构、做一点图形相关的尝试，以及长期的语言学习上。
        我偏好把事情做得干净、可控，而不是堆很多现成模块快速拼出来。
      </p>
      <div className={styles.split}>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>兴趣方向</h3>
          <p>前端界面、交互细节、Three.js 场景、写作表达，以及日语和其他外语。</p>
        </section>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>做事方式</h3>
          <p>慢热，但进入状态之后会反复打磨。相比铺很多计划，更习惯先把结构搭对，再持续修正。</p>
        </section>
      </div>
      <p className={styles.muted}>
        这个页面保留“我是谁”的信息；和能力相关的内容已经收到了 Skills 页面里。
      </p>
    </div>
  )
}

export default AboutMe;
