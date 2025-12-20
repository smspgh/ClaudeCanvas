import type { ChartComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

const DEFAULT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'
];

export interface CcChartProps {
  component: ChartComponent;
  dataModel: DataModel;
}

interface ChartData {
  labels: string[];
  datasets: { label: string; data: number[]; color?: string }[];
}

export function CcChart({ component, dataModel }: CcChartProps) {
  const getData = (): ChartData => {
    if (component.data) {
      return component.data;
    }
    if (component.dataPath) {
      const data = getByPointer(dataModel, component.dataPath);
      if (data && typeof data === 'object') {
        return data as ChartData;
      }
    }
    return { labels: [], datasets: [] };
  };

  const data = getData();
  const height = component.height || 250;
  const showLegend = component.showLegend ?? true;

  const renderBarChart = () => {
    const width = 400;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const allValues = data.datasets.flatMap(d => d.data);
    const maxValue = Math.max(...allValues, 0);
    const range = maxValue || 1;

    const barGroupWidth = chartWidth / data.labels.length;
    const barWidth = (barGroupWidth * 0.8) / data.datasets.length;
    const barGap = barGroupWidth * 0.1;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%' }}>
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const y = padding.top + chartHeight * (1 - pct);
          const value = range * pct;
          return (
            <g key={pct}>
              <line className="cc-chart-grid" x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e5e7eb" strokeDasharray="2,2" />
              <text className="cc-chart-label" x={padding.left - 5} y={y + 3} textAnchor="end" fontSize="10" fill="#6b7280">{value.toFixed(0)}</text>
            </g>
          );
        })}
        {data.datasets.map((dataset, di) =>
          data.labels.map((_label, li) => {
            const value = dataset.data[li] || 0;
            const barHeight = (value / range) * chartHeight;
            const x = padding.left + barGap + li * barGroupWidth + di * barWidth;
            const y = padding.top + chartHeight - barHeight;
            const color = dataset.color || DEFAULT_COLORS[di % DEFAULT_COLORS.length];

            return (
              <rect
                key={`${di}-${li}`}
                x={x}
                y={y}
                width={barWidth - 2}
                height={barHeight}
                fill={color}
                rx={2}
              >
                <title>{dataset.label}: {value}</title>
              </rect>
            );
          })
        )}
        {data.labels.map((label, i) => {
          const x = padding.left + barGap + i * barGroupWidth + barGroupWidth / 2 - barGap;
          return (
            <text key={i} className="cc-chart-label" x={x} y={height - 10} textAnchor="middle" fontSize="10" fill="#6b7280">{label}</text>
          );
        })}
      </svg>
    );
  };

  const renderLineChart = () => {
    const width = 400;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const allValues = data.datasets.flatMap(d => d.data);
    const maxValue = Math.max(...allValues, 0);
    const minValue = Math.min(...allValues, 0);
    const range = maxValue - minValue || 1;
    const xStep = chartWidth / Math.max(data.labels.length - 1, 1);

    return (
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%' }}>
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const y = padding.top + chartHeight * (1 - pct);
          const value = minValue + range * pct;
          return (
            <g key={pct}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e5e7eb" strokeDasharray="2,2" />
              <text x={padding.left - 5} y={y + 3} textAnchor="end" fontSize="10" fill="#6b7280">{value.toFixed(0)}</text>
            </g>
          );
        })}
        {data.datasets.map((dataset, di) => {
          const color = dataset.color || DEFAULT_COLORS[di % DEFAULT_COLORS.length];
          const points = dataset.data.map((value, i) => ({
            x: padding.left + i * xStep,
            y: padding.top + chartHeight - ((value - minValue) / range) * chartHeight,
            value
          }));
          const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

          return (
            <g key={di}>
              <path d={pathD} fill="none" stroke={color} strokeWidth={2} />
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={4} fill={color}>
                  <title>{dataset.label}: {p.value}</title>
                </circle>
              ))}
            </g>
          );
        })}
        {data.labels.map((label, i) => (
          <text key={i} x={padding.left + i * xStep} y={height - 10} textAnchor="middle" fontSize="10" fill="#6b7280">{label}</text>
        ))}
      </svg>
    );
  };

  const renderPieChart = (isDoughnut: boolean) => {
    const width = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    const innerRadius = isDoughnut ? radius * 0.6 : 0;

    const values = data.datasets[0]?.data || [];
    const total = values.reduce((sum, v) => sum + v, 0) || 1;

    let currentAngle = -Math.PI / 2;

    const slices = values.map((value, i) => {
      const angle = (value / total) * Math.PI * 2;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      const ix1 = centerX + innerRadius * Math.cos(startAngle);
      const iy1 = centerY + innerRadius * Math.sin(startAngle);
      const ix2 = centerX + innerRadius * Math.cos(endAngle);
      const iy2 = centerY + innerRadius * Math.sin(endAngle);

      const largeArc = angle > Math.PI ? 1 : 0;
      const color = DEFAULT_COLORS[i % DEFAULT_COLORS.length];

      const d = isDoughnut
        ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`
        : `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      return { d, color, label: data.labels[i], value, pct: (value / total * 100).toFixed(1) };
    });

    return (
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%' }}>
        {slices.map((slice, i) => (
          <path key={i} d={slice.d} fill={slice.color}>
            <title>{slice.label}: {slice.value} ({slice.pct}%)</title>
          </path>
        ))}
      </svg>
    );
  };

  const renderLegend = () => {
    if (component.chartType === 'pie' || component.chartType === 'doughnut') {
      return (
        <div className="cc-chart-legend">
          {data.labels.map((label, i) => (
            <div key={i} className="cc-chart-legend-item">
              <div className="cc-chart-legend-color" style={{ background: DEFAULT_COLORS[i % DEFAULT_COLORS.length] }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="cc-chart-legend">
        {data.datasets.map((dataset, i) => (
          <div key={i} className="cc-chart-legend-item">
            <div className="cc-chart-legend-color" style={{ background: dataset.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }} />
            <span>{dataset.label}</span>
          </div>
        ))}
      </div>
    );
  };

  let chart;
  switch (component.chartType) {
    case 'bar': chart = renderBarChart(); break;
    case 'line': chart = renderLineChart(); break;
    case 'pie': chart = renderPieChart(false); break;
    case 'doughnut': chart = renderPieChart(true); break;
    default: chart = <div>Unknown chart type</div>;
  }

  return (
    <div className="cc-chart">
      {component.title && <div className="cc-chart-title">{component.title}</div>}
      <div className="cc-chart-container" style={{ height }}>
        {chart}
      </div>
      {showLegend && renderLegend()}
    </div>
  );
}
