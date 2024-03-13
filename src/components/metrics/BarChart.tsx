import { useState, useRef, useEffect, useCallback } from 'react';
import { Loading } from 'react-basics';
import classNames from 'classnames';
import Chart from 'chart.js/auto';
import HoverTooltip from 'components/common/HoverTooltip';
import Legend from 'components/metrics/Legend';
import { useLocale } from 'components/hooks';
import { useTheme } from 'components/hooks';
import { DEFAULT_ANIMATION_DURATION } from 'lib/constants';
import { renderNumberLabels } from 'lib/charts';
import styles from './BarChart.module.css';

export interface BarChartProps {
  datasets?: any[];
  unit?: string;
  animationDuration?: number;
  stacked?: boolean;
  isLoading?: boolean;
  renderXLabel?: (label: string, index: number, values: any[]) => string;
  renderYLabel?: (label: string, index: number, values: any[]) => string;
  XAxisType?: string;
  YAxisType?: string;
  renderTooltipPopup?: (setTooltipPopup: (data: any) => void, model: any) => void;
  updateMode?: string;
  onCreate?: (chart: any) => void;
  onUpdate?: (chart: any) => void;
  className?: string;
}

export function BarChart({
  datasets = [],
  unit,
  animationDuration = DEFAULT_ANIMATION_DURATION,
  stacked = false,
  isLoading = false,
  renderXLabel,
  renderYLabel,
  XAxisType = 'time',
  YAxisType = 'linear',
  renderTooltipPopup,
  updateMode,
  onCreate,
  onUpdate,
  className,
}: BarChartProps) {
  const canvas = useRef();
  const chart = useRef(null);
  const [tooltip, setTooltipPopup] = useState(null);
  const { locale } = useLocale();
  const { theme, colors } = useTheme();
  const [legendItems, setLegendItems] = useState([]);

  const getOptions = useCallback(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: animationDuration,
        resize: {
          duration: 0,
        },
        active: {
          duration: 0,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
          external: renderTooltipPopup ? renderTooltipPopup.bind(null, setTooltipPopup) : undefined,
        },
      },
      scales: {
        x: {
          type: XAxisType,
          stacked: true,
          time: {
            unit,
          },
          grid: {
            display: false,
          },
          border: {
            color: colors.chart.line,
          },
          ticks: {
            color: colors.chart.text,
            autoSkip: false,
            maxRotation: 0,
            callback: renderXLabel,
          },
        },
        y: {
          type: YAxisType,
          min: 0,
          beginAtZero: true,
          stacked,
          grid: {
            color: colors.chart.line,
          },
          border: {
            color: colors.chart.line,
          },
          ticks: {
            color: colors.chart.text,
            callback: renderYLabel || renderNumberLabels,
          },
        },
      },
    };
  }, [
    animationDuration,
    renderTooltipPopup,
    renderXLabel,
    XAxisType,
    YAxisType,
    stacked,
    colors,
    unit,
    locale,
  ]);

  const createChart = (datasets: any[]) => {
    Chart.defaults.font.family = 'Inter';

    chart.current = new Chart(canvas.current, {
      type: 'bar',
      data: {
        datasets,
      },
      options: getOptions() as any,
    });

    onCreate?.(chart.current);

    setLegendItems(chart.current.legend.legendItems);
  };

  const updateChart = (datasets: any[]) => {
    setTooltipPopup(null);

    chart.current.data.datasets.forEach((dataset: { data: any }, index: string | number) => {
      dataset.data = datasets[index]?.data;
    });

    chart.current.options = getOptions();

    // Allow config changes before update
    onUpdate?.(chart.current);

    chart.current.update(updateMode);

    setLegendItems(chart.current.legend.legendItems);
  };

  useEffect(() => {
    if (datasets) {
      if (!chart.current) {
        createChart(datasets);
      } else {
        updateChart(datasets);
      }
    }
  }, [datasets, unit, theme, animationDuration, locale]);

  const handleLegendClick = (index: number) => {
    const meta = chart.current.getDatasetMeta(index);

    meta.hidden = meta.hidden === null ? !chart.current.data.datasets[index].hidden : null;

    chart.current.update();
  };

  return (
    <>
      <div className={classNames(styles.chart, className)}>
        {isLoading && <Loading position="page" icon="dots" />}
        <canvas ref={canvas} />
      </div>
      <Legend items={legendItems} onClick={handleLegendClick} />
      {tooltip && (
        <HoverTooltip>
          <div className={styles.tooltip}>{tooltip}</div>
        </HoverTooltip>
      )}
    </>
  );
}

export default BarChart;
