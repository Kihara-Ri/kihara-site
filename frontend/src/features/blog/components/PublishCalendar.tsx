import { useMemo } from 'react';
import { max, rollup } from 'd3-array';
import { timeFormat } from 'd3-time-format';
import type { EChartsOption } from 'echarts';
import { BaseEChart } from '../../../components/charts/BaseEChart';
import type { CalendarDay } from '../types';
import styles from './PublishCalendar.module.css';

interface PublishCalendarProps {
  days: CalendarDay[];
  latestDate?: string;
}

interface MonthlyBucket {
  key: string;
  label: string;
  count: number;
}

const monthLabel = timeFormat('%-m月');

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

function buildMonthlyBuckets(days: CalendarDay[], end: Date): MonthlyBucket[] {
  const counts = rollup(
    days,
    (values) => values.reduce((sum, item) => sum + item.count, 0),
    (day) => day.date.slice(0, 7),
  );

  const buckets: MonthlyBucket[] = [];
  for (let offset = 11; offset >= 0; offset -= 1) {
    const monthDate = new Date(end.getFullYear(), end.getMonth() - offset, 1);
    const year = monthDate.getFullYear();
    const month = `${monthDate.getMonth() + 1}`.padStart(2, '0');
    const key = `${year}-${month}`;

    buckets.push({
      key,
      label: monthLabel(monthDate),
      count: counts.get(key) ?? 0,
    });
  }

  return buckets;
}

export function PublishCalendar({ days, latestDate }: PublishCalendarProps) {
  const end = useMemo(() => parseDate(latestDate) ?? parseDate(new Date().toISOString().slice(0, 10)), [latestDate]);

  const monthlyData = useMemo(() => {
    if (!end) {
      return [];
    }

    return buildMonthlyBuckets(days, end);
  }, [days, end]);

  const totalPublished = useMemo(
    () => monthlyData.reduce((sum, item) => sum + item.count, 0),
    [monthlyData],
  );
  const activeMonths = useMemo(
    () => monthlyData.filter((item) => item.count > 0).length,
    [monthlyData],
  );
  const peakCount = useMemo(
    () => max(monthlyData, (item) => item.count) ?? 0,
    [monthlyData],
  );

  const option = useMemo<EChartsOption>(() => {
    const labels = monthlyData.map((item) => item.label);
    const values = monthlyData.map((item) => item.count);
    const backgroundValues = monthlyData.map(() => Math.max(peakCount, 1));

    return {
      animationDuration: 500,
      animationEasing: 'cubicOut',
      grid: {
        top: 18,
        right: 6,
        bottom: 4,
        left: 6,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(125, 211, 252, 0.08)',
          },
        },
        backgroundColor: 'rgba(15, 23, 42, 0.94)',
        borderWidth: 0,
        textStyle: {
          color: '#f8fafc',
          fontSize: 12,
        },
        extraCssText: 'border-radius: 12px; box-shadow: 0 12px 28px rgba(15, 23, 42, 0.22);',
        formatter(params: unknown) {
          const first = Array.isArray(params) ? params[0] : params;
          const dataIndex = typeof first === 'object' && first && 'dataIndex' in first
            ? Number(first.dataIndex)
            : -1;
          const item = dataIndex >= 0 ? monthlyData[dataIndex] : null;
          if (!item) {
            return '';
          }

          return `${item.key}<br/>${item.count} 篇`;
        },
      },
      xAxis: {
        type: 'category',
        data: labels,
        boundaryGap: true,
        axisTick: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(148, 163, 184, 0.16)',
          },
        },
        axisLabel: {
          color: '#64748b',
          fontSize: 11,
          interval: 0,
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitNumber: Math.min(4, Math.max(2, peakCount || 2)),
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 11,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(148, 163, 184, 0.1)',
          },
        },
      },
      series: [
        {
          type: 'bar',
          silent: true,
          data: backgroundValues,
          barWidth: '38%',
          barGap: '-100%',
          itemStyle: {
            color: 'rgba(148, 163, 184, 0.12)',
            borderRadius: 0,
          },
          emphasis: {
            disabled: true,
          },
          z: 1,
        },
        {
          type: 'bar',
          data: values,
          barWidth: '38%',
          itemStyle: {
            borderRadius: 0,
            color: '#3b82f6',
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              color: '#1d4ed8',
            },
          },
          z: 2,
        },
      ],
    };
  }, [monthlyData, peakCount]);

  if (!end || monthlyData.length === 0) {
    return null;
  }

  return (
    <section className={styles.calendar} aria-label="发文统计">
      <header className={styles.header}>
        <h3 className={styles.title}>发文统计</h3>
        <p className={styles.meta}>
          最近 12 个月 · {activeMonths} 个月有发布 · 共 {totalPublished} 篇
        </p>
      </header>

      <BaseEChart className={styles.chart} option={option} renderer="svg" />
    </section>
  );
}
