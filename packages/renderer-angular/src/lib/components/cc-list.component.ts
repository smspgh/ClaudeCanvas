import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel, Action } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (items.length === 0 && emptyMessage) {
      <div class="cc-list-empty">{{ emptyMessage }}</div>
    } @else {
      <div class="cc-list" [style.gap.px]="gap">
        @for (item of items; track $index; let i = $index) {
          <div class="cc-list-item" [class.alternate]="alternateBackground && i % 2 === 1">
            <!-- Template would be rendered here - simplified for now -->
            <ng-content></ng-content>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .cc-list { display: flex; flex-direction: column; }
    .cc-list-item.alternate { background: rgba(0,0,0,0.02); }
    .cc-list-empty { padding: 2rem; text-align: center; color: #64748b; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcListComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();
  @Output() action = new EventEmitter<Action>();

  get itemsPath(): string | undefined { return this.component['itemsPath'] as string; }
  get items(): unknown[] {
    if (!this.itemsPath) return [];
    const data = getByPointer(this.dataModel, this.itemsPath);
    return Array.isArray(data) ? data : [];
  }
  get gap(): number { return (this.component['gap'] as number) ?? 0; }
  get alternateBackground(): boolean { return (this.component['alternateBackground'] as boolean) ?? false; }
  get emptyMessage(): string | undefined { return this.component['emptyMessage'] as string; }
}
