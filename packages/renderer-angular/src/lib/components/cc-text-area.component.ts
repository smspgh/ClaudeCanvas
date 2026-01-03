import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-text-area',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cc-text-area">
      @if (label) {
        <label class="cc-text-area-label">
          {{ label }}
          @if (required) { <span class="required">*</span> }
        </label>
      }
      <textarea
        class="cc-text-area-input"
        [value]="value"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [readonly]="readonly"
        [rows]="rows"
        [attr.maxlength]="maxLength"
        (input)="onInput($event)"
        (blur)="onBlur()">
      </textarea>
      @if (helperText) { <div class="cc-text-area-helper">{{ helperText }}</div> }
      @if (showCharCount && maxLength) {
        <div class="cc-text-area-count">{{ value.length }} / {{ maxLength }}</div>
      }
    </div>
  `,
  styles: [`
    .cc-text-area { display: flex; flex-direction: column; gap: 0.25rem; }
    .cc-text-area-label { font-size: 0.875rem; font-weight: 500; color: #374151; }
    .cc-text-area-label .required { color: #ef4444; }
    .cc-text-area-input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 1rem;
      font-family: inherit;
      resize: vertical;
      min-height: 80px;
    }
    .cc-text-area-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
    .cc-text-area-input:disabled { background: #f3f4f6; cursor: not-allowed; }
    .cc-text-area-helper { font-size: 0.75rem; color: #6b7280; }
    .cc-text-area-count { font-size: 0.75rem; color: #9ca3af; text-align: right; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcTextAreaComponent {
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
  get placeholder(): string { return (this.component['placeholder'] as string) ?? ''; }
  get helperText(): string | undefined { return this.component['helperText'] as string; }
  get disabled(): boolean { return (this.component['disabled'] as boolean) ?? false; }
  get readonly(): boolean { return (this.component['readonly'] as boolean) ?? false; }
  get required(): boolean { return (this.component['required'] as boolean) ?? false; }
  get rows(): number { return (this.component['rows'] as number) ?? 4; }
  get maxLength(): number | undefined { return this.component['maxLength'] as number; }
  get showCharCount(): boolean { return (this.component['showCharCount'] as boolean) ?? false; }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    if (this.valuePath) {
      this.inputChange.emit({ path: this.valuePath, value: target.value });
    }
  }

  onBlur(): void {
    // Validation could be triggered here
  }
}
