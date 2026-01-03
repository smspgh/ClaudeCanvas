import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel, Action } from '../types';

@Component({
  selector: 'cc-column',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-column" [style.gap.px]="gap" [style.align-items]="alignItems">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .cc-column { display: flex; flex-direction: column; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcColumnComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();
  @Output() action = new EventEmitter<Action>();

  get gap(): number {
    return (this.component['gap'] as number) ?? 0;
  }

  get align(): string {
    return (this.component['align'] as string) ?? 'start';
  }

  get alignItems(): string {
    const map: Record<string, string> = {
      'start': 'flex-start',
      'end': 'flex-end',
      'center': 'center',
      'stretch': 'stretch',
    };
    return map[this.align] ?? 'flex-start';
  }
}
