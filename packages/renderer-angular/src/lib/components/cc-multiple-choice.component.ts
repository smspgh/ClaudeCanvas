import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-multiple-choice',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-multiple-choice">
      @if (label) { <label class="cc-mc-label">{{ label }}</label> }
      <div class="cc-mc-options">
        @for (option of options; track option.value) {
          <button class="cc-mc-option" [class.selected]="isSelected(option.value)" [disabled]="disabled || (!isSelected(option.value) && atMaxSelections)" (click)="toggle(option.value)">
            {{ option.label }}
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .cc-multiple-choice { display: flex; flex-direction: column; gap: 0.75rem; }
    .cc-mc-label { font-weight: 500; font-size: 0.875rem; color: #374151; }
    .cc-mc-options { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .cc-mc-option { padding: 0.5rem 1rem; border: 1px solid #e2e8f0; border-radius: 9999px; background: white; cursor: pointer; font-size: 0.875rem; transition: all 0.15s; }
    .cc-mc-option:hover:not(:disabled) { border-color: #6366f1; }
    .cc-mc-option.selected { background: #6366f1; color: white; border-color: #6366f1; }
    .cc-mc-option:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcMultipleChoiceComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();

  get valuePath(): string | undefined { return this.component['valuePath'] as string; }
  get selectedValues(): string[] {
    if (!this.valuePath) return [];
    const v = getByPointer(this.dataModel, this.valuePath);
    return Array.isArray(v) ? v.map(x => x.toString()) : [];
  }
  get label(): string | undefined { return this.component['label'] as string; }
  get options(): Array<{ label: string; value: string }> { return (this.component['options'] as any[]) ?? []; }
  get maxSelections(): number | undefined { return this.component['maxSelections'] as number; }
  get disabled(): boolean { return (this.component['disabled'] as boolean) ?? false; }
  get atMaxSelections(): boolean { return this.maxSelections !== undefined && this.selectedValues.length >= this.maxSelections; }

  isSelected(value: string): boolean { return this.selectedValues.includes(value); }

  toggle(value: string): void {
    if (!this.valuePath) return;
    const newValues = this.isSelected(value)
      ? this.selectedValues.filter(v => v !== value)
      : [...this.selectedValues, value];
    this.inputChange.emit({ path: this.valuePath, value: newValues });
  }
}
