import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-slider">
      @if (label) {
        <div class="cc-slider-header">
          <label class="cc-slider-label">{{ label }}</label>
          @if (showValue) {
            <span class="cc-slider-value">{{ value }}</span>
          }
        </div>
      }
      <input
        type="range"
        [value]="value"
        [min]="min"
        [max]="max"
        [step]="step"
        [disabled]="disabled"
        (input)="onInput($event)"
        class="cc-slider-input"
      />
    </div>
  `,
  styles: [`
    .cc-slider { display: flex; flex-direction: column; gap: 0.5rem; }
    .cc-slider-header { display: flex; justify-content: space-between; align-items: center; }
    .cc-slider-label { font-weight: 500; font-size: 0.875rem; color: #374151; }
    .cc-slider-value { font-size: 0.875rem; color: #64748b; }
    .cc-slider-input { width: 100%; cursor: pointer; }
    .cc-slider-input:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcSliderComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();

  get valuePath(): string | undefined {
    return this.component['valuePath'] as string | undefined;
  }

  get value(): number {
    if (this.valuePath) {
      const v = getByPointer(this.dataModel, this.valuePath);
      return typeof v === 'number' ? v : this.min;
    }
    return this.min;
  }

  get label(): string | undefined {
    return this.component['label'] as string | undefined;
  }

  get min(): number {
    return (this.component['min'] as number) ?? 0;
  }

  get max(): number {
    return (this.component['max'] as number) ?? 100;
  }

  get step(): number {
    return (this.component['step'] as number) ?? 1;
  }

  get showValue(): boolean {
    return (this.component['showValue'] as boolean) ?? true;
  }

  get disabled(): boolean {
    return (this.component['disabled'] as boolean) ?? false;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (this.valuePath) {
      this.inputChange.emit({ path: this.valuePath, value: parseFloat(target.value) });
    }
  }
}
