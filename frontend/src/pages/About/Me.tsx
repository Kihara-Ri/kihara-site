import React from "react";
import showcaseStyles from '../Skills/Stack.module.css';
import { useToast } from '../../context/ToastContext';

const personalityTags = ['细节打磨', '产品导向', '自驱迭代', '开始困难'];
const motivationWords = ['体验', '思考', '记录', '创造'];
const MOTIVATION_INTERVAL_MS = 2200;
const MOTIVATION_TRANSITION_MS = 260;
const personalityTraits = [
  { leftLabel: 'Extraverted', rightLabel: 'Introverted', result: 'Introverted', value: 76, side: 'right', color: '#4a9dbb' },
  { leftLabel: 'Intuitive', rightLabel: 'Observant', result: 'Intuitive', value: 73, side: 'left', color: '#d9a01a' },
  { leftLabel: 'Thinking', rightLabel: 'Feeling', result: 'Feeling', value: 73, side: 'right', color: '#36a271' },
  { leftLabel: 'Judging', rightLabel: 'Prospecting', result: 'Prospecting', value: 88, side: 'right', color: '#8560aa' },
  { leftLabel: 'Assertive', rightLabel: 'Turbulent', result: 'Turbulent', value: 56, side: 'right', color: '#e7646b' },
];

const personalityCopyText = [
  '你是一名擅长人格分析、行为模式归纳和长期发展建议的观察者。请基于以下 MBTI 结果，对这个人做一份尽量具体、克制、可感知的性格分析。',
  '',
  '[基础数据]',
  '人格类型：INFP-T',
  '类型别名：Mediator / 调停者',
  '维度结果：',
  '- Introverted 76%',
  '- Intuitive 73%',
  '- Feeling 73%',
  '- Prospecting 88%',
  '- Turbulent 56%',
  '',
  '[分析要求]',
  '1. 不要只复述 MBTI 标签含义，要尽量推断出更具体的心理倾向与行为模式。',
  '2. 结论需要贴近现实生活，避免空泛、模板化、鸡汤式表达。',
  '3. 如果某些结论只是高概率推测，请明确说明是推测，不要说得过于绝对。',
  '',
  '[请重点分析这些方面]',
  '1. 这个人的核心性格气质与内在驱动力。',
  '2. 这个人的思维方式、做决定时更看重什么、容易被什么打动或困住。',
  '3. 这个人的行为倾向：做事节奏、面对计划与变化的态度、是否容易拖延、是否容易反复打磨细节。',
  '4. 这个人的人际互动风格：表达方式、边界感、共情能力、冲突处理倾向。',
  '5. 这个人在学习、创作、技术工作、长期项目推进中的潜在优势。',
  '6. 这个人的潜在盲点、缺点以及可能遇到的挑战和困难。',
  '7. 对这个人来说，什么样的环境、协作方式、成长路径可能更合适。',
  '',
  '[输出方式]',
  '请分点作答，尽量具体。如果可以，请在最后补充一个“适合这个人的行动建议”小节。',
].join('\n');

const AboutMe: React.FC = () => {
  const [isPersonalityOpen, setIsPersonalityOpen] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);
  const [motivationIndex, setMotivationIndex] = React.useState(0);
  const [isMotivationAnimating, setIsMotivationAnimating] = React.useState(true);
  const { showToast } = useToast();
  const motivationLoopWords = React.useMemo(
    () => [...motivationWords, motivationWords[0]],
    [],
  );

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setMotivationIndex((current) => current + 1);
    }, MOTIVATION_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  React.useEffect(() => {
    if (isMotivationAnimating) {
      return undefined;
    }

    let frameId = 0;
    frameId = window.requestAnimationFrame(() => {
      setIsMotivationAnimating(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isMotivationAnimating]);

  const handleMotivationTransitionEnd = () => {
    if (motivationIndex !== motivationWords.length) {
      return;
    }

    setIsMotivationAnimating(false);
    setMotivationIndex(0);
  };

  React.useEffect(() => {
    if (!isCopied) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setIsCopied(false);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [isCopied]);

  const handleCopyPersonality = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(personalityCopyText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = personalityCopyText;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        const copied = document.execCommand('copy');
        document.body.removeChild(textarea);

        if (!copied) {
          throw new Error('copy_failed');
        }
      }

      setIsCopied(true);
      showToast('已复制到剪贴板', 'success');
    } catch {
      setIsCopied(false);
      showToast('复制失败，请重试', 'error');
    }
  };

  return (
    <div className={showcaseStyles.stackShowcase}>
      <section className={showcaseStyles.aboutTopCards} aria-label="About highlights">
        <article className={showcaseStyles.motivationCard}>
          <p className={showcaseStyles.aboutMiniEyebrow}>追求</p>
          <div className={showcaseStyles.motivationBody}>
            <h2 className={showcaseStyles.motivationTitle}>
              <span>源于热情</span>
              <span>所以保持</span>
            </h2>
            <div className={showcaseStyles.motivationSwitch} aria-live="polite">
              <div
                className={showcaseStyles.motivationTrack}
                onTransitionEnd={handleMotivationTransitionEnd}
                style={{
                  transform: `translate3d(0, calc(-1 * ${motivationIndex} * var(--motivation-row-height)), 0)`,
                  transitionDuration: isMotivationAnimating
                    ? `${MOTIVATION_TRANSITION_MS}ms`
                    : '0ms',
                }}
              >
                {motivationLoopWords.map((word, index) => (
                  <span key={`${word}-${index}`} className={showcaseStyles.motivationWord}>{word}</span>
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className={showcaseStyles.traitCard}>
          <p className={showcaseStyles.aboutMiniEyebrow}>特点</p>
          <div className={showcaseStyles.traitLines}>
            <p className={showcaseStyles.traitLine}>折腾自己一把好手</p>
            <p className={showcaseStyles.traitLine}>除了正事什么都干</p>
          </div>
        </article>
      </section>

      <div className={showcaseStyles.personalityCluster}>
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
            <button
              type="button"
              className={showcaseStyles.personalityCode}
              aria-expanded={isPersonalityOpen}
              aria-controls="personality-traits-panel"
              onClick={() => setIsPersonalityOpen((open) => !open)}
            >
              <span className={showcaseStyles.personalityCodeValue}>INFP-T</span>
              <span className={showcaseStyles.personalityCodeHint}>
                {isPersonalityOpen ? '收起' : '展开'}
              </span>
            </button>
            <div className={showcaseStyles.personalityTags} aria-label="Personality tags">
              {personalityTags.map((tag) => (
                <span key={tag} className={showcaseStyles.personalityTag}>{tag}</span>
              ))}
            </div>
          </div>
        </section>
        <section
          id="personality-traits-panel"
          className={[
            showcaseStyles.personalityPanel,
            isPersonalityOpen ? showcaseStyles.personalityPanelOpen : '',
          ].join(' ')}
          aria-label="Personality traits details"
        >
          <div className={showcaseStyles.personalityPanelHead}>
            <div className={showcaseStyles.personalityPanelTitleRow}>
              <h3 className={showcaseStyles.personalityPanelTitle}>Mediator / INFP-T</h3>
              <button
                type="button"
                className={[
                  showcaseStyles.personalityPanelCopy,
                  isCopied ? showcaseStyles.personalityPanelCopyActive : '',
                ].join(' ')}
                aria-label={isCopied ? 'Copied' : 'Copy personality details'}
                onClick={handleCopyPersonality}
              >
                <span className={showcaseStyles.personalityPanelCopyIcon} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className={showcaseStyles.personalityMetricList}>
            {personalityTraits.map((trait) => (
              <div
                key={trait.result}
                className={showcaseStyles.personalityMetric}
                style={{ '--trait-color': trait.color } as React.CSSProperties}
              >
                <div className={showcaseStyles.personalityMetricHead}>
                  <strong
                    className={showcaseStyles.personalityMetricValue}
                    style={
                      {
                        left: `${trait.side === 'right' ? trait.value : 100 - trait.value}%`,
                      } as React.CSSProperties
                    }
                  >
                    {trait.value}% {trait.result}
                  </strong>
                </div>
                <span className={showcaseStyles.personalityMetricTrack} aria-hidden="true">
                  <span className={showcaseStyles.personalityMetricIndicator} />
                  <span
                    className={showcaseStyles.personalityMetricMarker}
                    style={
                      {
                        left: `${trait.side === 'right' ? trait.value : 100 - trait.value}%`,
                      } as React.CSSProperties
                    }
                  />
                </span>
                <span className={showcaseStyles.personalityMetricAxis}>
                  <span>{trait.leftLabel}</span>
                  <span>{trait.rightLabel}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

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

    </div>
  )
}

export default AboutMe;
