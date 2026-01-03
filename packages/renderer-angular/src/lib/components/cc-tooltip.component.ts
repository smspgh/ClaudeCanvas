import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel, Action } from '../types';

@Component({
  selector: 'cc-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-tooltip-wrapper" (mouseenter)="show = true" (mouseleave)="show = false">
      <ng-content></ng-content>
      @if (show && content) {
        <div class="cc-tooltip" [class]="positionClass">{{ content }}</div>
      }
    </div>
  `,
  styles: [`
    .cc-tooltip-wrapper { position: relative; display: inline-block; }
    .cc-tooltip {
      position: absolute; background: #1e293b; color: white; padding: 0.5rem 0.75rem;
      border-radius: 0.375rem; font-size: 0.75rem; white-space: nowrap; z-index: 100;
    }
    .cc-tooltip-top { bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 0.5rem; }
    .cc-tooltip-bottom { top: 100%; left: 50%; transform: translateX(-50%); margin-top: 0.5rem; }
    .cc-tooltip-left { right: 100%; top: 50%; transform: translateY(-50%); margin-right: 0.5rem; }
    .cc-tooltip-right { left: 100%; top: 50%; transform: translateY(-50%); margin-left: 0.5rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcTooltipComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();
  @Output() action = new EventEmitter<Action>();

  show = false;

  get content(): string { return (this.component['content'] as string) ?? ''; }
  get position(): string { return (this.component['position'] as string) ?? 'top'; }
  get positionClass(): string { return `cc-tooltip-${this.position}`; }
}
