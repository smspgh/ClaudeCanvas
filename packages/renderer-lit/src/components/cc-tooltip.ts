import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { TooltipComponent, DataModel } from '@claude-canvas/core';

@customElement('cc-tooltip')
export class CcTooltip extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      position: relative;
    }

    .trigger {
      display: inline-block;
    }

    .tooltip {
      position: absolute;
      z-index: 1000;
      padding: 6px 10px;
      background: var(--cc-tooltip-bg, #1f2937);
      color: var(--cc-tooltip-text, #fff);
      font-size: 0.75rem;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .tooltip.visible {
      opacity: 1;
    }

    /* Positions */
    .top {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 8px;
    }

    .bottom {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: 8px;
    }

    .left {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-right: 8px;
    }

    .right {
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: 8px;
    }

    /* Arrow */
    .tooltip::after {
      content: '';
      position: absolute;
      border: 6px solid transparent;
    }

    .top::after {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-top-color: var(--cc-tooltip-bg, #1f2937);
    }

    .bottom::after {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-bottom-color: var(--cc-tooltip-bg, #1f2937);
    }

    .left::after {
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      border-left-color: var(--cc-tooltip-bg, #1f2937);
    }

    .right::after {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      border-right-color: var(--cc-tooltip-bg, #1f2937);
    }
  `;

  @property({ type: Object })
  component!: TooltipComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  @state()
  private visible = false;

  private showTimeout?: ReturnType<typeof setTimeout>;

  private handleMouseEnter() {
    const delay = this.component.delay ?? 200;
    this.showTimeout = setTimeout(() => {
      this.visible = true;
    }, delay);
  }

  private handleMouseLeave() {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
    this.visible = false;
  }

  render() {
    const position = this.component.position ?? 'top';

    return html`
      <div
        class="trigger"
        @mouseenter="${this.handleMouseEnter}"
        @mouseleave="${this.handleMouseLeave}"
      >
        <slot></slot>
        <div class="tooltip ${position} ${this.visible ? 'visible' : ''}">
          ${this.component.content}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-tooltip': CcTooltip;
  }
}
