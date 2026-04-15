import { Link } from 'react-router-dom';
import { ArticleContent, ArticleOutline } from '../components/ArticleContent';
import { MarkdownArticle } from '../components/MarkdownArticle';
import type { Article, ArticleMeta } from '../types';
import { formatDate } from '../utils/formatDate';
import styles from './LyricAnalysisArticle.module.css';

interface LyricAnalysisArticleProps {
  article: Article;
  previous: ArticleMeta | null;
  next: ArticleMeta | null;
  onSelectTag: (tag: string) => void;
}

interface LyricAnalysisSections {
  lyrics: string;
  essay: string;
}

function splitLyricAnalysisContent(content: string): LyricAnalysisSections {
  const markerPattern = /^##\s+@(lyrics|essay)\s*$/gm;
  const markers = Array.from(content.matchAll(markerPattern));

  if (markers.length === 0) {
    return { lyrics: '', essay: content };
  }

  const sections: Partial<LyricAnalysisSections> = {};

  for (let index = 0; index < markers.length; index += 1) {
    const current = markers[index];
    const next = markers[index + 1];
    const key = current[1] as keyof LyricAnalysisSections;
    const start = (current.index ?? 0) + current[0].length;
    const end = next?.index ?? content.length;
    sections[key] = content.slice(start, end).trim();
  }

  return {
    lyrics: sections.lyrics ?? '',
    essay: sections.essay ?? content,
  };
}

function normalizeLyricsMarkdown(lyrics: string): string {
  return lyrics
    .split('\n')
    .map((line) => (line.trim() === '' ? '' : `${line}  `))
    .join('\n');
}

export function LyricAnalysisArticle({
  article,
  previous,
  next,
  onSelectTag,
}: LyricAnalysisArticleProps) {
  const { lyrics, essay } = splitLyricAnalysisContent(article.content);
  const hasPagination = Boolean(previous || next);
  const lyricMarkdown = normalizeLyricsMarkdown(lyrics);

  return (
    <section className={styles.shell}>
      <header className={styles.headerCard}>
        <div className={styles.headerMain}>
          <p className={styles.eyebrow}>Lyric Analysis</p>
          <h1 className={styles.title}>{article.title}</h1>
          <p className={styles.meta}>
            <span>{formatDate(article.date)}</span>
            <span>{article.wordCount.toLocaleString('zh-CN')} 字</span>
            {article.series ? <span>Series: {article.series}</span> : null}
          </p>
          {article.summary ? <p className={styles.summary}>{article.summary}</p> : null}
        </div>

        <div className={styles.tagsRow}>
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
      </header>

      <div className={styles.grid}>
        <aside className={styles.lyricsColumn}>
          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <span className={styles.panelLabel}>歌词</span>
            </header>
            {lyricMarkdown ? (
              <div className={styles.lyricsBody}>
                <MarkdownArticle markdown={lyricMarkdown} className={styles.lyricsArticle} />
              </div>
            ) : (
              <p className={styles.emptyState}>这篇文章还没有单独整理歌词部分。</p>
            )}
          </section>
        </aside>

        <div className={styles.analysisColumn}>
          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <span className={styles.panelLabel}>正文</span>
            </header>
            <ArticleContent markdown={essay} />
          </section>

          {hasPagination ? (
            <nav className={styles.pagination} aria-label="文章翻页">
              {previous ? (
                <Link to={`/blogs/${previous.slug}`} className={styles.pagerCard}>
                  <span className={styles.pagerLabel}>上一篇</span>
                  <strong>{previous.title}</strong>
                  <span className={styles.pagerDate}>{formatDate(previous.date)}</span>
                </Link>
              ) : null}

              {next ? (
                <Link to={`/blogs/${next.slug}`} className={styles.pagerCard}>
                  <span className={styles.pagerLabel}>下一篇</span>
                  <strong>{next.title}</strong>
                  <span className={styles.pagerDate}>{formatDate(next.date)}</span>
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>

        <aside className={styles.outlineColumn}>
          <ArticleOutline markdown={essay} />
        </aside>
      </div>
    </section>
  );
}
