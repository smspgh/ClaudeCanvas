import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel, Action } from '../types';

@Component({
  selector: 'cc-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-card" [class.elevated]="elevated">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .cc-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      padding: 1rem;
    }
    .cc-card.elevated {
      border: none;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcCardComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();
  @Output() action = new EventEmitter<Action>();

  get elevated(): boolean {
    return (this.component['elevated'] as boolean) ?? false;
  }
}
