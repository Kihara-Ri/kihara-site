import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchArticles } from "@/features/blog/api/blogApi";
import type { ArticleMeta } from "@/features/blog/types";
import { formatDate as formatBlogDate } from "@/features/blog/utils/formatDate";
import styles from '../layouts/BlogsLayout.module.css';

const BlogArchive: React.FC = () => {
  const { year, month } = useParams<{ year: string; month?: string }>();
  const [articles, setArticles] = useState<ArticleMeta[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArticles()
      .then((data) => {
        setArticles(data);
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : '归档页加载失败');
      });
  }, []);

  const filtered = useMemo(() => {
    return articles.filter((article) => {
      const [articleYear, articleMonth] = article.date.split('-');
      if (year && articleYear !== year) {
        return false;
      }
      if (month && articleMonth !== month) {
        return false;
      }
      return true;
    });
  }, [articles, month, year]);

  const archiveTitle = month ? `${year}/${month}` : year ?? 'Archive';

  return (
    <section className={styles.section}>
      <Link to="/blogs" className={styles.backLink}>← 返回博客首页</Link>
      <p className={styles.eyebrow}>Archive</p>
      <h1 className={styles.sectionTitle}>{archiveTitle}</h1>

      {error ? <p className={styles.errorState}>{error}</p> : null}

      <div className={styles.articleList}>
        {filtered.map((article) => (
          <Link key={article.slug} to={`/blogs/${article.slug}`} className={styles.articleCard}>
            <div className={styles.articleCardHeader}>
              <h2 className={styles.articleTitle}>{article.title}</h2>
              <span className={styles.articleDate}>{formatBlogDate(article.date)}</span>
            </div>
            <p className={styles.postSummary}>{article.summary ?? '这篇文章暂时没有摘要。'}</p>
          </Link>
        ))}
      </div>

      {!error && filtered.length === 0 ? (
        <p className={styles.emptyState}>这个归档时间下暂时没有文章。</p>
      ) : null}
    </section>
  )
}

export default BlogArchive;
