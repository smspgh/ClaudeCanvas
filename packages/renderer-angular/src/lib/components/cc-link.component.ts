import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel, Action } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-link',
  standalone: true,
  imports: [CommonModule],
  template: `
    <a
      class="cc-link"
      [class]="variantClass"
      [href]="href"
      [target]="target"
      [rel]="rel"
      (click)="onClick($event)">
      @if (icon && iconPosition === 'left') { <span class="cc-link-icon">{{ icon }}</span> }
      {{ label }}
      @if (icon && iconPosition === 'right') { <span class="cc-link-icon">{{ icon }}</span> }
    </a>
  `,
  styles: [`
    .cc-link {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .cc-link-default { color: #6366f1; }
    .cc-link-default:hover { text-decoration: underline; }
    .cc-link-subtle { color: #6b7280; }
    .cc-link-subtle:hover { color: #374151; }
    .cc-link-muted { color: #9ca3af; }
    .cc-link-muted:hover { color: #6b7280; }
    .cc-link-icon { font-size: 0.875em; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcLinkComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() action = new EventEmitter<Action>();

  get hrefPath(): string | undefined { return this.component['hrefPath'] as string; }
  get href(): string {
    if (this.hrefPath) {
      const v = getByPointer(this.dataModel, this.hrefPath);
      return v?.toString() ?? '#';
    }
    return (this.component['href'] as string) ?? '#';
  }
  get label(): string { return (this.component['label'] as string) ?? ''; }
  get target(): string { return (this.component['target'] as string) ?? '_self'; }
  get variant(): string { return (this.component['variant'] as string) ?? 'default'; }
  get variantClass(): string { return `cc-link-${this.variant}`; }
  get icon(): string | undefined { return this.component['icon'] as string; }
  get iconPosition(): 'left' | 'right' { return (this.component['iconPosition'] as 'left' | 'right') ?? 'left'; }
  get rel(): string { return this.target === '_blank' ? 'noopener noreferrer' : ''; }

  onClick(event: Event): void {
    const actionData = this.component['action'] as Action | undefined;
    if (actionData) {
      event.preventDefault();
      this.action.emit(actionData);
    }
  }
}
