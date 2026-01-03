import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-date-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-date-picker">
      @if (label) {
        <label class="cc-date-picker-label">
          {{ label }}
          @if (required) { <span class="required">*</span> }
        </label>
      }
      <input
        [type]="inputType"
        class="cc-date-picker-input"
        [value]="value"
        [min]="min"
        [max]="max"
        [disabled]="disabled"
        (change)="onChange($event)"
      />
      @if (helperText) { <div class="cc-date-picker-helper">{{ helperText }}</div> }
    </div>
  `,
  styles: [`
    .cc-date-picker { display: flex; flex-direction: column; gap: 0.25rem; }
    .cc-date-picker-label { font-size: 0.875rem; font-weight: 500; color: #374151; }
    .cc-date-picker-label .required { color: #ef4444; }
    .cc-date-picker-input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 1rem;
      font-family: inherit;
    }
    .cc-date-picker-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
    .cc-date-picker-input:disabled { background: #f3f4f6; cursor: not-allowed; }
    .cc-date-picker-helper { font-size: 0.75rem; color: #6b7280; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcDatePickerComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();

  get valuePath(): string | undefined { return this.component['valuePath'] as string; }
  get value(): string {
    if (this.valuePath) {
      const v = getByPointer(this.dataModel, this.valuePath);
      return v?.toString() ?? '';
    }
    return (this.component['value'] as string) ?? '';
  }
  get label(): string | undefined { return this.component['label'] as string; }
  get helperText(): string | undefined { return this.component['helperText'] as string; }
  get disabled(): boolean { return (this.component['disabled'] as boolean) ?? false; }
  get required(): boolean { return (this.component['required'] as boolean) ?? false; }
  get min(): string | undefined { return this.component['min'] as string; }
  get max(): string | undefined { return this.component['max'] as string; }
  get variant(): 'date' | 'time' | 'datetime' { return (this.component['variant'] as 'date' | 'time' | 'datetime') ?? 'date'; }
  get inputType(): string {
    switch (this.variant) {
      case 'time': return 'time';
      case 'datetime': return 'datetime-local';
      default: return 'date';
    }
  }

  onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (this.valuePath) {
      this.inputChange.emit({ path: this.valuePath, value: target.value });
    }
  }
}
