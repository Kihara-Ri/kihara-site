import { useEffect, useMemo, useRef } from 'react';
import type { HeadingItem } from '../plugins/types';
import styles from './TableOfContents.module.css';

interface TableOfContentsProps {
  headings: HeadingItem[];
  activeIds: string[];
  onNavigate?: () => void;
}

interface HeadingGroup {
  heading: HeadingItem;
  children: HeadingItem[];
}

function buildGroups(headings: HeadingItem[]): HeadingGroup[] {
  const groups: HeadingGroup[] = [];
  let currentGroup: HeadingGroup | null = null;

  for (const heading of headings) {
    if (heading.level === 2) {
      currentGroup = { heading, children: [] };
      groups.push(currentGroup);
      continue;
    }

    if (!currentGroup) {
      currentGroup = {
        heading: { id: '__ungrouped__', level: 2, text: '其他' },
        children: [],
      };
      groups.push(currentGroup);
    }

    currentGroup.children.push(heading);
  }

  return groups;
}

export function TableOfContents({ headings, activeIds, onNavigate }: TableOfContentsProps) {
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const groups = useMemo(() => buildGroups(headings), [headings]);
  const activeIdSet = useMemo(() => new Set(activeIds), [activeIds]);

  if (headings.length === 0) {
    return null;
  }

  useEffect(() => {
    const activeItem = activeItemRef.current;
    const list = listRef.current;
    if (!activeItem || !list) {
      return;
    }

    const listTop = list.scrollTop;
    const listBottom = listTop + list.clientHeight;
    const itemTop = activeItem.offsetTop - list.offsetTop;
    const itemBottom = itemTop + activeItem.offsetHeight;

    if (itemTop < listTop) {
      list.scrollTo({ top: itemTop - 12, behavior: 'auto' });
      return;
    }

    if (itemBottom > listBottom) {
      list.scrollTo({
        top: itemBottom - list.clientHeight + 12,
        behavior: 'auto',
      });
    }
  }, [activeIds]);

  return (
    <nav className={styles.toc} aria-label="文章目录">
      <div ref={listRef} className={styles.list}>
        {groups.map((group, index) => {
          const isSectionActive =
            activeIdSet.has(group.heading.id) || group.children.some((item) => activeIdSet.has(item.id));

          return (
            <section
              key={group.heading.id}
              className={`${styles.group} ${isSectionActive ? styles.groupActive : ''}`.trim()}
            >
              <a
                href={`#${group.heading.id}`}
                ref={activeIdSet.has(group.heading.id) ? activeItemRef : null}
                className={`${styles.item} ${styles.level2} ${
                  activeIdSet.has(group.heading.id) ? styles.active : ''
                }`.trim()}
                onClick={onNavigate}
              >
                <span className={styles.badge}>{index + 1}</span>
                <span className={styles.text}>{group.heading.text}</span>
              </a>

              {group.children.length > 0 ? (
                <div className={styles.children}>
                  {group.children.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      ref={activeIdSet.has(heading.id) ? activeItemRef : null}
                      className={`${styles.item} ${styles.level3} ${
                        activeIdSet.has(heading.id) ? styles.active : ''
                      }`.trim()}
                      onClick={onNavigate}
                    >
                      <span className={styles.childDot} aria-hidden="true" />
                      <span className={styles.text}>{heading.text}</span>
                    </a>
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </nav>
  );
}
