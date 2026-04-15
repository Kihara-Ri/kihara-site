import { useEffect, useMemo, useState } from 'react';
import { fetchOverview } from '../api/blogApi';
import { PublishCalendar } from '../components/PublishCalendar';
import type { ArticleMeta, Overview } from '../types';
import { formatDate } from '../utils/formatDate';
import styles from './BlogHomePage.module.css';

interface BlogHomePageProps {
  selectedTag: string;
  onSelectTag: (tag: string) => void;
  onOpenArticle: (slug: string) => void;
}

function renderStat(value: number): string {
  return value.toLocaleString('zh-CN');
}

function renderWordCount(value: number): string {
  return `${value.toLocaleString('zh-CN')} 字`;
}

function buildFilteredArticles(overview: Overview | null, selectedTag: string): ArticleMeta[] {
  if (!overview) {
    return [];
  }

  if (!selectedTag) {
    return overview.articles;
  }

  return overview.articles.filter((item) => item.tags.includes(selectedTag));
}

export function BlogHomePage({ selectedTag, onSelectTag, onOpenArticle }: BlogHomePageProps) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetchOverview()
      .then((data) => {
        if (cancelled) {
          return;
        }
        setOverview(data);
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }
        setError(requestError instanceof Error ? requestError.message : '获取总览信息失败');
      })
      .finally(() => {
        if (cancelled) {
          return;
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const articles = useMemo(
    () => buildFilteredArticles(overview, selectedTag),
    [overview, selectedTag],
  );

  const totalArticles = overview?.stats.totalArticles ?? 0;
  const leadArticle = articles[0] ?? null;
  const remainingArticles = leadArticle ? articles.slice(1) : articles;

  return (
    <div className={styles.page}>
      <main className={styles.mainColumn}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Blogs</p>
          <h1 className={styles.title}>🏗️ 施工中</h1>
          <p className={styles.subtitle}>
            留住 温度 速度 温柔和愤怒<br />
            凝住 今日 怎样好<br />
            音乐 话剧 诗词和舞蹈<br />
            揉合 生命 千样好<br />
          </p>
          <div className={styles.heroStats}>
            <div>
              <span className={styles.heroStatLabel}>Articles</span>
              <strong>{renderStat(overview?.stats.totalArticles ?? 0)}</strong>
            </div>
            <div>
              <span className={styles.heroStatLabel}>Tags</span>
              <strong>{renderStat(overview?.stats.totalTags ?? 0)}</strong>
            </div>
            <div>
              <span className={styles.heroStatLabel}>Range</span>
              <strong>
                {overview?.stats.earliestDate ? formatDate(overview.stats.earliestDate) : '-'}
              </strong>
            </div>
          </div>
        </header>

        {error ? <p className={styles.error}>{error}</p> : null}

        {loading ? <p className={styles.placeholder}>总览加载中...</p> : null}

        {!loading && overview ? (
          <>
            {leadArticle ? (
              <section className={styles.leadSection}>
                <div className={styles.cardsHeader}>
                  <h2 className={styles.sectionTitle}>最新文章</h2>
                  <p className={styles.metaText}>
                    {selectedTag ? `标签: ${selectedTag}` : '全部标签'} · {articles.length}/{totalArticles}
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.leadCard}
                  onClick={() => onOpenArticle(leadArticle.slug)}
                >
                  <span className={styles.leadIndex} aria-hidden="true">01</span>
                  <div className={styles.leadBody}>
                    <div className={styles.leadMeta}>
                      <span>{formatDate(leadArticle.date)}</span>
                      <span>{renderWordCount(leadArticle.wordCount)}</span>
                      {leadArticle.series ? <span>{leadArticle.series}</span> : null}
                    </div>
                    <h2 className={styles.leadTitle}>{leadArticle.title}</h2>
                    {leadArticle.summary ? <p className={styles.leadSummary}>{leadArticle.summary}</p> : null}
                    <div className={styles.cardTags}>
                      {leadArticle.tags.map((tag) => (
                        <span key={`${leadArticle.slug}-${tag}`} className={styles.cardTag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              </section>
            ) : null}

            {overview.series.length > 0 ? (
              <section className={styles.panel}>
                <h2 className={styles.sectionTitle}>系列</h2>
                <div className={styles.seriesRow}>
                  {overview.series.map((item) => (
                    <span key={item.series} className={styles.seriesChip}>
                      {item.series}
                      <em>{item.count}</em>
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            <section className={styles.panel}>
              <div className={styles.cardsHeader}>
                <h2 className={styles.sectionTitle}>文章列表</h2>
                <p className={styles.metaText}>默认新到旧</p>
              </div>

              {articles.length === 0 ? (
                <p className={styles.placeholder}>当前筛选条件下没有文章</p>
              ) : (
                <div className={styles.list}>
                  {remainingArticles.map((article, index) => (
                    <button
                      key={article.slug}
                      type="button"
                      className={styles.listItem}
                      onClick={() => onOpenArticle(article.slug)}
                    >
                      <span className={styles.listIndex} aria-hidden="true">
                        {String(index + 2).padStart(2, '0')}
                      </span>
                      <div className={styles.listItemMain}>
                        <h3 className={styles.cardTitle}>{article.title}</h3>
                        <p className={styles.cardMeta}>
                          <span>{formatDate(article.date)}</span>
                          <span>{renderWordCount(article.wordCount)}</span>
                        </p>
                        {article.summary ? <p className={styles.cardSummary}>{article.summary}</p> : null}
                        <div className={styles.cardTags}>
                          {article.tags.map((tag) => (
                            <span key={`${article.slug}-${tag}`} className={styles.cardTag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className={styles.listArrow}>↗</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>

      <aside className={styles.sideColumn}>
        <section className={styles.panel}>
          <h2 className={styles.sectionTitle}>统计</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>文章</span>
              <strong>{renderStat(overview?.stats.totalArticles ?? 0)}</strong>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>总词数</span>
              <strong>{renderStat(overview?.stats.totalWords ?? 0)}</strong>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>总字符</span>
              <strong>{renderStat(overview?.stats.totalCharacters ?? 0)}</strong>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>标签数</span>
              <strong>{renderStat(overview?.stats.totalTags ?? 0)}</strong>
            </div>
          </div>
          {overview?.stats.earliestDate && overview?.stats.latestDate ? (
            <p className={styles.rangeText}>
              {formatDate(overview.stats.earliestDate)} - {formatDate(overview.stats.latestDate)}
            </p>
          ) : null}
        </section>

        {overview ? (
          <PublishCalendar days={overview.calendar} latestDate={overview.stats.latestDate} />
        ) : null}

        <section className={styles.panel}>
          <div className={styles.cardsHeader}>
            <h2 className={styles.sectionTitle}>标签筛选</h2>
          </div>
          <div className={styles.tagList}>
            <button
              type="button"
              className={`${styles.tagButton} ${selectedTag === '' ? styles.selected : ''}`.trim()}
              onClick={() => onSelectTag('')}
            >
              全部
            </button>
            {(overview?.tags ?? []).map((item) => (
              <button
                key={item.tag}
                type="button"
                className={`${styles.tagButton} ${selectedTag === item.tag ? styles.selected : ''}`.trim()}
                onClick={() => onSelectTag(item.tag)}
              >
                {item.tag}
                <span>{item.count}</span>
              </button>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
