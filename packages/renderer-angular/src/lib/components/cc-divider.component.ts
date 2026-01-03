import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';

@Component({
  selector: 'cc-divider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <hr class="cc-divider" [class.vertical]="orientation === 'vertical'" />
  `,
  styles: [`
    .cc-divider {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 0.5rem 0;
    }
    .cc-divider.vertical {
      border-top: none;
      border-left: 1px solid #e2e8f0;
      height: 100%;
      margin: 0 0.5rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcDividerComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};

  get orientation(): string {
    return (this.component['orientation'] as string) ?? 'horizontal';
  }
}
