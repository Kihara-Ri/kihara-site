import { useEffect, useMemo, useRef } from 'react';
import { renderMarkdown } from '../markdown/renderer';
import styles from './ArticleContent.module.css';

interface MarkdownArticleProps {
  markdown: string;
  className?: string;
  wrapperClassName?: string;
}

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

export function MarkdownArticle({
  markdown,
  className,
  wrapperClassName,
}: MarkdownArticleProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  const rendered = useMemo(() => renderMarkdown(markdown), [markdown]);

  useEffect(() => {
    const article = articleRef.current;
    if (!article) {
      return;
    }

    const wrapper = wrapperRef.current ?? article;

    const closeAll = () => {
      article.querySelectorAll('.is-open').forEach((node) => {
        node.classList.remove('is-open');
      });
    };

    const onArticleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const attach = target.closest('.md-attach');
      const annotation = target.closest('.md-annotation');

      if (!attach && !annotation) {
        closeAll();
        return;
      }

      const host = (attach ?? annotation) as HTMLElement;
      const isOpen = host.classList.contains('is-open');
      closeAll();
      if (!isOpen) {
        host.classList.add('is-open');
      }
    };

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!wrapper.contains(target)) {
        closeAll();
      }
    };

    article.addEventListener('click', onArticleClick);
    document.addEventListener('click', onDocumentClick);

    return () => {
      article.removeEventListener('click', onArticleClick);
      document.removeEventListener('click', onDocumentClick);
    };
  }, [rendered.html]);

  const articleNode = (
    <article
      ref={articleRef}
      className={joinClassNames(styles.blogArticle, className)}
      dangerouslySetInnerHTML={{ __html: rendered.html }}
    />
  );

  if (!wrapperClassName) {
    return articleNode;
  }

  return (
    <div ref={wrapperRef} className={wrapperClassName}>
      {articleNode}
    </div>
  );
}
