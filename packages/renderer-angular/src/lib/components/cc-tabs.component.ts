import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel, Action } from '../types';
import { getByPointer } from '../utils/json-pointer';

interface Tab { label: string; value: string; children?: ComponentDefinition[]; }

@Component({
  selector: 'cc-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-tabs">
      <div class="cc-tabs-header">
        @for (tab of tabs; track tab.value) {
          <button class="cc-tab-btn" [class.active]="tab.value === activeValue" (click)="selectTab(tab.value)">
            {{ tab.label }}
          </button>
        }
      </div>
      <div class="cc-tabs-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .cc-tabs-header { display: flex; border-bottom: 1px solid #e2e8f0; }
    .cc-tab-btn {
      padding: 0.75rem 1rem; background: none; border: none; border-bottom: 2px solid transparent;
      cursor: pointer; font-weight: 500; color: #64748b; transition: all 0.15s;
    }
    .cc-tab-btn:hover { color: #1e293b; }
    .cc-tab-btn.active { color: #6366f1; border-bottom-color: #6366f1; }
    .cc-tabs-content { padding: 1rem 0; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcTabsComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();
  @Output() action = new EventEmitter<Action>();

  get tabs(): Tab[] { return (this.component['tabs'] as Tab[]) ?? []; }
  get valuePath(): string | undefined { return this.component['valuePath'] as string; }
  get activeValue(): string {
    if (this.valuePath) {
      const v = getByPointer(this.dataModel, this.valuePath);
      return v?.toString() ?? this.tabs[0]?.value ?? '';
    }
    return this.tabs[0]?.value ?? '';
  }

  selectTab(value: string): void {
    if (this.valuePath) {
      this.inputChange.emit({ path: this.valuePath, value });
    }
  }
}
