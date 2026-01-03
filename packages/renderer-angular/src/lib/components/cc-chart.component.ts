import { Component, Input, ChangeDetectionStrategy, ElementRef, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

interface ChartData { labels: string[]; datasets: Array<{ label: string; data: number[]; color?: string }>; }

@Component({
  selector: 'cc-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-chart">
      @if (title) { <div class="cc-chart-title">{{ title }}</div> }
      <canvas #chartCanvas [style.height.px]="height"></canvas>
      @if (showLegend && chartData?.datasets) {
        <div class="cc-chart-legend">
          @for (ds of chartData.datasets; track ds.label) {
            <div class="cc-chart-legend-item">
              <span class="cc-chart-legend-color" [style.background-color]="ds.color || '#6366f1'"></span>
              <span>{{ ds.label }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .cc-chart { width: 100%; }
    .cc-chart-title { font-weight: 600; margin-bottom: 1rem; }
    .cc-chart canvas { width: 100%; }
    .cc-chart-legend { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem; justify-content: center; }
    .cc-chart-legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
    .cc-chart-legend-color { width: 0.75rem; height: 0.75rem; border-radius: 0.125rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcChartComponent implements AfterViewInit, OnChanges {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  get chartType(): string { return (this.component['chartType'] as string) ?? 'bar'; }
  get title(): string | undefined { return this.component['title'] as string; }
  get showLegend(): boolean { return (this.component['showLegend'] as boolean) ?? true; }
  get height(): number { return (this.component['height'] as number) ?? 300; }

  get chartData(): ChartData | undefined {
    if (this.component['dataPath']) {
      return getByPointer(this.dataModel, this.component['dataPath'] as string) as ChartData;
    }
    return this.component['data'] as ChartData;
  }

  ngAfterViewInit(): void { this.renderChart(); }
  ngOnChanges(): void { if (this.canvasRef) this.renderChart(); }

  private renderChart(): void {
    if (!this.canvasRef || !this.chartData) return;
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Simple canvas-based chart rendering (for production, use Chart.js or similar)
    const canvas = this.canvasRef.nativeElement;
    const { width } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = this.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#64748b';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.chartType.toUpperCase()} Chart - ${this.chartData.labels.length} data points`, canvas.width / 2, canvas.height / 2);
    ctx.fillText('(Install Chart.js for full rendering)', canvas.width / 2, canvas.height / 2 + 20);
  }
}
