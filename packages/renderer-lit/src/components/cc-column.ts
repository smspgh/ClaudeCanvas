import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ColumnComponent, DataModel, FlexAlignment } from '@claude-canvas/core';

@customElement('cc-column')
export class CcColumn extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .column {
      display: flex;
      flex-direction: column;
    }
  `;

  @property({ type: Object })
  component!: ColumnComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  private getAlignItems(align?: FlexAlignment): string {
    const map: Record<FlexAlignment, string> = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      stretch: 'stretch',
      spaceBetween: 'space-between',
      spaceAround: 'space-around',
    };
    return map[align ?? 'stretch'];
  }

  render() {
    const style = `
      gap: ${this.component.gap ?? 0}px;
      align-items: ${this.getAlignItems(this.component.align)};
    `;

    return html`
      <div class="column" style=${style}>
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-column': CcColumn;
  }
}
