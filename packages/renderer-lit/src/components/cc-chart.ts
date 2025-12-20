import { LitElement, html, css, svg } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ChartComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

const DEFAULT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'
];

@customElement('cc-chart')
export class CcChart extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .chart-wrapper {
      display: block;
    }

    .chart-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--cc-text, #333);
      margin-bottom: 0.75rem;
    }

    .chart-container {
      position: relative;
      overflow: hidden;
    }

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 0.75rem;
      justify-content: center;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      color: var(--cc-text-secondary, #666);
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .bar {
      transition: opacity 0.2s;
    }

    .bar:hover {
      opacity: 0.8;
    }

    .line-point {
      transition: r 0.2s;
    }

    .line-point:hover {
      r: 6;
    }

    .pie-slice {
      transition: transform 0.2s;
      transform-origin: center;
    }

    .pie-slice:hover {
      transform: scale(1.02);
    }

    .axis-label {
      font-size: 0.625rem;
      fill: var(--cc-text-secondary, #666);
    }

    .grid-line {
      stroke: var(--cc-border, #e5e7eb);
      stroke-dasharray: 2, 2;
    }
  `;

  @property({ type: Object })
  component!: ChartComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  private getData() {
    if (this.component.data) {
      return this.component.data;
    }
    if (this.component.dataPath) {
      const data = getByPointer(this.dataModel, this.component.dataPath);
      if (data && typeof data === 'object') {
        return data as { labels: string[]; datasets: { label: string; data: number[]; color?: string }[] };
      }
    }
    return { labels: [], datasets: [] };
  }

  private renderBarChart(data: { labels: string[]; datasets: { label: string; data: number[]; color?: string }[] }, height: number) {
    const width = 400;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const allValues = data.datasets.flatMap(d => d.data);
    const maxValue = Math.max(...allValues, 0);
    const minValue = Math.min(...allValues, 0);
    const range = maxValue - minValue || 1;

    const barGroupWidth = chartWidth / data.labels.length;
    const barWidth = (barGroupWidth * 0.8) / data.datasets.length;
    const barGap = barGroupWidth * 0.1;

    return svg`
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
        <!-- Grid lines -->
        ${[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const y = padding.top + chartHeight * (1 - pct);
          const value = minValue + range * pct;
          return svg`
            <line class="grid-line" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" />
            <text class="axis-label" x="${padding.left - 5}" y="${y + 3}" text-anchor="end">${value.toFixed(0)}</text>
          `;
        })}

        <!-- Bars -->
        ${data.datasets.map((dataset, di) =>
          data.labels.map((label, li) => {
            const value = dataset.data[li] || 0;
            const barHeight = (value / range) * chartHeight;
            const x = padding.left + barGap + li * barGroupWidth + di * barWidth;
            const y = padding.top + chartHeight - barHeight;
            const color = dataset.color || DEFAULT_COLORS[di % DEFAULT_COLORS.length];

            return svg`
              <rect
                class="bar"
                x="${x}"
                y="${y}"
                width="${barWidth - 2}"
                height="${barHeight}"
                fill="${color}"
                rx="2"
              >
                <title>${dataset.label}: ${value}</title>
              </rect>
            `;
          })
        )}

        <!-- X-axis labels -->
        ${data.labels.map((label, i) => {
          const x = padding.left + barGap + i * barGroupWidth + barGroupWidth / 2 - barGap;
          return svg`
            <text class="axis-label" x="${x}" y="${height - 10}" text-anchor="middle">${label}</text>
          `;
        })}
      </svg>
    `;
  }

  private renderLineChart(data: { labels: string[]; datasets: { label: string; data: number[]; color?: string }[] }, height: number) {
    const width = 400;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const allValues = data.datasets.flatMap(d => d.data);
    const maxValue = Math.max(...allValues, 0);
    const minValue = Math.min(...allValues, 0);
    const range = maxValue - minValue || 1;

    const xStep = chartWidth / Math.max(data.labels.length - 1, 1);

    return svg`
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
        <!-- Grid lines -->
        ${[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const y = padding.top + chartHeight * (1 - pct);
          const value = minValue + range * pct;
          return svg`
            <line class="grid-line" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" />
            <text class="axis-label" x="${padding.left - 5}" y="${y + 3}" text-anchor="end">${value.toFixed(0)}</text>
          `;
        })}

        <!-- Lines and points -->
        ${data.datasets.map((dataset, di) => {
          const color = dataset.color || DEFAULT_COLORS[di % DEFAULT_COLORS.length];
          const points = dataset.data.map((value, i) => {
            const x = padding.left + i * xStep;
            const y = padding.top + chartHeight - ((value - minValue) / range) * chartHeight;
            return { x, y, value };
          });

          const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

          return svg`
            <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2" />
            ${points.map(p => svg`
              <circle class="line-point" cx="${p.x}" cy="${p.y}" r="4" fill="${color}">
                <title>${dataset.label}: ${p.value}</title>
              </circle>
            `)}
          `;
        })}

        <!-- X-axis labels -->
        ${data.labels.map((label, i) => {
          const x = padding.left + i * xStep;
          return svg`
            <text class="axis-label" x="${x}" y="${height - 10}" text-anchor="middle">${label}</text>
          `;
        })}
      </svg>
    `;
  }

  private renderPieChart(data: { labels: string[]; datasets: { label: string; data: number[]; color?: string }[] }, height: number, isDoughnut: boolean) {
    const width = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    const innerRadius = isDoughnut ? radius * 0.6 : 0;

    // Use first dataset for pie/doughnut
    const values = data.datasets[0]?.data || [];
    const total = values.reduce((sum, v) => sum + v, 0) || 1;

    let currentAngle = -Math.PI / 2; // Start at top

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

      return { d, color, label: data.labels[i], value };
    });

    return svg`
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
        ${slices.map(slice => svg`
          <path class="pie-slice" d="${slice.d}" fill="${slice.color}">
            <title>${slice.label}: ${slice.value} (${((slice.value / total) * 100).toFixed(1)}%)</title>
          </path>
        `)}
      </svg>
    `;
  }

  private renderLegend(data: { labels: string[]; datasets: { label: string; data: number[]; color?: string }[] }) {
    if (this.component.chartType === 'pie' || this.component.chartType === 'doughnut') {
      return html`
        <div class="legend">
          ${data.labels.map((label, i) => html`
            <div class="legend-item">
              <div class="legend-color" style="background: ${DEFAULT_COLORS[i % DEFAULT_COLORS.length]}"></div>
              <span>${label}</span>
            </div>
          `)}
        </div>
      `;
    }

    return html`
      <div class="legend">
        ${data.datasets.map((dataset, i) => html`
          <div class="legend-item">
            <div class="legend-color" style="background: ${dataset.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}"></div>
            <span>${dataset.label}</span>
          </div>
        `)}
      </div>
    `;
  }

  render() {
    const data = this.getData();
    const height = this.component.height || 250;
    const showLegend = this.component.showLegend ?? true;

    let chart;
    switch (this.component.chartType) {
      case 'bar':
        chart = this.renderBarChart(data, height);
        break;
      case 'line':
        chart = this.renderLineChart(data, height);
        break;
      case 'pie':
        chart = this.renderPieChart(data, height, false);
        break;
      case 'doughnut':
        chart = this.renderPieChart(data, height, true);
        break;
      default:
        chart = html`<div>Unknown chart type</div>`;
    }

    return html`
      <div class="chart-wrapper">
        ${this.component.title ? html`<div class="chart-title">${this.component.title}</div>` : null}
        <div class="chart-container" style="height: ${height}px">
          ${chart}
        </div>
        ${showLegend ? this.renderLegend(data) : null}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-chart': CcChart;
  }
}
