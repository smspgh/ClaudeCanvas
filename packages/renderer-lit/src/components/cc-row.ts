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
    // Support both component props (justify, align) and CSS-style properties in style object
    const componentStyle = this.component.style as Record<string, unknown> | undefined;
    const justifyFromStyle = componentStyle?.justifyContent as string | undefined;
    const alignFromStyle = componentStyle?.alignItems as string | undefined;

    // Prefer component props, fall back to style object values
    const justifyContent = this.component.justify
      ? this.getJustifyContent(this.component.justify)
      : (justifyFromStyle ?? 'flex-start');
    const alignItems = this.component.align
      ? this.getAlignItems(this.component.align)
      : (alignFromStyle ?? 'stretch');

    // Build style string with overflow support for scrollable layouts
    const styles: string[] = [
      `gap: ${this.component.gap ?? 0}px`,
      `align-items: ${alignItems}`,
      `justify-content: ${justifyContent}`,
    ];

    if (componentStyle?.overflowX) {
      styles.push(`overflow-x: ${componentStyle.overflowX}`);
    }
    if (componentStyle?.overflowY) {
      styles.push(`overflow-y: ${componentStyle.overflowY}`);
    }
    if (componentStyle?.overflow) {
      styles.push(`overflow: ${componentStyle.overflow}`);
    }
    if (componentStyle?.flex) {
      styles.push(`flex: ${componentStyle.flex}`);
    }
    if (componentStyle?.minWidth) {
      styles.push(`min-width: ${typeof componentStyle.minWidth === 'number' ? `${componentStyle.minWidth}px` : componentStyle.minWidth}`);
    }

    return html`
      <div class="row ${this.component.wrap ? 'wrap' : ''}" style=${styles.join('; ')}>
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
