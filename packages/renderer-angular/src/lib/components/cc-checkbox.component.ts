import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-checkbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="cc-checkbox" [class.disabled]="disabled">
      <input
        type="checkbox"
        [checked]="checked"
        [disabled]="disabled"
        (change)="onChange($event)"
      />
      <span class="cc-checkbox-label">{{ label }}</span>
    </label>
  `,
  styles: [`
    .cc-checkbox {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }
    .cc-checkbox.disabled { opacity: 0.5; cursor: not-allowed; }
    .cc-checkbox input { width: 1rem; height: 1rem; cursor: inherit; }
    .cc-checkbox-label { font-size: 0.875rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcCheckboxComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();

  get valuePath(): string | undefined {
    return this.component['valuePath'] as string | undefined;
  }

  get checked(): boolean {
    if (this.valuePath) {
      const value = getByPointer(this.dataModel, this.valuePath);
      return value === true;
    }
    return false;
  }

  get label(): string {
    return (this.component['label'] as string) ?? '';
  }

  get disabled(): boolean {
    return (this.component['disabled'] as boolean) ?? false;
  }

  onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (this.valuePath) {
      this.inputChange.emit({ path: this.valuePath, value: target.checked });
    }
  }
}
