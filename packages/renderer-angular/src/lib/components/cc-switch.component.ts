import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-switch',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="cc-switch" [class.disabled]="disabled">
      <input
        type="checkbox"
        [checked]="checked"
        [disabled]="disabled"
        (change)="onToggle()"
      />
      <span class="cc-switch-track" [class.checked]="checked">
        <span class="cc-switch-thumb"></span>
      </span>
      @if (label) {
        <span class="cc-switch-label">{{ label }}</span>
      }
    </label>
  `,
  styles: [`
    .cc-switch {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }
    .cc-switch.disabled { opacity: 0.5; cursor: not-allowed; }
    .cc-switch input { position: absolute; opacity: 0; width: 0; height: 0; }
    .cc-switch-track {
      width: 2.75rem;
      height: 1.5rem;
      background: #d1d5db;
      border-radius: 9999px;
      position: relative;
      transition: background 0.2s;
    }
    .cc-switch-track.checked { background: #6366f1; }
    .cc-switch-thumb {
      position: absolute;
      top: 0.125rem;
      left: 0.125rem;
      width: 1.25rem;
      height: 1.25rem;
      background: white;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s;
    }
    .cc-switch-track.checked .cc-switch-thumb { transform: translateX(1.25rem); }
    .cc-switch input:focus + .cc-switch-track { box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
    .cc-switch-label { font-size: 0.875rem; color: #374151; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcSwitchComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();

  get valuePath(): string | undefined { return this.component['valuePath'] as string; }
  get checked(): boolean {
    if (this.valuePath) {
      return getByPointer(this.dataModel, this.valuePath) === true;
    }
    return (this.component['checked'] as boolean) ?? false;
  }
  get label(): string | undefined { return this.component['label'] as string; }
  get disabled(): boolean { return (this.component['disabled'] as boolean) ?? false; }

  onToggle(): void {
    if (this.valuePath && !this.disabled) {
      this.inputChange.emit({ path: this.valuePath, value: !this.checked });
    }
  }
}
