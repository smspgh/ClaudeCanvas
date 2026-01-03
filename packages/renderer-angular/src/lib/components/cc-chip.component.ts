import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel, Action } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="cc-chip"
      [class]="chipClasses"
      [class.selected]="selected"
      [class.clickable]="selectable"
      (click)="onClick()">
      @if (avatar) { <span class="cc-chip-avatar">{{ avatar }}</span> }
      @if (icon) { <span class="cc-chip-icon">{{ icon }}</span> }
      <span class="cc-chip-label">{{ label }}</span>
      @if (deletable) {
        <button class="cc-chip-delete" (click)="onDelete($event)">×</button>
      }
    </span>
  `,
  styles: [`
    .cc-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      border: 1px solid transparent;
    }
    .cc-chip.clickable { cursor: pointer; }
    .cc-chip-default { background: #f3f4f6; color: #374151; }
    .cc-chip-primary { background: #dbeafe; color: #1e40af; }
    .cc-chip-success { background: #dcfce7; color: #166534; }
    .cc-chip-warning { background: #fef3c7; color: #92400e; }
    .cc-chip-error { background: #fee2e2; color: #b91c1c; }
    .cc-chip-outlined { background: transparent; border-color: currentColor; }
    .cc-chip.selected { outline: 2px solid #6366f1; outline-offset: 1px; }
    .cc-chip-avatar {
      width: 1.25rem;
      height: 1.25rem;
      border-radius: 50%;
      background: #d1d5db;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.625rem;
    }
    .cc-chip-icon { font-size: 1rem; }
    .cc-chip-delete {
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      font-size: 1rem;
      opacity: 0.7;
      padding: 0;
      margin-left: 0.125rem;
    }
    .cc-chip-delete:hover { opacity: 1; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcChipComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();
  @Output() action = new EventEmitter<Action>();

  get label(): string { return (this.component['label'] as string) ?? ''; }
  get variant(): string { return (this.component['variant'] as string) ?? 'default'; }
  get outlined(): boolean { return (this.component['outlined'] as boolean) ?? false; }
  get selectable(): boolean { return (this.component['selectable'] as boolean) ?? false; }
  get deletable(): boolean { return (this.component['deletable'] as boolean) ?? false; }
  get icon(): string | undefined { return this.component['icon'] as string; }
  get avatar(): string | undefined { return this.component['avatar'] as string; }
  get selectedPath(): string | undefined { return this.component['selectedPath'] as string; }
  get selected(): boolean {
    if (this.selectedPath) {
      return getByPointer(this.dataModel, this.selectedPath) === true;
    }
    return (this.component['selected'] as boolean) ?? false;
  }

  get chipClasses(): string {
    const classes = [`cc-chip-${this.variant}`];
    if (this.outlined) classes.push('cc-chip-outlined');
    return classes.join(' ');
  }

  onClick(): void {
    if (this.selectable && this.selectedPath) {
      this.inputChange.emit({ path: this.selectedPath, value: !this.selected });
    }
    const actionData = this.component['action'] as Action | undefined;
    if (actionData) {
      this.action.emit(actionData);
    }
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    const deleteAction = this.component['onDelete'] as Action | undefined;
    if (deleteAction) {
      this.action.emit(deleteAction);
    }
  }
}
