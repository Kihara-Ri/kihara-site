import React from "react";
import styles from './Now.module.css';

const nowLanes = [
  {
    index: '01',
    tag: 'Ship',
    title: '网站重构',
    status: '主线程',
    summary: '重构博客、整理页面层级、收紧视觉细节，让站点从“能用”继续往“能长期维护”推进。',
    focus: ['整理旧页面入口', '统一视觉层次', '把零散交互收进同一套语言'],
  },
  {
    index: '02',
    tag: 'Learn',
    title: '技术块补完',
    status: '并发中',
    summary: '补前端工程细节、Three.js 场景表现，以及更稳定的组件组织方式，避免每做一页都像临时起意。',
    focus: ['工程边界更清楚', '图形表现继续试错', '组件结构更抗改动'],
  },
  {
    index: '03',
    tag: 'Life',
    title: '非技术投入',
    status: '后台常驻',
    summary: '继续学日语，也保持阅读。语言和表达方式本身一直会反过来影响我做页面、写东西和组织内容。',
    focus: ['日语持续输入', '阅读不断线', '观察表达系统怎么运作'],
  },
];

const AboutNow: React.FC = () => {
  return (
    <div className={styles.nowShell}>
      <section className={styles.overviewCard}>
        <div className={styles.overviewLead}>
          <p className={styles.eyebrow}>Now</p>
          <h2 className={styles.title}>并行推进中的几条线程</h2>
          <p className={styles.summary}>
            这里不是长期简介，更像当前真的在占用注意力的任务板。它们不会按顺序做完，而是交替推进、彼此牵扯。
          </p>
        </div>

        <div className={styles.metaStrip} aria-label="Current state">
          <span className={styles.metaChip}>3 条线程在线</span>
          <span className={styles.metaChip}>持续切换注意力</span>
          <span className={styles.metaChip}>慢速但不断线</span>
        </div>
      </section>

      <section className={styles.parallelBoard} aria-label="Parallel tracks">
        {nowLanes.map((lane) => (
          <article key={lane.index} className={styles.lane}>
            <div className={styles.laneHead}>
              <div className={styles.laneIntro}>
                <span className={styles.laneIndex}>Track {lane.index}</span>
                <p className={styles.laneTag}>{lane.tag}</p>
              </div>
              <span className={styles.statusBadge}>{lane.status}</span>
            </div>

            <div className={styles.laneTrack} aria-hidden="true">
              <span className={styles.trackLight} />
              <span className={styles.trackLine} />
              <span className={styles.trackPulse} />
            </div>

            <div className={styles.laneBody}>
              <h3 className={styles.laneTitle}>{lane.title}</h3>
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
          这些内容不是待办清单，而是同时运行的几个上下文。我会在它们之间来回切换，所以真正的推进方式更像多线程占用，而不是单线冲刺。
        </p>
      </section>
    </div>
  );
};

export default AboutNow;
