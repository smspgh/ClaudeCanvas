import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-avatar" [class]="avatarClasses" [style.width.px]="sizeValue" [style.height.px]="sizeValue">
      @if (src) {
        <img [src]="src" [alt]="initials" class="cc-avatar-img" />
      } @else {
        <span class="cc-avatar-initials" [style.font-size.px]="sizeValue * 0.4">{{ displayInitials }}</span>
      }
      @if (status) {
        <span class="cc-avatar-status" [class]="statusClass"></span>
      }
    </div>
  `,
  styles: [`
    .cc-avatar { position: relative; display: inline-flex; align-items: center; justify-content: center; background: #e0e7ff; color: #4338ca; overflow: hidden; }
    .cc-avatar-circle { border-radius: 50%; }
    .cc-avatar-square { border-radius: 0; }
    .cc-avatar-rounded { border-radius: 0.5rem; }
    .cc-avatar-img { width: 100%; height: 100%; object-fit: cover; }
    .cc-avatar-initials { font-weight: 600; text-transform: uppercase; }
    .cc-avatar-status { position: absolute; bottom: 0; right: 0; width: 25%; height: 25%; border-radius: 50%; border: 2px solid white; }
    .cc-avatar-status-online { background: #22c55e; }
    .cc-avatar-status-offline { background: #9ca3af; }
    .cc-avatar-status-busy { background: #ef4444; }
    .cc-avatar-status-away { background: #f97316; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcAvatarComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};

  get src(): string | undefined {
    if (this.component['srcPath']) return getByPointer(this.dataModel, this.component['srcPath'] as string)?.toString();
    return this.component['src'] as string;
  }
  get initials(): string {
    if (this.component['initialsPath']) return getByPointer(this.dataModel, this.component['initialsPath'] as string)?.toString() ?? '';
    return (this.component['initials'] as string) ?? '';
  }
  get displayInitials(): string { return this.initials.substring(0, 2).toUpperCase(); }
  get size(): string { return (this.component['size'] as string) ?? 'medium'; }
  get sizeValue(): number { return this.size === 'small' ? 32 : this.size === 'large' ? 64 : 48; }
  get shape(): string { return (this.component['shape'] as string) ?? 'circle'; }
  get status(): string | undefined { return this.component['status'] as string; }
  get avatarClasses(): string { return `cc-avatar-${this.shape}`; }
  get statusClass(): string { return this.status ? `cc-avatar-status-${this.status}` : ''; }
}
