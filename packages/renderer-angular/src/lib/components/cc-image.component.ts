import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (src) {
      <img [src]="src" [alt]="alt" [style.object-fit]="fit" class="cc-image" />
    }
  `,
  styles: [`
    .cc-image { max-width: 100%; height: auto; display: block; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcImageComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};

  get src(): string | undefined {
    if (this.component['srcPath']) {
      const value = getByPointer(this.dataModel, this.component['srcPath'] as string);
      return value?.toString();
    }
    return this.component['src'] as string | undefined;
  }

  get alt(): string {
    return (this.component['alt'] as string) ?? '';
  }

  get fit(): string {
    return (this.component['fit'] as string) ?? 'cover';
  }
}
