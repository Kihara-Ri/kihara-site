import React, { type CSSProperties } from "react";
import styles from './Stack.module.css';

type BadgeItem = {
  name: string;
  icon?: string;
  short?: string;
  accent: string;
};

const languageBadges: BadgeItem[] = [
  { name: 'TypeScript', icon: '/techIcon/typescript.svg', accent: '#60a5fa' },
  { name: 'JavaScript', icon: '/techIcon/javascript.svg', accent: '#f6c453' },
  { name: 'Python', icon: '/techIcon/python.svg', accent: '#7aa8ff' },
  { name: 'Go', icon: '/techIcon/go.svg', accent: '#6ee7f9' },
  { name: 'Swift', icon: '/techIcon/swift.svg', accent: '#fb923c' },
];

const stackBadges: BadgeItem[] = [
  { name: 'React', icon: '/techIcon/react.svg', accent: '#7dd3fc' },
  { name: 'Vite', icon: '/techIcon/vite.svg', accent: '#a78bfa' },
  { name: 'CSS', icon: '/techIcon/css.svg', accent: '#60a5fa' },
  { name: 'Three.js', icon: '/techIcon/threejs.svg', accent: '#94a3b8' },
];

const codexBadges: BadgeItem[] = [
  { name: 'Codex', icon: '/icons/UI/aichat.svg', accent: '#10b981' },
];

const toolBadges: BadgeItem[] = [
  { name: 'Markdown', icon: '/techIcon/markdown.svg', accent: '#f59e0b' },
  { name: 'Vim', icon: '/techIcon/vim.svg', accent: '#22c55e' },
  { name: 'Git', icon: '/techIcon/git.svg', accent: '#f97316' },
  { name: 'Terminal', icon: '/techIcon/terminal.svg', accent: '#94a3b8' },
];

function Badge({ item }: { item: BadgeItem }) {
  return (
    <article
      className={styles.skillBadge}
      style={{ '--skill-accent': item.accent } as CSSProperties}
    >
      <span className={styles.skillBadgeIconWrap} aria-hidden="true">
        {item.icon ? (
          <img className={styles.skillBadgeIcon} src={item.icon} alt="" />
        ) : (
          <span className={styles.skillBadgeInitial}>{item.short}</span>
        )}
      </span>
      <span className={styles.skillBadgeLabel}>{item.name}</span>
    </article>
  );
}

const SkillsStack: React.FC = () => {
  return (
    <div className={styles.stackShowcase}>
      <section className={styles.skillHeroCard}>
        <div className={styles.cardLead}>
          <p className={styles.cardEyebrow}>Stack</p>
          <h2 className={styles.cardTitle}>把表达做成系统</h2>
          <p className={styles.cardSummary}>
            对我来说，技术栈不是一串名词，而是一套把内容、交互、结构和视觉稳定落地的方式
          </p>
        </div>
      </section>

      <div className={styles.stackSplit}>
        <section className={styles.stackCard}>
          <div className={styles.stackCardHead}>
            <p className={styles.cardEyebrow}>技术栈</p>
            <h3 className={styles.stackCardTitle}>语言与实现</h3>
            <p className={styles.stackCardSummary}>
              但重要的不是用了什么工具，而是内容本身
            </p>
          </div>

          <div className={styles.stackGroups}>
            <section className={styles.stackGroup}>
              <p className={styles.stackGroupLabel}>Programming Languages</p>
              <div className={styles.skillBadgeGrid}>
                {languageBadges.map((item) => (
                  <Badge key={item.name} item={item} />
                ))}
              </div>
            </section>

            <section className={styles.stackGroup}>
              <p className={styles.stackGroupLabel}>Frameworks / Runtime / Rendering</p>
              <div className={styles.skillBadgeGrid}>
                {stackBadges.map((item) => (
                  <Badge key={item.name} item={item} />
                ))}
              </div>
            </section>

            <section className={styles.stackGroup}>
              <p className={styles.stackGroupLabel}>Assistant Layer</p>
              <div className={styles.skillBadgeGrid}>
                {codexBadges.map((item) => (
                  <Badge key={item.name} item={item} />
                ))}
              </div>
              <p className={styles.stackGroupNote}>大模型触发器🤓👆</p>
            </section>
          </div>
        </section>

        <section className={styles.toolCard}>
          <div className={styles.stackCardHead}>
            <p className={styles.cardEyebrow}>工具与哲学</p>
            <h3 className={styles.stackCardTitle}>不只是工具</h3>
          </div>

          <p className={styles.toolLead}>
            我使用的这些工具，它们背后代表的不只是一个具体的应用，而是一整套运行的哲学
          </p>

          <div className={styles.toolBadgeGrid}>
            {toolBadges.map((item) => (
              <Badge key={item.name} item={item} />
            ))}
          </div>

          <div className={styles.toolManifesto}>
            <p className={styles.toolManifestoLine}>
              <code className={styles.inlineCode}>Markdown</code>
              {' '}不要过度关注内容样式的设计，专注于内容本身的表达和组织，样式和内容分离
            </p>
            <p className={styles.toolManifestoLine}>
              <code className={styles.inlineCode}>Vim</code>
              {' '}表达的是像编程一样组织命令，把编辑器当成可以灵活操控的动作系统
            </p>
            <p className={styles.toolManifestoLine}>
              <code className={styles.inlineCode}>Terminal</code>
              {' '}则更接近对输入与输出的直接掌控，让信息流转尽量少经过多余包装
            </p>
            <p className={styles.toolManifestoLine}>
              <code className={styles.inlineCode}>Git</code>
              {' '}对应的是可回溯、可审视的修改历史，让实现过程本身也保持清晰
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SkillsStack;
