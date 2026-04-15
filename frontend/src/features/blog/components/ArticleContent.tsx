import { useEffect, useMemo, useState } from 'react';
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

function buildHeadingSections(headings: HeadingItem[]): HeadingSection[] {
  const resolved = headings
    .map((heading) => {
      const element = document.getElementById(heading.id);
      if (!element) {
        return null;
      }

      return {
        id: heading.id,
        start: element.getBoundingClientRect().top + window.scrollY,
        height: element.getBoundingClientRect().height,
      };
    })
    .filter((section): section is { id: string; start: number; height: number } => section !== null);

  return resolved.map((section, index) => {
    const next = resolved[index + 1];
    return {
      id: section.id,
      start: section.start,
      end: next ? next.start : section.start + Math.max(section.height, window.innerHeight * 0.6),
    };
  });
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
  const [activeHeadingIds, setActiveHeadingIds] = useState<string[]>([]);
  const rendered = useMemo(() => renderMarkdown(markdown), [markdown]);

  useEffect(() => {
    if (rendered.env.headings.length === 0) {
      return;
    }

    const resolveActiveHeading = () => {
      const nextActiveIds = resolveActiveHeadingIds(buildHeadingSections(rendered.env.headings));
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
    <div className={styles.outlineWrap}>
      <TableOfContents headings={rendered.env.headings} activeIds={activeHeadingIds} />
    </div>
  );
}
