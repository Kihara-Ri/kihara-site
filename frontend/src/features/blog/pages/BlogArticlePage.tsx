import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchArticle, fetchArticles } from '../api/blogApi';
import { ArticleContent, ArticleOutline } from '../components/ArticleContent';
import type { Article, ArticleMeta } from '../types';
import { formatDate } from '../utils/formatDate';
import { LyricAnalysisArticle } from './LyricAnalysisArticle';
import styles from './BlogArticlePage.module.css';

interface BlogArticlePageProps {
  slug: string;
  onBackHome: () => void;
  onSelectTag: (tag: string) => void;
}

export function BlogArticlePage({ slug, onBackHome, onSelectTag }: BlogArticlePageProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [articleList, setArticleList] = useState<ArticleMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    Promise.all([fetchArticle(slug), fetchArticles()])
      .then(([data, list]) => {
        if (cancelled) {
          return;
        }
        setArticle(data);
        setArticleList(list);
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }
        setArticle(null);
        setError(requestError instanceof Error ? requestError.message : '获取文章失败');
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
  }, [slug]);

  const neighbors = useMemo(() => {
    const index = articleList.findIndex((item) => item.slug === slug);
    return {
      previous: index > 0 ? articleList[index - 1] : null,
      next: index >= 0 ? articleList[index + 1] ?? null : null,
    };
  }, [articleList, slug]);

  const hasPagination = Boolean(neighbors.previous || neighbors.next);

  return (
    <div className={styles.page}>
      {/* <button type="button" className={styles.backButton} onClick={onBackHome}>
        返回总览
      </button> */}

      {loading ? <p className={styles.placeholder}>文章加载中...</p> : null}

      {error ? <p className={styles.error}>{error}</p> : null}

      {!loading && article ? (
        article.layout === 'lyric-analysis' ? (
          <LyricAnalysisArticle
            article={article}
            previous={neighbors.previous}
            next={neighbors.next}
            onSelectTag={onSelectTag}
          />
        ) : (
          <section className={styles.articleShell}>
            <div className={styles.articleColumn}>
              <header className={styles.articleCard}>
                <div className={styles.articleHeader}>
                  <h1 className={styles.title}>{article.title}</h1>
                  <p className={styles.meta}>
                    <span className={styles.metaItem}>
                      <span className={[styles.metaIcon, styles.metaIconDate].join(' ')} aria-hidden="true" />
                      <span>{formatDate(article.date)}</span>
                    </span>
                    <span className={styles.metaItem}>
                      <span className={[styles.metaIcon, styles.metaIconText].join(' ')} aria-hidden="true" />
                      <span>{article.wordCount.toLocaleString('zh-CN')} 字</span>
                    </span>
                    {article.series ? (
                      <span className={styles.metaItem}>
                        <span className={[styles.metaIcon, styles.metaIconBook].join(' ')} aria-hidden="true" />
                        <span>{article.series}</span>
                      </span>
                    ) : null}
                  </p>
                  {article.summary ? <p className={styles.summary}>{article.summary}</p> : null}

                  <div className={styles.tagsRow}>
                    <span className={styles.tagsLabel}>
                      <span className={[styles.metaIcon, styles.metaIconTag].join(' ')} aria-hidden="true" />
                      <span>标签</span>
                    </span>
                    {article.tags.map((tag) => (
                      <button
                        key={`${article.slug}-${tag}`}
                        type="button"
                        className={styles.tagButton}
                        onClick={() => onSelectTag(tag)}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </header>

              <div className={styles.contentCard}>
                <header className={styles.articleHeader}>
                  <span className={styles.contentLabel}>正文</span>
                </header>
                <ArticleContent markdown={article.content} />
              </div>

              {hasPagination ? (
                <nav className={styles.pagination} aria-label="文章翻页">
                  <div className={styles.pagerSlot}>
                    {neighbors.previous ? (
                      <Link to={`/blogs/${neighbors.previous.slug}`} className={styles.pagerCard}>
                        <span className={styles.pagerLabel}>上一篇</span>
                        <strong>{neighbors.previous.title}</strong>
                        <span className={styles.pagerDate}>{formatDate(neighbors.previous.date)}</span>
                      </Link>
                    ) : (
                      <div className={styles.pagerCardPlaceholder} aria-hidden="true" />
                    )}
                  </div>

                  <div className={styles.pagerSlot}>
                    {neighbors.next ? (
                      <Link to={`/blogs/${neighbors.next.slug}`} className={[styles.pagerCard, styles.pagerCardNext].join(' ')}>
                        <span className={styles.pagerLabel}>下一篇</span>
                        <strong>{neighbors.next.title}</strong>
                        <span className={styles.pagerDate}>{formatDate(neighbors.next.date)}</span>
                      </Link>
                    ) : (
                      <div className={styles.pagerCardPlaceholder} aria-hidden="true" />
                    )}
                  </div>
                </nav>
              ) : null}
            </div>

            <aside className={styles.outlineColumn}>
              <ArticleOutline markdown={article.content} />
            </aside>
          </section>
        )
      ) : null}
    </div>
  );
}
