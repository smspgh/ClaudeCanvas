import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (dot) {
      <span class="cc-badge-dot" [class]="variantClass"></span>
    } @else {
      <span class="cc-badge" [class]="badgeClasses">
        @if (icon) { <span class="cc-badge-icon">{{ icon }}</span> }
        {{ content }}
      </span>
    }
  `,
  styles: [`
    .cc-badge {
      display: inline-flex; align-items: center; gap: 0.25rem;
      padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 500;
    }
    .cc-badge.pill { border-radius: 9999px; }
    .cc-badge-dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; }
    .cc-badge-default { background: #f1f5f9; color: #475569; }
    .cc-badge-success { background: #dcfce7; color: #166534; }
    .cc-badge-warning { background: #fef3c7; color: #92400e; }
    .cc-badge-error { background: #fee2e2; color: #b91c1c; }
    .cc-badge-info { background: #dbeafe; color: #1e40af; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcBadgeComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};

  get content(): string {
    if (this.component['contentPath']) {
      const v = getByPointer(this.dataModel, this.component['contentPath'] as string);
      return v?.toString() ?? '';
    }
    return (this.component['content'] as string) ?? '';
  }
  get variant(): string { return (this.component['variant'] as string) ?? 'default'; }
  get pill(): boolean { return (this.component['pill'] as boolean) ?? false; }
  get dot(): boolean { return (this.component['dot'] as boolean) ?? false; }
  get icon(): string | undefined { return this.component['icon'] as string; }
  get variantClass(): string { return `cc-badge-${this.variant}`; }
  get badgeClasses(): string { return `${this.variantClass}${this.pill ? ' pill' : ''}`; }
}
