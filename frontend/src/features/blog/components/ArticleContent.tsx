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
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
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

  useEffect(() => {
    if (!isMobileTocOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileTocOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobileTocOpen]);

  return (
    <div className={styles.outlineWrap}>
      <div className={styles.desktopOutline}>
        <TableOfContents headings={rendered.env.headings} activeIds={activeHeadingIds} />
      </div>

      <button
        type="button"
        className={styles.mobileTocButton}
        onClick={() => setIsMobileTocOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isMobileTocOpen}
        aria-controls="mobile-toc-dialog"
        aria-label="打开目录"
      >
        <img src="/icons/UI/list.svg" alt="" aria-hidden="true" className={styles.mobileTocButtonIcon} />
      </button>

      {isMobileTocOpen ? (
        <div
          className={styles.mobileTocOverlay}
          onClick={() => setIsMobileTocOpen(false)}
          role="presentation"
        >
          <div
            id="mobile-toc-dialog"
            className={styles.mobileTocSheet}
            role="dialog"
            aria-modal="true"
            aria-label="文章目录"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.mobileTocHandle} aria-hidden="true" />
            <div className={styles.mobileTocHeader}>
              <h3 className={styles.mobileTocTitle}>目录</h3>
              <button
                type="button"
                className={styles.mobileTocClose}
                onClick={() => setIsMobileTocOpen(false)}
                aria-label="关闭目录"
              >
                <img src="/icons/UI/close.svg" alt="" aria-hidden="true" className={styles.mobileTocCloseIcon} />
              </button>
            </div>

            <div className={styles.mobileTocBody}>
              <TableOfContents
                headings={rendered.env.headings}
                activeIds={activeHeadingIds}
                onNavigate={() => setIsMobileTocOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
