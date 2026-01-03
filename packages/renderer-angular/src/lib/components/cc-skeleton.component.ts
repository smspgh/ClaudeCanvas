import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';

@Component({
  selector: 'cc-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (variant === 'text' && lines > 1) {
      <div class="cc-skeleton-lines">
        @for (line of lineArray; track $index; let last = $last) {
          <div class="cc-skeleton cc-skeleton-text" [class]="animationClass" [style.width]="last ? '70%' : width" [style.height.px]="height || 16"></div>
        }
      </div>
    } @else {
      <div class="cc-skeleton" [class]="skeletonClasses" [style.width]="effectiveWidth" [style.height]="effectiveHeight"></div>
    }
  `,
  styles: [`
    .cc-skeleton { background: #e2e8f0; }
    .cc-skeleton-text { border-radius: 0.25rem; }
    .cc-skeleton-circular { border-radius: 50%; }
    .cc-skeleton-rectangular { border-radius: 0; }
    .cc-skeleton-lines { display: flex; flex-direction: column; gap: 0.5rem; }
    .cc-skeleton-pulse { animation: pulse 1.5s ease-in-out infinite; }
    .cc-skeleton-wave { background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%); background-size: 200% 100%; animation: wave 1.5s linear infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes wave { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcSkeletonComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};

  get variant(): string { return (this.component['variant'] as string) ?? 'text'; }
  get width(): string | undefined { const w = this.component['width']; return typeof w === 'number' ? `${w}px` : w as string; }
  get height(): number | undefined { return this.component['height'] as number; }
  get lines(): number { return (this.component['lines'] as number) ?? 1; }
  get animation(): string { return (this.component['animation'] as string) ?? 'pulse'; }
  get lineArray(): number[] { return Array.from({ length: this.lines }, (_, i) => i); }
  get animationClass(): string { return this.animation !== 'none' ? `cc-skeleton-${this.animation}` : ''; }
  get effectiveWidth(): string { return this.variant === 'circular' ? `${this.height || 40}px` : this.width || '100%'; }
  get effectiveHeight(): string { return this.variant === 'text' ? `${this.height || 16}px` : `${this.height || (this.variant === 'circular' ? 40 : 100)}px`; }
  get skeletonClasses(): string { return `cc-skeleton-${this.variant} ${this.animationClass}`; }
}
