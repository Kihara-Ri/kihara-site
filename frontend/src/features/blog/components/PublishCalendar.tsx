import { useMemo } from 'react';
import type { CalendarDay } from '../types';
import { formatDate } from '../utils/formatDate';
import styles from './PublishCalendar.module.css';

interface PublishCalendarProps {
  days: CalendarDay[];
  latestDate?: string;
}

interface HeatCell {
  key: string;
  date: string;
  count: number;
  inRange: boolean;
}

interface MonthMarker {
  label: string;
  weekIndex: number;
}

function parseDate(input?: string): Date | null {
  if (!input) {
    return null;
  }

  const parsed = new Date(`${input}T00:00:00`);
  if (Number.isNaN(parsed.valueOf())) {
    return null;
  }
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function clampLevel(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0 || maxCount <= 0) {
    return 0;
  }

  const scaled = Math.ceil((count / maxCount) * 4);
  const level = Math.max(1, Math.min(4, scaled));
  return level as 1 | 2 | 3 | 4;
}

export function PublishCalendar({ days, latestDate }: PublishCalendarProps) {
  const countByDate = useMemo(() => {
    const map = new Map<string, number>();
    days.forEach((day) => {
      map.set(day.date, day.count);
    });
    return map;
  }, [days]);

  const activeDays = useMemo(() => days.filter((item) => item.count > 0).length, [days]);
  const totalPublished = useMemo(() => days.reduce((sum, item) => sum + item.count, 0), [days]);

  const end = useMemo(() => parseDate(latestDate) ?? parseDate(toDateString(new Date())), [latestDate]);

  const heatmap = useMemo(() => {
    if (!end) {
      return { weeks: [] as HeatCell[][], markers: [] as MonthMarker[], maxCount: 0 };
    }

    const start = new Date(end);
    start.setDate(end.getDate() - 364);

    const gridStart = new Date(start);
    gridStart.setDate(start.getDate() - start.getDay());

    const gridEnd = new Date(end);
    gridEnd.setDate(end.getDate() + (6 - end.getDay()));

    const weeks: HeatCell[][] = [];
    const cursor = new Date(gridStart);

    while (cursor <= gridEnd) {
      const week: HeatCell[] = [];
      for (let day = 0; day < 7; day += 1) {
        const date = toDateString(cursor);
        const count = countByDate.get(date) ?? 0;
        const inRange = cursor >= start && cursor <= end;

        week.push({
          key: `${date}-${day}`,
          date,
          count,
          inRange,
        });

        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }

    const markers: MonthMarker[] = [];
    const seenMonth = new Set<string>();
    weeks.forEach((week, index) => {
      const pivot = week.find((cell) => cell.inRange && cell.date.endsWith('-01'));
      if (!pivot) {
        return;
      }
      const monthKey = pivot.date.slice(0, 7);
      if (seenMonth.has(monthKey)) {
        return;
      }
      seenMonth.add(monthKey);

      const labelDate = parseDate(`${monthKey}-01`);
      const label = labelDate
        ? labelDate.toLocaleDateString('zh-CN', { month: 'short' })
        : monthKey;

      markers.push({
        label,
        weekIndex: index,
      });
    });

    const maxCount = days.reduce((max, item) => Math.max(max, item.count), 0);

    return {
      weeks,
      markers,
      maxCount,
    };
  }, [countByDate, days, end]);

  if (!end) {
    return null;
  }

  return (
    <section className={styles.calendar} aria-label="发文日历">
      <header className={styles.header}>
        <h3 className={styles.title}>发文日历</h3>
        <p className={styles.meta}>
          最近 365 天 · {activeDays} 天有发布 · 共 {totalPublished} 篇
        </p>
      </header>

      <div className={styles.heatmapScroll}>
        <div className={styles.heatmapTrack}>
          <div
            className={styles.monthRow}
            style={{ gridTemplateColumns: `repeat(${Math.max(heatmap.weeks.length, 1)}, minmax(0, 1fr))` }}
          >
            {heatmap.markers.map((marker) => (
              <span
                key={`${marker.label}-${marker.weekIndex}`}
                className={styles.monthLabel}
                style={{ gridColumn: `${marker.weekIndex + 1} / span 4` }}
              >
                {marker.label}
              </span>
            ))}
          </div>

          <div className={styles.grid}>
            {heatmap.weeks.map((week, weekIndex) => (
              <div key={`week-${weekIndex}`} className={styles.weekColumn}>
                {week.map((cell) => {
                  const level = clampLevel(cell.count, heatmap.maxCount);
                  return (
                    <span
                      key={cell.key}
                      className={`${styles.cell} ${styles[`level${level}`]} ${cell.inRange ? '' : styles.outside}`.trim()}
                      title={`${formatDate(cell.date)}: ${cell.count} 篇`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.legend}>
        <span>{formatDate(toDateString(new Date(end.getTime() - 364 * 24 * 3600 * 1000)))}</span>
        <span>少</span>
        <span className={`${styles.cell} ${styles.level0}`} />
        <span className={`${styles.cell} ${styles.level1}`} />
        <span className={`${styles.cell} ${styles.level2}`} />
        <span className={`${styles.cell} ${styles.level3}`} />
        <span className={`${styles.cell} ${styles.level4}`} />
        <span>多</span>
        <span>{formatDate(toDateString(end))}</span>
      </div>
    </section>
  );
}
