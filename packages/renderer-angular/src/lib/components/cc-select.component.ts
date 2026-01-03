import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'cc-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-select">
      @if (label) {
        <label class="cc-select-label">{{ label }}</label>
      }
      <select
        [value]="value"
        [disabled]="disabled"
        (change)="onChange($event)"
        class="cc-select-input"
      >
        @if (placeholder) {
          <option value="" disabled>{{ placeholder }}</option>
        }
        @for (option of options; track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
    </div>
  `,
  styles: [`
    .cc-select { display: flex; flex-direction: column; gap: 0.5rem; }
    .cc-select-label { font-weight: 500; font-size: 0.875rem; color: #374151; }
    .cc-select-input {
      padding: 0.625rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      background: white;
      cursor: pointer;
    }
    .cc-select-input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    .cc-select-input:disabled { background: #f8fafc; cursor: not-allowed; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcSelectComponent {
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

  get placeholder(): string | undefined {
    return this.component['placeholder'] as string | undefined;
  }

  get disabled(): boolean {
    return (this.component['disabled'] as boolean) ?? false;
  }

  get options(): SelectOption[] {
    const opts = this.component['options'] as Array<{ label?: string; value: string }> | undefined;
    return (opts ?? []).map(o => ({
      label: o.label ?? o.value,
      value: o.value,
    }));
  }

  onChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (this.valuePath) {
      this.inputChange.emit({ path: this.valuePath, value: target.value });
    }
  }
}
