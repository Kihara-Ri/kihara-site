import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '@/context/ToastContext';
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

interface FloatingTooltipState {
  content: string;
  left: number;
  top: number;
  placement: 'top' | 'bottom';
}

export function MarkdownArticle({
  markdown,
  className,
  wrapperClassName,
}: MarkdownArticleProps) {
  const { showToast } = useToast();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  const activeTooltipHostRef = useRef<HTMLElement | null>(null);
  const [tooltip, setTooltip] = useState<FloatingTooltipState | null>(null);
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

    const resolveTooltipContent = (host: HTMLElement) => {
      const tooltipNode = host.querySelector('.md-tooltip');
      return tooltipNode?.textContent?.trim() ?? '';
    };

    const updateTooltip = (host: HTMLElement | null) => {
      if (!host) {
        activeTooltipHostRef.current = null;
        setTooltip(null);
        return;
      }

      const content = resolveTooltipContent(host);
      if (!content) {
        activeTooltipHostRef.current = null;
        setTooltip(null);
        return;
      }

      const rect = host.getBoundingClientRect();
      const tooltipWidth = Math.min(360, window.innerWidth - 24);
      const left = Math.min(Math.max(12, rect.left), window.innerWidth - tooltipWidth - 12);
      const preferTop = rect.bottom + 172 > window.innerHeight && rect.top > 180;
      const top = preferTop ? Math.max(12, rect.top - 12) : Math.min(window.innerHeight - 12, rect.bottom + 12);

      activeTooltipHostRef.current = host;
      setTooltip({
        content,
        left,
        top,
        placement: preferTop ? 'top' : 'bottom',
      });
    };

    const clearTooltip = () => {
      activeTooltipHostRef.current = null;
      setTooltip(null);
    };

    const copyCode = async (button: HTMLButtonElement) => {
      const code = button.dataset.code ?? '';
      if (!code) {
        return;
      }

      const showSuccessIcon = () => {
        button.classList.remove('is-success');
        void button.offsetWidth;
        button.classList.add('is-success');
        window.setTimeout(() => {
          if (button.isConnected) {
            button.classList.remove('is-success');
          }
        }, 1400);
      };

      try {
        await navigator.clipboard.writeText(code);
        showSuccessIcon();
        showToast('代码已复制');
      } catch {
        const textarea = document.createElement('textarea');
        try {
          textarea.value = code;
          textarea.setAttribute('readonly', 'true');
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          const copied = document.execCommand('copy');
          if (!copied) {
            throw new Error('copy failed');
          }
          showSuccessIcon();
          showToast('代码已复制');
        } catch {
          showToast('复制失败，请重试', 'error');
        } finally {
          document.body.removeChild(textarea);
        }
      }
    };

    const onArticleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const copyButton = target.closest('.md-code-copy');

      if (copyButton instanceof HTMLButtonElement) {
        event.preventDefault();
        void copyCode(copyButton);
        return;
      }

      const attach = target.closest('.md-attach');
      const annotation = target.closest('.md-annotation');

      if (!attach && !annotation) {
        closeAll();
        clearTooltip();
        return;
      }

      const host = (attach ?? annotation) as HTMLElement;
      const isOpen = host.classList.contains('is-open');
      closeAll();
      if (!isOpen) {
        host.classList.add('is-open');
        updateTooltip(host);
        return;
      }

      clearTooltip();
    };

    const onArticleMouseMove = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const host = target?.closest('.md-attach, .md-annotation') as HTMLElement | null;
      const pinnedHost = article.querySelector('.md-attach.is-open, .md-annotation.is-open') as HTMLElement | null;

      if (host) {
        updateTooltip(host);
        return;
      }

      if (pinnedHost) {
        updateTooltip(pinnedHost);
        return;
      }

      clearTooltip();
    };

    const onArticleMouseLeave = () => {
      const pinnedHost = article.querySelector('.md-attach.is-open, .md-annotation.is-open') as HTMLElement | null;
      if (pinnedHost) {
        updateTooltip(pinnedHost);
        return;
      }

      clearTooltip();
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      const host = target?.closest('.md-attach, .md-annotation') as HTMLElement | null;
      if (host) {
        updateTooltip(host);
      }
    };

    const onFocusOut = () => {
      window.requestAnimationFrame(() => {
        const activeElement = document.activeElement as HTMLElement | null;
        const focusedHost = activeElement?.closest('.md-attach, .md-annotation') as HTMLElement | null;
        const pinnedHost = article.querySelector('.md-attach.is-open, .md-annotation.is-open') as HTMLElement | null;
        updateTooltip(focusedHost ?? pinnedHost);
      });
    };

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!wrapper.contains(target)) {
        closeAll();
        clearTooltip();
      }
    };

    const refreshTooltipPosition = () => {
      const pinnedHost = article.querySelector('.md-attach.is-open, .md-annotation.is-open') as HTMLElement | null;
      updateTooltip(pinnedHost ?? activeTooltipHostRef.current);
    };

    article.addEventListener('click', onArticleClick);
    article.addEventListener('mousemove', onArticleMouseMove);
    article.addEventListener('mouseleave', onArticleMouseLeave);
    article.addEventListener('focusin', onFocusIn);
    article.addEventListener('focusout', onFocusOut);
    document.addEventListener('click', onDocumentClick);
    window.addEventListener('scroll', refreshTooltipPosition, true);
    window.addEventListener('resize', refreshTooltipPosition);

    return () => {
      article.removeEventListener('click', onArticleClick);
      article.removeEventListener('mousemove', onArticleMouseMove);
      article.removeEventListener('mouseleave', onArticleMouseLeave);
      article.removeEventListener('focusin', onFocusIn);
      article.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('click', onDocumentClick);
      window.removeEventListener('scroll', refreshTooltipPosition, true);
      window.removeEventListener('resize', refreshTooltipPosition);
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
    return (
      <>
        {articleNode}
        {tooltip
          ? createPortal(
              <div
                className={styles.floatingTooltip}
                style={{
                  left: tooltip.left,
                  top: tooltip.top,
                  transform: tooltip.placement === 'top' ? 'translateY(-100%)' : undefined,
                }}
              >
                {tooltip.content}
              </div>,
              document.body,
            )
          : null}
      </>
    );
  }

  return (
    <div ref={wrapperRef} className={wrapperClassName}>
      {articleNode}
      {tooltip
        ? createPortal(
            <div
              className={styles.floatingTooltip}
              style={{
                left: tooltip.left,
                top: tooltip.top,
                transform: tooltip.placement === 'top' ? 'translateY(-100%)' : undefined,
              }}
            >
              {tooltip.content}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
