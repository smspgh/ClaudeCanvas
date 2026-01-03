import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-text',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (content) {
      <span [class]="textClass" [style.color]="color">{{ content }}</span>
    }
  `,
  styles: [`
    .cc-text-heading1 { font-size: 2rem; font-weight: 700; }
    .cc-text-heading2 { font-size: 1.5rem; font-weight: 600; }
    .cc-text-heading3 { font-size: 1.25rem; font-weight: 600; }
    .cc-text-body { font-size: 1rem; }
    .cc-text-caption { font-size: 0.875rem; color: #64748b; }
    .cc-text-code { font-family: monospace; background: #f1f5f9; padding: 0.125rem 0.25rem; border-radius: 3px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcTextComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};

  get content(): string {
    if (this.component['contentPath']) {
      const value = getByPointer(this.dataModel, this.component['contentPath'] as string);
      return value?.toString() ?? '';
    }
    return (this.component['content'] as string) ?? '';
  }

  get textClass(): string {
    const style = (this.component['textStyle'] as string) ?? 'body';
    return `cc-text-${style}`;
  }

  get color(): string | undefined {
    return this.component['color'] as string | undefined;
  }
}
