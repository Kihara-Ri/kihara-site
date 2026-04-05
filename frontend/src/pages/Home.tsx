import React, { useEffect, useState } from "react";
import AmazingGlobeScene from '../components/amazing-globe/AmazingGlobeScene';
import ArrivalPoem from '../components/home/ArrivalPoem';
import { siteConfig } from '../config/site';
import { fetchArticles } from '../features/blog/api/blogApi';
import type { ArticleMeta } from '../features/blog/types';
import { formatDate as formatBlogDate } from '../features/blog/utils/formatDate';
import { getOrCreateVisitorId } from '../utils/visitor';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const IP_API = 'https://api.ipify.org?format=json';
const HOME_LOCATION = {
  lat: 35.70798,
  lng: 139.84298,
};

interface VisitorIPInfo {
  ip: string;
  location: string; 
  distance: number;
  country_name: string;
  latitude: number;
  longitude: number;
}

interface VisitStats {
  visitor_id: string;
  visitor_ordinal: number;
  visit_count: number;
  is_first_visit: boolean;
}

type VisitorSnapshot = VisitorIPInfo & VisitStats;

let visitorSnapshotPromise: Promise<VisitorSnapshot> | null = null;
let visitorSnapshotCache: VisitorSnapshot | null = null;

function formatTokyoTime(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
    hour12: false,
  }).format(date);
}

function loadVisitorSnapshot() {
  if (visitorSnapshotCache) {
    return Promise.resolve(visitorSnapshotCache);
  }

  if (visitorSnapshotPromise) {
    return visitorSnapshotPromise;
  }

  visitorSnapshotPromise = fetch(IP_API)
    .then((res) => res.json())
    .then((data) => {
      const visitorId = getOrCreateVisitorId();

      return Promise.all([
        fetch(`/api/ipinfo?ip=${data.ip}`).then((res) => res.json() as Promise<VisitorIPInfo>),
        fetch('/api/visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ visitor_id: visitorId }),
        }).then((res) => res.json() as Promise<VisitStats>),
      ]);
    })
    .then(([ipInfo, visitStats]) => {
      visitorSnapshotCache = {
        ...ipInfo,
        ...visitStats,
      };

      return visitorSnapshotCache;
    })
    .catch((error) => {
      visitorSnapshotPromise = null;
      throw error;
    });

  return visitorSnapshotPromise;
}

const Home: React.FC = () => {
  const [visitor, setVisitor] = useState<VisitorSnapshot | null>(null);
  const [articles, setArticles] = useState<ArticleMeta[]>([]);
  const [tokyoTime, setTokyoTime] = useState(() => formatTokyoTime(new Date()));
  const heroRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLElement | null>(null);

  useEffect (() => {
    loadVisitorSnapshot()
      .then(setVisitor)
      .catch((err) => {
        console.error('首页访客信息初始化失败');
        console.error(err);
      })
  }, [])

  useEffect(() => {
    fetchArticles()
      .then((data) => {
        setArticles(data);
      })
      .catch((err) => {
        console.error('首页博客摘要获取失败');
        console.error(err);
      });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTokyoTime(formatTokyoTime(new Date()));
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let frameId = 0;

    const updateGlassProgress = () => {
      frameId = 0;
      const hero = heroRef.current;
      if (!hero) {
        return;
      }
      const viewportHeight = window.innerHeight || 1;
      const progress = Math.min(1, Math.max(0, window.scrollY / (viewportHeight * 0.32)));

      hero.style.setProperty('--hero-glass-opacity', progress.toFixed(3));
      hero.style.setProperty('--hero-glass-blur', `${(progress * 20).toFixed(2)}px`);
      hero.style.setProperty('--hero-glass-tint', (progress * 0.12).toFixed(3));
      hero.style.setProperty('--hero-glass-sheen', (progress * 0.32).toFixed(3));
    };

    const requestUpdate = () => {
      if (frameId !== 0) {
        return;
      }
      frameId = window.requestAnimationFrame(updateGlassProgress);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const latestArticle = articles[0] ?? null;
  const featuredWorks = siteConfig.homeContent.blogHighlights.featuredWorks
    .map((entry) => ({
      ...entry,
      article: articles.find((item) => item.slug === entry.slug) ?? null,
    }))
    .filter((entry) => entry.article);

  return (
    <div className={styles.page}>
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.overlay}>
          <div className={styles.heroInner}>
            <div className={styles.globeColumn}>
              <div className={styles.globeMeta}>
                <span className={styles.timeChip}>
                  {siteConfig.homeHero.timePrefix} {tokyoTime} {siteConfig.homeHero.timeZoneLabel}
                </span>
              </div>
              <div className={styles.globeFrame}>
                {visitor ? (
                  <AmazingGlobeScene
                    myLocation={HOME_LOCATION}
                    visitorLocation={{ lat: visitor.latitude, lng: visitor.longitude }}
                  />
                ) : (
                  <div className={styles.globeFallback} />
                )}
              </div>
              <div className={styles.globeLegend}>
                <span className={styles.legendItem}><i className={styles.legendDotHome} /> {siteConfig.homeHero.legendMe}</span>
                <span className={styles.legendItem}><i className={styles.legendDotVisitor} /> {siteConfig.homeHero.legendYou}</span>
              </div>
            </div>

            <div className={styles.infoColumn}>
              <div className={styles.intro}>
                <h1 className={styles.title}>{siteConfig.homeHero.title}</h1>
                <p className={styles.titleSub}>{siteConfig.homeHero.subtitleTag}</p>
                <p className={styles.subtitle}>
                  {siteConfig.homeHero.descriptionZh}
                </p>
                <p className={styles.subtitleEn}>
                  {siteConfig.homeHero.descriptionEn}
                </p>
              </div>

              <div className={styles.detailsRow}>
                <div className={styles.metrics}>
                  {visitor ? (
                    <>
                      <div className={styles.metricBlock}>
                        <p className={styles.metricLabel}>{siteConfig.homeHero.visitorLabels.currentVisitor}</p>
                        <p className={styles.metricValue}>{visitor.ip}</p>
                      </div>
                      <div className={styles.metricBlock}>
                        <p className={styles.metricLabel}>{siteConfig.homeHero.visitorLabels.detectedRegion}</p>
                        <p className={styles.metricValue}>{visitor.location}</p>
                      </div>
                      <div className={styles.metricGrid}>
                        <div>
                          <p className={styles.metricLabel}>{siteConfig.homeHero.visitorLabels.routeDistance}</p>
                          <p className={styles.metricValue}>
                            <span className={styles.metricAccent}>{visitor.distance.toFixed(0)} km</span>
                          </p>
                        </div>
                        <div>
                          <p className={styles.metricLabel}>{siteConfig.homeHero.visitorLabels.visitorCount}</p>
                          <p className={styles.metricValue}>第 {visitor.visitor_ordinal} 位</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className={styles.placeholder}>正在请求访客位置并初始化地球场景…</p>
                  )}
                </div>

                <div className={styles.poemWrap}>
                  {visitor ? (
                    <ArrivalPoem
                      countryName={visitor.country_name}
                      distance={visitor.distance}
                      visitCount={visitor.visit_count}
                    />
                  ) : (
                    <p className={styles.placeholder}>正在为这次抵达挑选一句合适的诗。</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.heroGlassOverlay} aria-hidden="true" />

        <div className={styles.arrowWrap}>
          <button className={styles.arrowButton} type="button" onClick={scrollToContent} aria-label="Scroll to content">
            <span className={styles.arrowIcon} aria-hidden="true" />
          </button>
        </div>
      </section>

      <section ref={contentRef} className={styles.contentSection}>
        <div className={styles.content}>
          <section className={styles.homeIntro}>
            <p className={styles.sectionEyebrow}>{siteConfig.homeContent.introduction.eyebrow}</p>
            <h2 className={styles.sectionTitle}>{siteConfig.homeContent.introduction.title}</h2>
            <p className={styles.sectionText}>{siteConfig.homeContent.introduction.text}</p>
          </section>

          <section className={styles.contentGrid}>
            <div className={styles.mainColumn}>
              <section className={styles.writingSection}>
                <div className={styles.sectionHead}>
                  <p className={styles.sectionEyebrow}>Featured Writing</p>
                  <h3 className={styles.subTitle}>我在做什么</h3>
                </div>
                <div className={styles.storyList}>
                  {siteConfig.homeContent.featuredWriting.map((item) => (
                    <article key={item.title} className={styles.storyCard}>
                      <p className={styles.storyCategory}>{item.category}</p>
                      <h4 className={styles.storyTitle}>{item.title}</h4>
                      <p className={styles.storySummary}>{item.summary}</p>
                    </article>
                  ))}
                </div>
              </section>

              {/* <section className={styles.blogShowcaseSection}>
                <div className={styles.sectionHead}>
                  <p className={styles.sectionEyebrow}>Selected Blogs</p>
                  <h3 className={styles.subTitle}>得意之作</h3>
                </div>
                <div className={styles.featuredTiles}>
                  {featuredWorks.map(({ slug, label, note, article }) => (
                    article ? (
                      <Link key={slug} to={`/blogs/${article.slug}`} className={styles.featuredTile}>
                        <span className={styles.featuredLabel}>{label}</span>
                        <h4 className={styles.featuredTitle}>{article.title}</h4>
                        <p className={styles.featuredSummary}>{article.summary ?? note}</p>
                        <div className={styles.featuredMeta}>
                          <span>{formatBlogDate(article.date)}</span>
                          <span>{article.wordCount} words</span>
                        </div>
                      </Link>
                    ) : null
                  ))}
                </div>
              </section> */}

              <section className={styles.signalsSection}>
                <div className={styles.sectionHead}>
                  <p className={styles.sectionEyebrow}>Current Signals</p>
                  <h3 className={styles.subTitle}>正在展开</h3>
                </div>
                <div className={styles.signalList}>
                  {siteConfig.homeContent.currentSignals.map((item) => (
                    <p key={item} className={styles.signalItem}>{item}</p>
                  ))}
                </div>
              </section>
            </div>

            <aside className={styles.sideColumn}>
              <section className={styles.shelfPanel}>
                <div className={styles.sectionHead}>
                  <p className={styles.sectionEyebrow}>{siteConfig.homeContent.blogHighlights.latestLabel}</p>
                  <h3 className={styles.subTitle}>最新文章</h3>
                </div>
                {latestArticle ? (
                  <Link to={`/blogs/${latestArticle.slug}`} className={styles.latestPostCard}>
                    <p className={styles.latestPostDate}>{formatBlogDate(latestArticle.date)}</p>
                    <h4 className={styles.latestPostTitle}>{latestArticle.title}</h4>
                    <p className={styles.latestPostSummary}>
                      {latestArticle.summary ?? '进入文章查看完整内容。'}
                    </p>
                    <div className={styles.latestPostTags}>
                      {latestArticle.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className={styles.latestPostTag}>#{tag}</span>
                      ))}
                    </div>
                  </Link>
                ) : (
                  <p className={styles.sectionText}>博客数据加载完成后，这里会展示最新发布的一篇文章。</p>
                )}
              </section>

              <section className={styles.shelfPanel}>
                <div className={styles.sectionHead}>
                  <p className={styles.sectionEyebrow}>Shelves</p>
                  <h3 className={styles.subTitle}>长期工作</h3>
                </div>
                <div className={styles.shelfList}>
                  {siteConfig.homeContent.shelves.map((item) => (
                    <div key={item.label} className={styles.shelfItem}>
                      <span className={styles.shelfLabel}>{item.label}</span>
                      <span className={styles.shelfValue}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </section>
        </div>
      </section>
    </div>
  )
}

export default Home;
