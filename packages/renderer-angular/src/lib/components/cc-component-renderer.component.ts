import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel, Action, VisibilityCondition } from '../types';
import { getByPointer, evaluateExpression } from '../utils/json-pointer';

// Layout Components
import { CcRowComponent } from './cc-row.component';
import { CcColumnComponent } from './cc-column.component';
import { CcCardComponent } from './cc-card.component';
import { CcDividerComponent } from './cc-divider.component';

// Display Components
import { CcTextComponent } from './cc-text.component';
import { CcImageComponent } from './cc-image.component';
import { CcIconComponent } from './cc-icon.component';
import { CcBadgeComponent } from './cc-badge.component';
import { CcAvatarComponent } from './cc-avatar.component';

// Form/Input Components
import { CcTextFieldComponent } from './cc-text-field.component';
import { CcSelectComponent } from './cc-select.component';
import { CcCheckboxComponent } from './cc-checkbox.component';
import { CcSliderComponent } from './cc-slider.component';

// Interactive Components
import { CcButtonComponent } from './cc-button.component';

// Data Visualization Components
import { CcChartComponent } from './cc-chart.component';
import { CcProgressComponent } from './cc-progress.component';

/**
 * Recursive component renderer for ClaudeCanvas
 * Handles rendering any component definition and its children
 */
@Component({
  selector: 'cc-component-renderer',
  standalone: true,
  imports: [
    CommonModule,
    CcRowComponent,
    CcColumnComponent,
    CcCardComponent,
    CcDividerComponent,
    CcTextComponent,
    CcImageComponent,
    CcIconComponent,
    CcBadgeComponent,
    CcAvatarComponent,
    CcTextFieldComponent,
    CcSelectComponent,
    CcCheckboxComponent,
    CcSliderComponent,
    CcButtonComponent,
    CcChartComponent,
    CcProgressComponent,
    forwardRef(() => CcComponentRendererComponent),
  ],
  template: `
    @if (isVisible(component)) {
      @switch (component.component) {
        @case ('Row') {
          <div class="cc-row" [style.gap.px]="component['gap'] || 0"
               [style.align-items]="getAlignItems($any(component['align']))"
               [style.justify-content]="getJustifyContent($any(component['justify']))"
               [style.flex-wrap]="component['wrap'] ? 'wrap' : 'nowrap'"
               [ngStyle]="getComponentStyle(component)">
            @for (child of component['children'] || []; track $index) {
              <cc-component-renderer
                [component]="child"
                [dataModel]="dataModel"
                (inputChange)="inputChange.emit($event)"
                (action)="action.emit($event)">
              </cc-component-renderer>
            }
          </div>
        }
        @case ('Column') {
          <div class="cc-column" [style.gap.px]="component['gap'] || 0"
               [style.align-items]="getAlignItems($any(component['align']))"
               [ngStyle]="getComponentStyle(component)">
            @for (child of component['children'] || []; track $index) {
              <cc-component-renderer
                [component]="child"
                [dataModel]="dataModel"
                (inputChange)="inputChange.emit($event)"
                (action)="action.emit($event)">
              </cc-component-renderer>
            }
          </div>
        }
        @case ('Card') {
          <div class="cc-card" [class.elevated]="component['elevated']"
               [ngStyle]="getComponentStyle(component)">
            @for (child of component['children'] || []; track $index) {
              <cc-component-renderer
                [component]="child"
                [dataModel]="dataModel"
                (inputChange)="inputChange.emit($event)"
                (action)="action.emit($event)">
              </cc-component-renderer>
            }
          </div>
        }
        @case ('Divider') {
          <hr class="cc-divider" [class.vertical]="component['vertical']" />
        }
        @case ('Text') {
          <cc-text [component]="component" [dataModel]="dataModel"></cc-text>
        }
        @case ('Image') {
          <cc-image [component]="component" [dataModel]="dataModel"></cc-image>
        }
        @case ('Icon') {
          <cc-icon [component]="component" [dataModel]="dataModel"></cc-icon>
        }
        @case ('Badge') {
          <cc-badge [component]="component" [dataModel]="dataModel"></cc-badge>
        }
        @case ('Avatar') {
          <cc-avatar [component]="component" [dataModel]="dataModel"></cc-avatar>
        }
        @case ('TextField') {
          <cc-text-field [component]="component" [dataModel]="dataModel" (inputChange)="inputChange.emit($event)"></cc-text-field>
        }
        @case ('Select') {
          <cc-select [component]="component" [dataModel]="dataModel" (inputChange)="inputChange.emit($event)"></cc-select>
        }
        @case ('Checkbox') {
          <cc-checkbox [component]="component" [dataModel]="dataModel" (inputChange)="inputChange.emit($event)"></cc-checkbox>
        }
        @case ('Slider') {
          <cc-slider [component]="component" [dataModel]="dataModel" (inputChange)="inputChange.emit($event)"></cc-slider>
        }
        @case ('Button') {
          <cc-button [component]="component" [dataModel]="dataModel" (action)="action.emit($event)"></cc-button>
        }
        @case ('Chart') {
          <cc-chart [component]="component" [dataModel]="dataModel"></cc-chart>
        }
        @case ('Progress') {
          <cc-progress [component]="component" [dataModel]="dataModel"></cc-progress>
        }
        @case ('List') {
          <div class="cc-list" [style.gap.px]="component['gap'] || 0">
            @if (getListItems(component).length === 0 && component['emptyMessage']) {
              <div class="cc-list-empty">{{ component['emptyMessage'] }}</div>
            } @else {
              @for (item of getListItems(component); track $index; let i = $index) {
                <div class="cc-list-item" [class.alternate]="component['alternateBackground'] && i % 2 === 1">
                  @if (component['itemTemplate']) {
                    <cc-component-renderer
                      [component]="$any(component['itemTemplate'])"
                      [dataModel]="getScopedDataModel(item, i)"
                      (inputChange)="inputChange.emit($event)"
                      (action)="action.emit($event)">
                    </cc-component-renderer>
                  }
                </div>
              }
            }
          </div>
        }
        @default {
          <div class="cc-unknown">Unknown: {{ component.component }}</div>
        }
      }
    }
  `,
  styles: [`
    .cc-row { display: flex; flex-direction: row; }
    .cc-column { display: flex; flex-direction: column; }
    .cc-card {
      background: var(--cc-card-bg, #fff);
      border-radius: 8px;
      padding: 16px;
    }
    .cc-card.elevated {
      box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    }
    .cc-divider {
      border: none;
      border-top: 1px solid var(--cc-border, #e2e8f0);
      margin: 8px 0;
    }
    .cc-divider.vertical {
      border-top: none;
      border-left: 1px solid var(--cc-border, #e2e8f0);
      height: 100%;
      margin: 0 8px;
    }
    .cc-list { display: flex; flex-direction: column; }
    .cc-list-item.alternate { background: rgba(0,0,0,0.02); }
    .cc-list-empty { padding: 2rem; text-align: center; color: #64748b; }
    .cc-unknown { color: #b91c1c; font-size: 0.875rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcComponentRendererComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();
  @Output() action = new EventEmitter<Action>();

  isVisible(component: ComponentDefinition): boolean {
    if (!component.visibleIf) return true;

    if (typeof component.visibleIf === 'string') {
      const value = getByPointer(this.dataModel, component.visibleIf);
      return Boolean(value);
    }

    const condition = component.visibleIf as VisibilityCondition;
    let value = getByPointer(this.dataModel, condition.path);

    if (condition.expr) {
      value = evaluateExpression(condition.expr, value);
    }

    if (condition.eq !== undefined) return value === condition.eq;
    if (condition.neq !== undefined) return value !== condition.neq;
    if (condition.gt !== undefined) return typeof value === 'number' && value > condition.gt;
    if (condition.gte !== undefined) return typeof value === 'number' && value >= condition.gte;
    if (condition.lt !== undefined) return typeof value === 'number' && value < condition.lt;
    if (condition.lte !== undefined) return typeof value === 'number' && value <= condition.lte;

    return Boolean(value);
  }

  getAlignItems(align?: string): string {
    const map: Record<string, string> = {
      'start': 'flex-start',
      'end': 'flex-end',
      'center': 'center',
      'stretch': 'stretch',
    };
    return map[align || 'start'] || 'flex-start';
  }

  getJustifyContent(justify?: string): string {
    const map: Record<string, string> = {
      'start': 'flex-start',
      'end': 'flex-end',
      'center': 'center',
      'spaceBetween': 'space-between',
      'spaceAround': 'space-around',
    };
    return map[justify || 'start'] || 'flex-start';
  }

  getComponentStyle(component: ComponentDefinition): Record<string, string | number> {
    const style: Record<string, string | number> = {};
    const s = component['style'] as Record<string, unknown> | undefined;
    if (!s) return style;

    if (s['backgroundColor']) style['background-color'] = s['backgroundColor'] as string;
    if (s['background']) style['background'] = s['background'] as string;
    if (s['padding'] !== undefined) {
      if (typeof s['padding'] === 'number') {
        style['padding'] = `${s['padding']}px`;
      }
    }
    if (s['borderRadius'] !== undefined) style['border-radius'] = `${s['borderRadius']}px`;
    if (s['borderColor']) style['border-color'] = s['borderColor'] as string;
    if (s['borderWidth'] !== undefined) style['border-width'] = `${s['borderWidth']}px`;
    if (s['width']) style['width'] = typeof s['width'] === 'number' ? `${s['width']}px` : s['width'] as string;
    if (s['height']) style['height'] = typeof s['height'] === 'number' ? `${s['height']}px` : s['height'] as string;
    if (s['flex'] !== undefined) style['flex'] = s['flex'] as number;

    return style;
  }

  getListItems(component: ComponentDefinition): unknown[] {
    const itemsPath = component['itemsPath'] as string;
    if (!itemsPath) return [];
    const data = getByPointer(this.dataModel, itemsPath);
    return Array.isArray(data) ? data : [];
  }

  getScopedDataModel(item: unknown, index: number): DataModel {
    return {
      ...this.dataModel,
      item,
      index,
    };
  }
}
