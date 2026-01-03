import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel, Action } from '../types';

@Component({
  selector: 'cc-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="buttonClass"
      [disabled]="disabled || loading"
      (click)="onClick()"
    >
      @if (loading) {
        <span class="cc-button-spinner"></span>
      } @else {
        @if (icon) {
          <span class="cc-button-icon">{{ icon }}</span>
        }
        {{ label }}
      }
    </button>
  `,
  styles: [`
    button {
      padding: 0.625rem 1.25rem;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.15s;
    }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .cc-button-primary { background: #6366f1; color: white; }
    .cc-button-primary:hover:not(:disabled) { background: #4f46e5; }
    .cc-button-secondary { background: #e2e8f0; color: #1e293b; }
    .cc-button-secondary:hover:not(:disabled) { background: #cbd5e1; }
    .cc-button-outline { background: transparent; border-color: #e2e8f0; color: #1e293b; }
    .cc-button-outline:hover:not(:disabled) { background: #f8fafc; }
    .cc-button-ghost { background: transparent; color: #1e293b; }
    .cc-button-ghost:hover:not(:disabled) { background: #f1f5f9; }
    .cc-button-danger { background: #ef4444; color: white; }
    .cc-button-danger:hover:not(:disabled) { background: #dc2626; }
    .cc-button-spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcButtonComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() action = new EventEmitter<Action>();

  get label(): string {
    return (this.component['label'] as string) ?? '';
  }

  get variant(): string {
    return (this.component['variant'] as string) ?? 'primary';
  }

  get disabled(): boolean {
    return (this.component['disabled'] as boolean) ?? false;
  }

  get loading(): boolean {
    return (this.component['loading'] as boolean) ?? false;
  }

  get icon(): string | undefined {
    return this.component['icon'] as string | undefined;
  }

  get buttonClass(): string {
    return `cc-button-${this.variant}`;
  }

  onClick(): void {
    const actionData = this.component['action'] as Action | undefined;
    if (actionData) {
      this.action.emit(actionData);
    }
  }
}
