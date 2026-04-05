import React from "react";
import styles from '../SectionLayout.module.css';

const AboutMe: React.FC = () => {
  return (
    <div className={styles.prose}>
      <h2>关于我</h2>
      <p>
        我主要把时间花在交互、连接和做一点图形相关的尝试，以及长期的语言学习上。
        我偏好把事情做得干净、可控，而不是堆很多现成模块快速拼出来，当我投入到一个项目里时，往往会反复打磨细节，直到满意为止，因此有时候容易钻牛角尖。对我来说，最困难的不是怎么做一件不可能的事，而是如何开始一件事
      </p>
      <div className={styles.split}>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>兴趣方向</h3>
          <p>前端界面、交互细节、实在的工具构建、写作表达，以及日语和其他外语</p>
        </section>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>做事方式</h3>
          <p>永远没有计划，走一步看一步，坚信车到山前必有路，船到桥头自然直</p>
          <p>但由此也给我的生活带来很多意外之喜，因为明天尚且无法预测</p>
        </section>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>游戏</h3>
          <p>长期玩的游戏只有英雄联盟</p>
          <p>Switch 2 吃灰中</p>
        </section>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>标签</h3>
          <p>INFP-T</p>
          <p>我们都是一群赛博生物</p>
        </section>
      </div>
    </div>
  )
}

export default AboutMe;
