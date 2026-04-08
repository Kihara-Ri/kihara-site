import React from "react";
import styles from '../SectionLayout.module.css';
import showcaseStyles from '../Skills/Stack.module.css';

const personalityTags = ['细节打磨', '产品导向', '慢热投入', '自驱迭代', '语言学习', '开始困难'];

const AboutMe: React.FC = () => {
  return (
    <div className={showcaseStyles.stackShowcase}>
      <div className={styles.prose}>
        <h2>关于我</h2>
        <p>
          我主要把时间花在交互、连接和做一点图形相关的尝试，以及长期的语言学习上。
          我偏好把事情做得干净、可控，而不是堆很多现成模块快速拼出来；当我投入到一个项目里时，往往会反复打磨细节，直到满意为止，因此有时候容易钻牛角尖
        </p>
      </div>

      <section className={showcaseStyles.personalityCard}>
        <img
          className={showcaseStyles.personalityBackdrop}
          src="/mbti/infp-mediator.svg"
          alt=""
          aria-hidden="true"
          loading="lazy"
        />
        <div className={showcaseStyles.personalityCopy}>
          <p className={showcaseStyles.cardEyebrow}>标签</p>
          <h2 className={showcaseStyles.personalityTitle}>调停者</h2>
          <p className={showcaseStyles.personalityCode}>INFP-T</p>
          <div className={showcaseStyles.personalityTags} aria-label="Personality tags">
            {personalityTags.map((tag) => (
              <span key={tag} className={showcaseStyles.personalityTag}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      <section className={showcaseStyles.gameCard}>
        <img
          className={showcaseStyles.gameBackdrop}
          src="/games/gangplank.jpg"
          alt="Gangplank splash art"
          loading="lazy"
        />
        <div className={showcaseStyles.gameScrim} aria-hidden="true" />
        <div className={showcaseStyles.gameContent}>
          <div className={showcaseStyles.gameHead}>
            <div>
              <p className={showcaseStyles.gameEyebrow}>爱好游戏</p>
              <h2 className={showcaseStyles.gameTitle}>英雄联盟</h2>
            </div>
            <img
              className={showcaseStyles.gameRoleIcon}
              src="/games/lol/top-lane.png"
              alt="Top lane"
              loading="lazy"
            />
          </div>

          <div className={showcaseStyles.gameFoot}>
            <div className={showcaseStyles.gameMetaBlock}>
              <strong className={showcaseStyles.gameMetaValue}>海洋之灾</strong>
              <span className={showcaseStyles.gameMetaLabel}>人柱力</span>
            </div>
          </div>
          <img
            className={showcaseStyles.gameRankBadge}
            src="/games/lol/master-rank.png"
            alt="Master rank"
            loading="lazy"
          />
        </div>
      </section>

      <div className={[styles.split, showcaseStyles.detailCards].join(' ')}>
        <section className={[styles.card, showcaseStyles.detailCard].join(' ')}>
          <p className={showcaseStyles.detailCardEyebrow}>Interests</p>
          <h3 className={showcaseStyles.detailCardTitle}>兴趣方向</h3>
          <p className={showcaseStyles.detailCardText}>前端界面、交互细节、实在的工具构建、写作表达，以及日语和其他外语</p>
        </section>
        <section className={[styles.card, showcaseStyles.detailCard].join(' ')}>
          <p className={showcaseStyles.detailCardEyebrow}>Workflow</p>
          <h3 className={showcaseStyles.detailCardTitle}>做事方式</h3>
          <p className={showcaseStyles.detailCardText}>永远没有计划，走一步看一步，坚信车到山前必有路，船到桥头自然直。</p>
          <p className={showcaseStyles.detailCardText}>也正因为这样，生活里总会有些意外之喜，因为明天本来就无法完全预测。</p>
        </section>
      </div>
    </div>
  )
}

export default AboutMe;
