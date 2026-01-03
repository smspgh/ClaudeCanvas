import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';

@Component({
  selector: 'cc-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="material-icons cc-icon" [style.font-size.px]="size" [style.color]="color">
      {{ iconName }}
    </span>
  `,
  styles: [`
    .cc-icon { font-family: 'Material Icons', sans-serif; vertical-align: middle; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcIconComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};

  get iconName(): string {
    return (this.component['name'] as string) ?? 'circle';
  }

  get size(): number {
    return (this.component['size'] as number) ?? 24;
  }

  get color(): string | undefined {
    return this.component['color'] as string | undefined;
  }
}
