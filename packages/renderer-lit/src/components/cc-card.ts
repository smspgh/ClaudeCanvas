import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { CardComponent, DataModel } from '@claude-canvas/core';

@customElement('cc-card')
export class CcCard extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .card {
      background: var(--cc-card-bg, white);
      border-radius: 12px;
      padding: 1rem;
      border: 1px solid var(--cc-border, #e5e5e5);
    }

    .card.elevated {
      border: none;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                  0 2px 4px -2px rgba(0, 0, 0, 0.1);
    }
  `;

  @property({ type: Object })
  component!: CardComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  render() {
    const classes = {
      card: true,
      elevated: this.component.elevated ?? false,
    };

    return html`
      <div class=${classMap(classes)}>
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-card': CcCard;
  }
}
