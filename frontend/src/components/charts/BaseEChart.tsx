import { useEffect, useRef } from 'react';
import type { ECharts, EChartsOption, SetOptionOpts } from 'echarts';

interface BaseEChartProps {
  option: EChartsOption;
  className?: string;
  style?: React.CSSProperties;
  renderer?: 'canvas' | 'svg';
  setOptionOpts?: SetOptionOpts;
}

export function BaseEChart({
  option,
  className,
  style,
  renderer = 'svg',
  setOptionOpts,
}: BaseEChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ECharts | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let active = true;
    let observer: ResizeObserver | null = null;
    let resize: (() => void) | null = null;

    void import('echarts').then((echarts) => {
      if (!active) {
        return;
      }

      const chart = echarts.init(container, undefined, { renderer });
      chartRef.current = chart;
      chart.setOption(option, setOptionOpts);

      resize = () => {
        chart.resize();
      };

      observer = typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            resize?.();
          })
        : null;

      observer?.observe(container);
      window.addEventListener('resize', resize);
    });

    return () => {
      active = false;
      observer?.disconnect();
      if (resize) {
        window.removeEventListener('resize', resize);
      }
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, [renderer]);

  useEffect(() => {
    chartRef.current?.setOption(option, setOptionOpts);
  }, [option, setOptionOpts]);

  return <div ref={containerRef} className={className} style={style} />;
}
