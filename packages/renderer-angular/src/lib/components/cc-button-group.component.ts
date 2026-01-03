import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel, Action } from '../types';

interface ButtonOption {
  label: string;
  value?: string;
  action?: Action;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
}

@Component({
  selector: 'cc-button-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-button-group" [class]="orientationClass">
      @for (button of buttons; track button.label) {
        <button
          class="cc-button-group-item"
          [class]="getButtonClass(button)"
          [disabled]="button.disabled"
          (click)="onClick(button)">
          {{ button.label }}
        </button>
      }
    </div>
  `,
  styles: [`
    .cc-button-group { display: inline-flex; }
    .cc-button-group.horizontal { flex-direction: row; }
    .cc-button-group.vertical { flex-direction: column; }
    .cc-button-group-item {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .cc-button-group.horizontal .cc-button-group-item:first-child { border-radius: 0.375rem 0 0 0.375rem; }
    .cc-button-group.horizontal .cc-button-group-item:last-child { border-radius: 0 0.375rem 0.375rem 0; }
    .cc-button-group.horizontal .cc-button-group-item:not(:last-child) { border-right: none; }
    .cc-button-group.vertical .cc-button-group-item:first-child { border-radius: 0.375rem 0.375rem 0 0; }
    .cc-button-group.vertical .cc-button-group-item:last-child { border-radius: 0 0 0.375rem 0.375rem; }
    .cc-button-group.vertical .cc-button-group-item:not(:last-child) { border-bottom: none; }
    .cc-button-group-item.primary { background: #6366f1; color: white; border-color: #6366f1; }
    .cc-button-group-item.secondary { background: #f3f4f6; color: #374151; }
    .cc-button-group-item.outline { background: white; color: #374151; }
    .cc-button-group-item.ghost { background: transparent; border-color: transparent; color: #374151; }
    .cc-button-group-item:hover:not(:disabled) { opacity: 0.9; }
    .cc-button-group-item:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcButtonGroupComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() action = new EventEmitter<Action>();

  get buttons(): ButtonOption[] {
    return (this.component['buttons'] as ButtonOption[]) ?? [];
  }
  get orientation(): 'horizontal' | 'vertical' {
    return (this.component['orientation'] as 'horizontal' | 'vertical') ?? 'horizontal';
  }
  get orientationClass(): string { return this.orientation; }

  getButtonClass(button: ButtonOption): string {
    return button.variant ?? 'secondary';
  }

  onClick(button: ButtonOption): void {
    if (button.action) {
      this.action.emit(button.action);
    }
  }
}
