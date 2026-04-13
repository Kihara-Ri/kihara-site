import React from "react";
import styles from './Now.module.css';

const nowLanes = [
  {
    index: '01',
    tag: 'Ship',
    title: '网站重构',
    status: '主线程',
    summary: '重构博客、整理页面层级、收紧视觉细节，长期维护',
    focus: ['整理旧页面入口', '统一视觉层次', '重构网站架构'],
  },
  {
    index: '02',
    tag: 'Learn',
    title: '技术块补完',
    status: '并发中',
    summary: '巩固计算机网络、操作系统、工程架构、图形学的底层知识，为工具的理解和开发提供基础',
    focus: ['工程边界更清楚', '图形表现继续试错', '组件结构更抗改动'],
  },
  {
    index: '03',
    tag: 'Life',
    title: '非技术投入',
    status: '后台常驻',
    summary: '语言和表达方式本身一直会反过来影响我理解世界和组织内容',
    focus: ['每天坚持微信读书', '保持外语的输入', '观察表达系统如何运作'],
  },
];

const AboutNow: React.FC = () => {
  return (
    <div className={styles.nowShell}>
      <section className={styles.overviewCard}>
        <div className={styles.overviewLead}>
          <p className={styles.eyebrow}>Now</p>
          <h2 className={styles.title}>多线程</h2>
          <p className={styles.summary}>
            表面的多线程，其实也只是和人一样不断地在几个上下文之间切换注意力. Attention is all you need.
          </p>
        </div>
      </section>

      <section className={styles.parallelBoard} aria-label="Parallel tracks">
        {nowLanes.map((lane) => (
          <article key={lane.index} className={styles.lane}>
            <div className={styles.laneHead}>
              <span className={styles.laneIndex}>Track {lane.index}</span>
              <div className={styles.laneIntro}>
                <p className={styles.laneTag}>{lane.tag}</p>
                <h3 className={styles.laneTitle}>{lane.title}</h3>
              </div>
              <span className={styles.statusBadge}>{lane.status}</span>
            </div>

            <div className={styles.laneBody}>
              <p className={styles.laneSummary}>{lane.summary}</p>
              <ul className={styles.focusList}>
                {lane.focus.map((item) => (
                  <li key={item} className={styles.focusItem}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.syncCard}>
        <p className={styles.syncLabel}>Parallel Logic</p>
        <p className={styles.syncText}>
          定时器中断触发短则几分钟，长则几周，具体做什么，全看热情
        </p>
      </section>
    </div>
  );
};

export default AboutNow;
