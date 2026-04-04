import { useEffect, useMemo, useRef, useState } from 'react';
import { renderMarkdown } from '../markdown/renderer';
import type { HeadingItem } from '../plugins/types';
import { MarkdownArticle } from './MarkdownArticle';
import { TableOfContents } from './TableOfContents';
import styles from './ArticleContent.module.css';

interface ArticleContentProps {
  markdown: string;
}

interface ArticleOutlineProps {
  markdown: string;
}

interface HeadingSection {
  id: string;
  start: number;
  end: number;
}

function buildHeadingSections(article: HTMLElement, headings: HeadingItem[]): HeadingSection[] {
  const articleTop = article.getBoundingClientRect().top + window.scrollY;

  return headings
    .map((heading, index) => {
      const element = article.querySelector<HTMLElement>(`#${CSS.escape(heading.id)}`);
      if (!element) {
        return null;
      }

      const start = element.getBoundingClientRect().top + window.scrollY;
      const nextHeading = headings
        .slice(index + 1)
        .map((item) => article.querySelector<HTMLElement>(`#${CSS.escape(item.id)}`))
        .find(Boolean);
      const end = nextHeading
        ? nextHeading.getBoundingClientRect().top + window.scrollY
        : articleTop + article.offsetHeight;

      return { id: heading.id, start, end };
    })
    .filter((section): section is HeadingSection => section !== null);
}

function resolveActiveHeadingIds(sections: HeadingSection[]): string[] {
  if (sections.length === 0) {
    return [];
  }

  const viewportTop = window.scrollY + window.innerHeight * 0.1;
  const viewportBottom = window.scrollY + window.innerHeight * 0.9;
  const activeIds = sections
    .filter((section) => section.end > viewportTop && section.start < viewportBottom)
    .map((section) => section.id);

  if (activeIds.length > 0) {
    return activeIds;
  }

  const firstUpcomingSection = sections.find((section) => section.end > viewportTop);
  return [firstUpcomingSection?.id ?? sections[sections.length - 1].id];
}

export function ArticleContent({ markdown }: ArticleContentProps) {
  return <MarkdownArticle markdown={markdown} wrapperClassName={styles.contentWrap} />;
}

export function ArticleOutline({ markdown }: ArticleOutlineProps) {
  const articleRef = useRef<HTMLElement | null>(null);
  const [activeHeadingIds, setActiveHeadingIds] = useState<string[]>([]);
  const rendered = useMemo(() => renderMarkdown(markdown), [markdown]);

  useEffect(() => {
    const article = articleRef.current;
    if (!article || rendered.env.headings.length === 0) {
      return;
    }

    const resolveSections = () => buildHeadingSections(article, rendered.env.headings);

    const resolveActiveHeading = () => {
      const nextActiveIds = resolveActiveHeadingIds(resolveSections());
      setActiveHeadingIds((current) =>
        current.length === nextActiveIds.length &&
        current.every((item, index) => item === nextActiveIds[index])
          ? current
          : nextActiveIds,
      );
    };

    const frameId = window.requestAnimationFrame(resolveActiveHeading);
    window.addEventListener('scroll', resolveActiveHeading, { passive: true });
    window.addEventListener('resize', resolveActiveHeading);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', resolveActiveHeading);
      window.removeEventListener('resize', resolveActiveHeading);
    };
  }, [rendered.env.headings]);

  return (
    <>
      <article
        ref={articleRef}
        className={styles.measureArticle}
        dangerouslySetInnerHTML={{ __html: rendered.html }}
        aria-hidden="true"
      />
      <div className={styles.outlineWrap}>
        <TableOfContents headings={rendered.env.headings} activeIds={activeHeadingIds} />
      </div>
    </>
  );
}
