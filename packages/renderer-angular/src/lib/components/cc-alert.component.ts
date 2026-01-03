import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen && !dismissed) {
      <div class="cc-alert" [class]="variantClass">
        @if (showIcon) { <span class="cc-alert-icon">{{ icon }}</span> }
        <div class="cc-alert-content">
          @if (title) { <div class="cc-alert-title">{{ title }}</div> }
          @if (message) { <div class="cc-alert-message">{{ message }}</div> }
        </div>
        @if (dismissible) { <button class="cc-alert-close" (click)="dismiss()">×</button> }
      </div>
    }
  `,
  styles: [`
    .cc-alert { display: flex; gap: 0.75rem; padding: 1rem; border-radius: 0.5rem; border: 1px solid; }
    .cc-alert-info { background: #dbeafe; border-color: #93c5fd; color: #1e40af; }
    .cc-alert-success { background: #dcfce7; border-color: #86efac; color: #166534; }
    .cc-alert-warning { background: #fef3c7; border-color: #fcd34d; color: #92400e; }
    .cc-alert-error { background: #fee2e2; border-color: #fca5a5; color: #b91c1c; }
    .cc-alert-icon { font-size: 1.25rem; }
    .cc-alert-content { flex: 1; }
    .cc-alert-title { font-weight: 600; margin-bottom: 0.25rem; }
    .cc-alert-close { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: inherit; opacity: 0.7; align-self: flex-start; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcAlertComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();

  dismissed = false;

  get openPath(): string | undefined { return this.component['openPath'] as string; }
  get isOpen(): boolean { return this.openPath ? getByPointer(this.dataModel, this.openPath) !== false : true; }
  get message(): string {
    if (this.component['messagePath']) return getByPointer(this.dataModel, this.component['messagePath'] as string)?.toString() ?? '';
    return (this.component['message'] as string) ?? '';
  }
  get title(): string | undefined { return this.component['title'] as string; }
  get variant(): string { return (this.component['variant'] as string) ?? 'info'; }
  get variantClass(): string { return `cc-alert-${this.variant}`; }
  get showIcon(): boolean { return (this.component['showIcon'] as boolean) ?? true; }
  get dismissible(): boolean { return (this.component['dismissible'] as boolean) ?? false; }
  get icon(): string {
    const icons: Record<string, string> = { info: 'ℹ', success: '✓', warning: '⚠', error: '✕' };
    return icons[this.variant] ?? 'ℹ';
  }

  dismiss(): void {
    this.dismissed = true;
    if (this.openPath) { this.inputChange.emit({ path: this.openPath, value: false }); }
  }
}
