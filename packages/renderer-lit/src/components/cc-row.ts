import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { RowComponent, DataModel, FlexAlignment } from '@claude-canvas/core';

@customElement('cc-row')
export class CcRow extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .row {
      display: flex;
      flex-direction: row;
    }

    .wrap {
      flex-wrap: wrap;
    }
  `;

  @property({ type: Object })
  component!: RowComponent;

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

  private getJustifyContent(justify?: FlexAlignment): string {
    const map: Record<FlexAlignment, string> = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      stretch: 'stretch',
      spaceBetween: 'space-between',
      spaceAround: 'space-around',
    };
    return map[justify ?? 'start'];
  }

  render() {
    const style = `
      gap: ${this.component.gap ?? 0}px;
      align-items: ${this.getAlignItems(this.component.align)};
      justify-content: ${this.getJustifyContent(this.component.justify)};
    `;

    return html`
      <div class="row ${this.component.wrap ? 'wrap' : ''}" style=${style}>
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-row': CcRow;
  }
}
