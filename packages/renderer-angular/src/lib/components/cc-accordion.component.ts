import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel, Action } from '../types';
import { getByPointer } from '../utils/json-pointer';

interface AccordionItem { title: string; children?: ComponentDefinition[]; }

@Component({
  selector: 'cc-accordion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-accordion" [class]="variantClass">
      @for (item of items; track $index; let i = $index) {
        <div class="cc-accordion-item">
          <button class="cc-accordion-header" [class.expanded]="isExpanded(i)" (click)="toggle(i)">
            <span>{{ item.title }}</span>
            <span class="cc-accordion-icon">{{ isExpanded(i) ? '−' : '+' }}</span>
          </button>
          @if (isExpanded(i)) {
            <div class="cc-accordion-content">
              <ng-content></ng-content>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .cc-accordion-item { border-bottom: 1px solid #e2e8f0; }
    .cc-accordion-header {
      width: 100%; padding: 1rem; background: none; border: none;
      display: flex; justify-content: space-between; align-items: center;
      cursor: pointer; font-weight: 500; text-align: left;
    }
    .cc-accordion-header:hover { background: #f8fafc; }
    .cc-accordion-content { padding: 0 1rem 1rem; }
    .cc-accordion-bordered .cc-accordion-item { border: 1px solid #e2e8f0; border-radius: 0.5rem; margin-bottom: 0.5rem; }
    .cc-accordion-separated .cc-accordion-item { background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 0.5rem; margin-bottom: 0.5rem; border: none; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcAccordionComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();
  @Output() action = new EventEmitter<Action>();

  private expandedSet = new Set<number>();

  get items(): AccordionItem[] { return (this.component['items'] as AccordionItem[]) ?? []; }
  get allowMultiple(): boolean { return (this.component['allowMultiple'] as boolean) ?? false; }
  get expandedPath(): string | undefined { return this.component['expandedPath'] as string; }
  get variant(): string { return (this.component['variant'] as string) ?? 'default'; }
  get variantClass(): string { return `cc-accordion-${this.variant}`; }

  isExpanded(index: number): boolean { return this.expandedSet.has(index); }

  toggle(index: number): void {
    if (this.expandedSet.has(index)) {
      this.expandedSet.delete(index);
    } else {
      if (!this.allowMultiple) this.expandedSet.clear();
      this.expandedSet.add(index);
    }
    if (this.expandedPath) {
      const value = this.allowMultiple ? Array.from(this.expandedSet) : (this.expandedSet.size > 0 ? Array.from(this.expandedSet)[0] : null);
      this.inputChange.emit({ path: this.expandedPath, value });
    }
  }
}
