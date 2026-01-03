import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (variant === 'circular') {
      <div class="cc-progress-circular" [style.width.px]="sizeValue" [style.height.px]="sizeValue">
        <svg viewBox="0 0 36 36">
          <path class="cc-progress-track" [style.stroke]="trackColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path class="cc-progress-fill" [style.stroke]="color" [style.stroke-dasharray]="percentage + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        </svg>
        @if (showLabel) { <span class="cc-progress-label">{{ percentage }}%</span> }
      </div>
    } @else {
      <div class="cc-progress-linear">
        @if (label || showLabel) {
          <div class="cc-progress-header">
            @if (label) { <span>{{ label }}</span> }
            @if (showLabel) { <span>{{ percentage }}%</span> }
          </div>
        }
        <div class="cc-progress-bar" [style.height.px]="barHeight" [style.background-color]="trackColor">
          <div class="cc-progress-fill-bar" [style.width.%]="percentage" [style.background-color]="color"></div>
        </div>
      </div>
    }
  `,
  styles: [`
    .cc-progress-linear { width: 100%; }
    .cc-progress-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem; }
    .cc-progress-bar { width: 100%; border-radius: 9999px; overflow: hidden; background: #e2e8f0; }
    .cc-progress-fill-bar { height: 100%; border-radius: 9999px; transition: width 0.3s; background: #6366f1; }
    .cc-progress-circular { position: relative; display: inline-flex; align-items: center; justify-content: center; }
    .cc-progress-circular svg { transform: rotate(-90deg); }
    .cc-progress-track, .cc-progress-fill { fill: none; stroke-width: 3; stroke-linecap: round; }
    .cc-progress-track { stroke: #e2e8f0; }
    .cc-progress-fill { stroke: #6366f1; transition: stroke-dasharray 0.3s; }
    .cc-progress-label { position: absolute; font-size: 0.75rem; font-weight: 600; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcProgressComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};

  get valuePath(): string | undefined { return this.component['valuePath'] as string; }
  get value(): number {
    if (this.valuePath) { const v = getByPointer(this.dataModel, this.valuePath); return typeof v === 'number' ? v : 0; }
    return (this.component['value'] as number) ?? 0;
  }
  get percentage(): number { return Math.min(100, Math.max(0, this.value)); }
  get variant(): string { return (this.component['variant'] as string) ?? 'linear'; }
  get size(): string { return (this.component['size'] as string) ?? 'medium'; }
  get sizeValue(): number { return this.size === 'small' ? 32 : this.size === 'large' ? 80 : 48; }
  get barHeight(): number { return this.size === 'small' ? 4 : this.size === 'large' ? 12 : 8; }
  get showLabel(): boolean { return (this.component['showLabel'] as boolean) ?? false; }
  get label(): string | undefined { return this.component['label'] as string; }
  get color(): string { return (this.component['color'] as string) ?? '#6366f1'; }
  get trackColor(): string { return (this.component['trackColor'] as string) ?? '#e2e8f0'; }
}
