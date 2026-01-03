import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-text-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cc-text-field">
      @if (label) {
        <label class="cc-text-field-label">{{ label }}{{ required ? ' *' : '' }}</label>
      }
      @if (multiline) {
        <textarea
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [rows]="rows"
          (input)="onInput($event)"
          class="cc-text-field-input"
        ></textarea>
      } @else {
        <input
          [type]="inputType"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          (input)="onInput($event)"
          class="cc-text-field-input"
        />
      }
    </div>
  `,
  styles: [`
    .cc-text-field { display: flex; flex-direction: column; gap: 0.5rem; }
    .cc-text-field-label { font-weight: 500; font-size: 0.875rem; color: #374151; }
    .cc-text-field-input {
      padding: 0.625rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-family: inherit;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .cc-text-field-input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    .cc-text-field-input:disabled { background: #f8fafc; cursor: not-allowed; }
    textarea { resize: vertical; min-height: 5rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcTextFieldComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();

  get valuePath(): string | undefined {
    return this.component['valuePath'] as string | undefined;
  }

  get value(): string {
    if (this.valuePath) {
      const v = getByPointer(this.dataModel, this.valuePath);
      return v?.toString() ?? '';
    }
    return '';
  }

  get label(): string | undefined {
    return this.component['label'] as string | undefined;
  }

  get placeholder(): string {
    return (this.component['placeholder'] as string) ?? '';
  }

  get inputType(): string {
    return (this.component['inputType'] as string) ?? 'text';
  }

  get multiline(): boolean {
    return (this.component['multiline'] as boolean) ?? false;
  }

  get rows(): number {
    return (this.component['rows'] as number) ?? 3;
  }

  get required(): boolean {
    return (this.component['required'] as boolean) ?? false;
  }

  get disabled(): boolean {
    return (this.component['disabled'] as boolean) ?? false;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    if (this.valuePath) {
      this.inputChange.emit({ path: this.valuePath, value: target.value });
    }
  }
}
