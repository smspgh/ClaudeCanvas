import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel, Action } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen && !dismissed) {
      <div class="cc-toast" [class]="variantClass">
        <span class="cc-toast-icon">{{ icon }}</span>
        <span class="cc-toast-message">{{ message }}</span>
        @if (actionLabel) { <button class="cc-toast-action" (click)="onAction()">{{ actionLabel }}</button> }
        @if (dismissible) { <button class="cc-toast-close" (click)="dismiss()">×</button> }
      </div>
    }
  `,
  styles: [`
    .cc-toast { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 0.5rem; margin: 0.5rem 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .cc-toast-info { background: #dbeafe; color: #1e40af; }
    .cc-toast-success { background: #dcfce7; color: #166534; }
    .cc-toast-warning { background: #fef3c7; color: #92400e; }
    .cc-toast-error { background: #fee2e2; color: #b91c1c; }
    .cc-toast-message { flex: 1; }
    .cc-toast-action { background: none; border: none; font-weight: 600; cursor: pointer; color: inherit; text-decoration: underline; }
    .cc-toast-close { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: inherit; opacity: 0.7; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcToastComponent implements OnInit, OnDestroy {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();
  @Output() action = new EventEmitter<Action>();

  dismissed = false;
  private timeoutId?: ReturnType<typeof setTimeout>;

  get openPath(): string | undefined { return this.component['openPath'] as string; }
  get isOpen(): boolean { return this.openPath ? getByPointer(this.dataModel, this.openPath) === true : true; }
  get message(): string {
    if (this.component['messagePath']) return getByPointer(this.dataModel, this.component['messagePath'] as string)?.toString() ?? '';
    return (this.component['message'] as string) ?? '';
  }
  get variant(): string { return (this.component['variant'] as string) ?? 'info'; }
  get variantClass(): string { return `cc-toast-${this.variant}`; }
  get dismissible(): boolean { return (this.component['dismissible'] as boolean) ?? true; }
  get duration(): number { return (this.component['duration'] as number) ?? 5000; }
  get actionLabel(): string | undefined { return this.component['actionLabel'] as string; }
  get icon(): string {
    const icons: Record<string, string> = { info: 'ℹ', success: '✓', warning: '⚠', error: '✕' };
    return icons[this.variant] ?? 'ℹ';
  }

  ngOnInit(): void {
    if (this.duration > 0) { this.timeoutId = setTimeout(() => this.dismiss(), this.duration); }
  }

  ngOnDestroy(): void { if (this.timeoutId) clearTimeout(this.timeoutId); }

  dismiss(): void {
    this.dismissed = true;
    if (this.openPath) { this.inputChange.emit({ path: this.openPath, value: false }); }
  }

  onAction(): void {
    const actionData = this.component['action'] as Action | undefined;
    if (actionData) { this.action.emit(actionData); }
  }
}
