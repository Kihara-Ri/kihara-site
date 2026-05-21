import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ECharts, EChartsOption } from 'echarts';
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

interface ImageLightboxState {
  src: string;
  alt: string;
  caption: string;
  origin: DOMRectReadOnly | null;
}

type ChartRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ChartRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeEscapedNewlines(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(/\\n/g, '\n');
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeEscapedNewlines(item));
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeEscapedNewlines(item)]),
    );
  }

  return value;
}

function mergeRecordDefaults(value: unknown, defaults: ChartRecord): ChartRecord {
  return {
    ...defaults,
    ...(isRecord(value) ? value : {}),
  };
}

function withTextStyle(value: unknown, defaults: ChartRecord): ChartRecord {
  const record = isRecord(value) ? value : {};
  return {
    ...record,
    textStyle: mergeRecordDefaults(record.textStyle, defaults),
  };
}

function mapChartAxis(value: unknown, textColor: string, lineColor: string, splitLineColor: string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => mapChartAxis(item, textColor, lineColor, splitLineColor));
  }

  if (!isRecord(value)) {
    return value;
  }

  return {
    ...value,
    axisLabel: mergeRecordDefaults(value.axisLabel, { color: textColor }),
    nameTextStyle: mergeRecordDefaults(value.nameTextStyle, { color: textColor }),
    axisLine: {
      ...(isRecord(value.axisLine) ? value.axisLine : {}),
      lineStyle: mergeRecordDefaults(isRecord(value.axisLine) ? value.axisLine.lineStyle : undefined, {
        color: lineColor,
      }),
    },
    splitLine: {
      ...(isRecord(value.splitLine) ? value.splitLine : {}),
      lineStyle: mergeRecordDefaults(isRecord(value.splitLine) ? value.splitLine.lineStyle : undefined, {
        color: splitLineColor,
      }),
    },
  };
}

function mapChartSeries(value: unknown, textColor: string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => mapChartSeries(item, textColor));
  }

  if (!isRecord(value)) {
    return value;
  }

  return {
    ...value,
    label: mergeRecordDefaults(value.label, {
      color: textColor,
      textBorderWidth: 0,
      textShadowBlur: 0,
    }),
    emphasis: isRecord(value.emphasis)
      ? {
          ...value.emphasis,
          label: mergeRecordDefaults(value.emphasis.label, {
            color: textColor,
            textBorderWidth: 0,
            textShadowBlur: 0,
          }),
        }
      : value.emphasis,
  };
}

function createThemedChartOption(option: EChartsOption, isDark: boolean): EChartsOption {
  const normalized = normalizeEscapedNewlines(option);
  const record = isRecord(normalized) ? normalized : {};
  const textColor = isDark ? '#f8fafc' : '#1f2937';
  const mutedTextColor = isDark ? '#cbd5e1' : '#64748b';
  const lineColor = isDark ? 'rgba(203, 213, 225, 0.52)' : 'rgba(71, 85, 105, 0.58)';
  const splitLineColor = isDark ? 'rgba(148, 163, 184, 0.20)' : 'rgba(100, 116, 139, 0.18)';

  return {
    ...record,
    textStyle: mergeRecordDefaults(record.textStyle, { color: textColor }),
    title: Array.isArray(record.title)
      ? record.title.map((item) =>
          isRecord(item)
            ? {
                ...item,
                textStyle: mergeRecordDefaults(item.textStyle, { color: textColor }),
                subtextStyle: mergeRecordDefaults(item.subtextStyle, { color: mutedTextColor }),
              }
            : item,
        )
      : isRecord(record.title)
        ? {
            ...record.title,
            textStyle: mergeRecordDefaults(record.title.textStyle, { color: textColor }),
            subtextStyle: mergeRecordDefaults(record.title.subtextStyle, { color: mutedTextColor }),
          }
        : record.title,
    legend: Array.isArray(record.legend)
      ? record.legend.map((item) => withTextStyle(item, { color: textColor }))
      : isRecord(record.legend)
        ? withTextStyle(record.legend, { color: textColor })
        : record.legend,
    xAxis: mapChartAxis(record.xAxis, mutedTextColor, lineColor, splitLineColor),
    yAxis: mapChartAxis(record.yAxis, mutedTextColor, lineColor, splitLineColor),
    series: mapChartSeries(record.series, textColor),
  } as EChartsOption;
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
  const lightboxImageRef = useRef<HTMLImageElement | null>(null);
  const [tooltip, setTooltip] = useState<FloatingTooltipState | null>(null);
  const [lightboxImage, setLightboxImage] = useState<ImageLightboxState | null>(null);
  const rendered = useMemo(() => renderMarkdown(markdown), [markdown]);

  useEffect(() => {
    const article = articleRef.current;
    if (!article) {
      return;
    }

    const chartNodes = Array.from(article.querySelectorAll<HTMLElement>('.md-echarts'));
    if (chartNodes.length === 0) {
      return;
    }

    let active = true;
    const charts: ECharts[] = [];
    const observers: ResizeObserver[] = [];
    const resizeHandlers: Array<() => void> = [];
    const themeObservers: MutationObserver[] = [];

    void import('echarts').then((echarts) => {
      if (!active) {
        return;
      }

      chartNodes.forEach((node) => {
        try {
          const rawOption = node.dataset.option;
          if (!rawOption) {
            throw new Error('missing chart option');
          }

          const option = JSON.parse(rawOption) as EChartsOption;
          node.textContent = '';

          const chart = echarts.init(node, undefined, { renderer: 'svg' });
          const setThemedOption = () => {
            chart.setOption(
              createThemedChartOption(option, document.documentElement.dataset.theme === 'dark'),
              { notMerge: true },
            );
          };

          setThemedOption();
          charts.push(chart);

          const resize = () => {
            chart.resize();
          };
          resizeHandlers.push(resize);

          if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver(resize);
            observer.observe(node);
            observers.push(observer);
          }

          window.addEventListener('resize', resize);

          if (typeof MutationObserver !== 'undefined') {
            const themeObserver = new MutationObserver(setThemedOption);
            themeObserver.observe(document.documentElement, {
              attributes: true,
              attributeFilter: ['data-theme'],
            });
            themeObservers.push(themeObserver);
          }
        } catch (error) {
          node.classList.add('md-echarts-error');
          node.textContent = '图表配置解析失败';
          console.error('ECharts markdown render failed', error);
        }
      });
    });

    return () => {
      active = false;
      observers.forEach((observer) => observer.disconnect());
      themeObservers.forEach((observer) => observer.disconnect());
      resizeHandlers.forEach((resize) => window.removeEventListener('resize', resize));
      charts.forEach((chart) => chart.dispose());
    };
  }, [rendered.html]);

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

      const imageButton = target.closest('.md-image-button');
      if (imageButton instanceof HTMLButtonElement) {
        event.preventDefault();
        const image = imageButton.querySelector('img');
        const origin = image?.getBoundingClientRect() ?? imageButton.getBoundingClientRect();
        setLightboxImage({
          src: imageButton.dataset.src ?? '',
          alt: imageButton.dataset.alt ?? '',
          caption: imageButton.dataset.caption ?? '',
          origin,
        });
        closeAll();
        clearTooltip();
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

  useEffect(() => {
    if (!lightboxImage) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightboxImage(null);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxImage]);

  useLayoutEffect(() => {
    const image = lightboxImageRef.current;
    const origin = lightboxImage?.origin;
    if (!image || !origin || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let animation: Animation | null = null;
    let frame = 0;

    const play = () => {
      frame = window.requestAnimationFrame(() => {
        const target = image.getBoundingClientRect();
        if (target.width <= 0 || target.height <= 0) {
          return;
        }

        const translateX = origin.left - target.left;
        const translateY = origin.top - target.top;
        const scaleX = origin.width / target.width;
        const scaleY = origin.height / target.height;

        animation = image.animate(
          [
            {
              transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
            },
            {
              transform: 'translate(0, 0) scale(1, 1)',
            },
          ],
          {
            duration: 320,
            easing: 'cubic-bezier(0.2, 0.86, 0.2, 1)',
            fill: 'both',
          },
        );
      });
    };

    if (image.complete) {
      play();
    } else {
      image.addEventListener('load', play, { once: true });
    }

    return () => {
      window.cancelAnimationFrame(frame);
      image.removeEventListener('load', play);
      animation?.cancel();
    };
  }, [lightboxImage]);

  const articleNode = (
    <article
      ref={articleRef}
      className={joinClassNames(styles.blogArticle, className)}
      dangerouslySetInnerHTML={{ __html: rendered.html }}
    />
  );
  const tooltipNode = tooltip
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
    : null;
  const lightboxNode = lightboxImage
    ? createPortal(
        <div
          className={styles.imageLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={lightboxImage.caption || lightboxImage.alt || '图片大图'}
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            className={styles.imageLightboxClose}
            aria-label="关闭大图"
            onClick={() => setLightboxImage(null)}
          />
          <figure className={styles.imageLightboxFigure} onClick={(event) => event.stopPropagation()}>
            <img ref={lightboxImageRef} src={lightboxImage.src} alt={lightboxImage.alt} />
            {lightboxImage.caption ? <figcaption>{lightboxImage.caption}</figcaption> : null}
          </figure>
        </div>,
        document.body,
      )
    : null;

  if (!wrapperClassName) {
    return (
      <>
        {articleNode}
        {tooltipNode}
        {lightboxNode}
      </>
    );
  }

  return (
    <div ref={wrapperRef} className={wrapperClassName}>
      {articleNode}
      {tooltipNode}
      {lightboxNode}
    </div>
  );
}
