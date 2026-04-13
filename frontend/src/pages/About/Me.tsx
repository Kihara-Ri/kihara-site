import React from "react";
import styles from '../SectionLayout.module.css';
import showcaseStyles from '../Skills/Stack.module.css';

const personalityTags = ['细节打磨', '产品导向', '自驱迭代', '开始困难'];
const detailNotes = [
  {
    eyebrow: 'Interests',
    title: '兴趣方向',
    text: '前端界面、交互细节、实在的工具构建、写作表达，以及日语和其他外语',
  },
  {
    eyebrow: 'Workflow',
    title: '做事方式',
    text: '永远没有计划，走一步看一步，坚信车到山前必有路，船到桥头自然直。也正因为这样，生活里总会有些意外之喜，因为明天本来就无法完全预测。',
  },
];

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
              <p className={showcaseStyles.gameEyebrow}>10年+网瘾少年</p>
              <h2 className={showcaseStyles.gameTitle}>英雄联盟</h2>
            </div>
            <button type="button" className={showcaseStyles.gameHoverAnchor} aria-label="上单">
              <img
                className={showcaseStyles.gameRoleIcon}
                src="/games/lol/top-lane.png"
                alt="Top lane"
                loading="lazy"
              />
              <span className={showcaseStyles.gameTooltip}>上单</span>
            </button>
          </div>

          <div className={showcaseStyles.gameFoot}>
            <div className={showcaseStyles.gameMetaBlock}>
              <a
                className={showcaseStyles.gameMetaLink}
                href="https://www.bilibili.com/video/BV1GmCdYhE7N/"
                target="_blank"
                rel="noreferrer"
              >
                <strong className={showcaseStyles.gameMetaValue}>海洋之灾</strong>
                <span className={showcaseStyles.gameMetaHint}>详情</span>
              </a>
              <span className={showcaseStyles.gameMetaLabel}>3000+</span>
            </div>
          </div>
          <button type="button" className={[showcaseStyles.gameHoverAnchor, showcaseStyles.gameRankAnchor].join(' ')} aria-label="超凡大师">
            <img
              className={showcaseStyles.gameRankBadge}
              src="/games/lol/master-rank.png"
              alt="Master rank"
              loading="lazy"
            />
            <span className={showcaseStyles.gameTooltip}>超凡大师</span>
          </button>
        </div>
      </section>

      {/*
      <section className={showcaseStyles.minecraftCard}>
        <div className={showcaseStyles.minecraftBackdrop} aria-hidden="true">
          <span className={showcaseStyles.minecraftGlow} />
          <span className={showcaseStyles.minecraftGrid} />
          <span className={showcaseStyles.minecraftDust} />
          <span className={showcaseStyles.minecraftRepeater} />
          <span className={showcaseStyles.minecraftComparator} />
          <span className={showcaseStyles.minecraftBlockA} />
          <span className={showcaseStyles.minecraftBlockB} />
          <span className={showcaseStyles.minecraftBlockC} />
          <span className={showcaseStyles.minecraftGround} />
        </div>

        <div className={showcaseStyles.minecraftContent}>
          <div className={showcaseStyles.minecraftHead}>
            <div>
              <p className={showcaseStyles.minecraftEyebrow}>Sandbox / Mechanics</p>
              <h2 className={showcaseStyles.minecraftTitle}>Minecraft</h2>
              <p className={showcaseStyles.minecraftSummary}>
                对我来说它不只是生存和建筑，更像一个把机制、逻辑和自动化持续推到极致的工程沙盒。
              </p>
            </div>
            <div className={showcaseStyles.minecraftCodeBlock} aria-label="Minecraft specialties">
              <span>REDSTONE</span>
              <span>TECH MC</span>
            </div>
          </div>

          <div className={showcaseStyles.minecraftStats}>
            <div className={showcaseStyles.minecraftStat}>
              <span className={showcaseStyles.minecraftStatLabel}>Focus</span>
              <strong className={showcaseStyles.minecraftStatValue}>生电流派</strong>
            </div>
            <div className={showcaseStyles.minecraftStat}>
              <span className={showcaseStyles.minecraftStatLabel}>Method</span>
              <strong className={showcaseStyles.minecraftStatValue}>红石技术</strong>
            </div>
            <div className={showcaseStyles.minecraftStat}>
              <span className={showcaseStyles.minecraftStatLabel}>Playstyle</span>
              <strong className={showcaseStyles.minecraftStatValue}>机制创造</strong>
            </div>
          </div>

          <div className={showcaseStyles.minecraftTags} aria-label="Minecraft playstyle tags">
            <span className={showcaseStyles.minecraftTag}>自动化产线</span>
            <span className={showcaseStyles.minecraftTag}>漏斗物流</span>
            <span className={showcaseStyles.minecraftTag}>机制验证</span>
            <span className={showcaseStyles.minecraftTag}>活塞 / 观察者</span>
          </div>
        </div>
      </section>
      */}

      <section className={showcaseStyles.detailRail} aria-label="Personal notes">
        {detailNotes.map((item, index) => (
          <article key={item.title} className={showcaseStyles.detailEntry}>
            <span className={showcaseStyles.detailIndex} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className={showcaseStyles.detailBody}>
              <p className={showcaseStyles.detailCardEyebrow}>{item.eyebrow}</p>
              <h3 className={showcaseStyles.detailCardTitle}>{item.title}</h3>
              <p className={showcaseStyles.detailCardText}>{item.text}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

export default AboutMe;
