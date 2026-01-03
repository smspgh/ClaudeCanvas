import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel, Action } from '../types';

@Component({
  selector: 'cc-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-row" [style.gap.px]="gap" [style.align-items]="alignItems" [style.justify-content]="justifyContent" [style.flex-wrap]="wrap ? 'wrap' : 'nowrap'">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .cc-row { display: flex; flex-direction: row; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcRowComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();
  @Output() action = new EventEmitter<Action>();

  get gap(): number {
    return (this.component['gap'] as number) ?? 0;
  }

  get align(): string {
    return (this.component['align'] as string) ?? 'center';
  }

  get justify(): string {
    return (this.component['justify'] as string) ?? 'start';
  }

  get wrap(): boolean {
    return (this.component['wrap'] as boolean) ?? false;
  }

  get alignItems(): string {
    const map: Record<string, string> = {
      'start': 'flex-start',
      'end': 'flex-end',
      'center': 'center',
      'stretch': 'stretch',
      'baseline': 'baseline',
    };
    return map[this.align] ?? 'center';
  }

  get justifyContent(): string {
    const map: Record<string, string> = {
      'start': 'flex-start',
      'end': 'flex-end',
      'center': 'center',
      'space-between': 'space-between',
      'space-around': 'space-around',
      'space-evenly': 'space-evenly',
    };
    return map[this.justify] ?? 'flex-start';
  }
}
