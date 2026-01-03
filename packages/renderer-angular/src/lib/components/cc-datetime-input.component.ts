import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-datetime-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-datetime">
      @if (label) { <label class="cc-datetime-label">{{ label }}</label> }
      <input [type]="inputType" [value]="value" [disabled]="disabled" [min]="minDate" [max]="maxDate" (change)="onChange($event)" class="cc-datetime-input" />
    </div>
  `,
  styles: [`
    .cc-datetime { display: flex; flex-direction: column; gap: 0.5rem; }
    .cc-datetime-label { font-weight: 500; font-size: 0.875rem; color: #374151; }
    .cc-datetime-input { padding: 0.625rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 0.875rem; }
    .cc-datetime-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcDateTimeInputComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();

  get valuePath(): string | undefined { return this.component['valuePath'] as string; }
  get value(): string { return this.valuePath ? (getByPointer(this.dataModel, this.valuePath) as string) ?? '' : ''; }
  get label(): string | undefined { return this.component['label'] as string; }
  get enableDate(): boolean { return (this.component['enableDate'] as boolean) ?? true; }
  get enableTime(): boolean { return (this.component['enableTime'] as boolean) ?? false; }
  get disabled(): boolean { return (this.component['disabled'] as boolean) ?? false; }
  get minDate(): string | undefined { return this.component['minDate'] as string; }
  get maxDate(): string | undefined { return this.component['maxDate'] as string; }
  get inputType(): string { return this.enableDate && this.enableTime ? 'datetime-local' : this.enableTime ? 'time' : 'date'; }

  onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (this.valuePath) { this.inputChange.emit({ path: this.valuePath, value: target.value }); }
  }
}
