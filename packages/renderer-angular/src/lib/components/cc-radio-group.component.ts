import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'cc-radio-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-radio-group" [class.horizontal]="orientation === 'horizontal'">
      @if (label) {
        <div class="cc-radio-group-label">
          {{ label }}
          @if (required) { <span class="required">*</span> }
        </div>
      }
      <div class="cc-radio-options">
        @for (option of options; track option.value) {
          <label class="cc-radio-option" [class.disabled]="option.disabled || disabled">
            <input
              type="radio"
              [name]="name"
              [value]="option.value"
              [checked]="value === option.value"
              [disabled]="option.disabled || disabled"
              (change)="onSelect(option.value)"
            />
            <span class="cc-radio-custom"></span>
            <span class="cc-radio-label">{{ option.label }}</span>
          </label>
        }
      </div>
      @if (helperText) { <div class="cc-radio-helper">{{ helperText }}</div> }
    </div>
  `,
  styles: [`
    .cc-radio-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .cc-radio-group-label { font-size: 0.875rem; font-weight: 500; color: #374151; }
    .cc-radio-group-label .required { color: #ef4444; }
    .cc-radio-options { display: flex; flex-direction: column; gap: 0.5rem; }
    .cc-radio-group.horizontal .cc-radio-options { flex-direction: row; flex-wrap: wrap; gap: 1rem; }
    .cc-radio-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .cc-radio-option.disabled { opacity: 0.5; cursor: not-allowed; }
    .cc-radio-option input { position: absolute; opacity: 0; width: 0; height: 0; }
    .cc-radio-custom {
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid #d1d5db;
      border-radius: 50%;
      transition: all 0.2s;
      position: relative;
    }
    .cc-radio-option input:checked + .cc-radio-custom {
      border-color: #6366f1;
    }
    .cc-radio-option input:checked + .cc-radio-custom::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 0.625rem;
      height: 0.625rem;
      background: #6366f1;
      border-radius: 50%;
    }
    .cc-radio-option input:focus + .cc-radio-custom { box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
    .cc-radio-helper { font-size: 0.75rem; color: #6b7280; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcRadioGroupComponent {
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
  get options(): RadioOption[] {
    return (this.component['options'] as RadioOption[]) ?? [];
  }
  get label(): string | undefined { return this.component['label'] as string; }
  get name(): string { return (this.component['name'] as string) ?? `radio-${Math.random().toString(36).substr(2, 9)}`; }
  get helperText(): string | undefined { return this.component['helperText'] as string; }
  get disabled(): boolean { return (this.component['disabled'] as boolean) ?? false; }
  get required(): boolean { return (this.component['required'] as boolean) ?? false; }
  get orientation(): 'horizontal' | 'vertical' { return (this.component['orientation'] as 'horizontal' | 'vertical') ?? 'vertical'; }

  onSelect(value: string): void {
    if (this.valuePath) {
      this.inputChange.emit({ path: this.valuePath, value });
    }
  }
}
