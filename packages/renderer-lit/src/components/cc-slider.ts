import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { SliderComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

@customElement('cc-slider')
export class CcSlider extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .slider-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--cc-text, #333);
    }

    .slider-value {
      font-size: 0.875rem;
      color: var(--cc-text-secondary, #666);
      font-variant-numeric: tabular-nums;
    }

    input[type="range"] {
      width: 100%;
      height: 0.5rem;
      margin: 0.5rem 0;
      cursor: pointer;
      appearance: none;
      background: var(--cc-border, #d1d5db);
      border-radius: 0.25rem;
    }

    input[type="range"]:focus {
      outline: none;
    }

    input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      width: 1.25rem;
      height: 1.25rem;
      background: var(--cc-primary, #6366f1);
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    input[type="range"]::-moz-range-thumb {
      width: 1.25rem;
      height: 1.25rem;
      background: var(--cc-primary, #6366f1);
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    input[type="range"]:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    input[type="range"]:disabled::-webkit-slider-thumb {
      background: var(--cc-disabled-text, #9ca3af);
      cursor: not-allowed;
    }

    input[type="range"]:disabled::-moz-range-thumb {
      background: var(--cc-disabled-text, #9ca3af);
      cursor: not-allowed;
    }
  `;

  @property({ type: Object })
  component!: SliderComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  private getValue(): number {
    const value = getByPointer(this.dataModel, this.component.valuePath);
    if (value != null && typeof value === 'number') {
      return value;
    }
    return this.component.min ?? 0;
  }

  private handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const event = new CustomEvent('cc-input', {
      bubbles: true,
      composed: true,
      detail: {
        path: this.component.valuePath,
        value: parseFloat(target.value),
      },
    });
    this.dispatchEvent(event);
  }

  render() {
    const value = this.getValue();
    const min = this.component.min ?? 0;
    const max = this.component.max ?? 100;
    const step = this.component.step ?? 1;
    const id = `slider-${this.component.valuePath.replace(/\//g, '-')}`;

    return html`
      <div class="slider-wrapper">
        <div class="slider-header">
          ${this.component.label
            ? html`<label for=${id}>${this.component.label}</label>`
            : html`<span></span>`
          }
          <span class="slider-value">${value}</span>
        </div>
        <input
          type="range"
          id=${id}
          .value=${String(value)}
          min=${min}
          max=${max}
          step=${step}
          ?disabled=${this.component.disabled}
          @input=${this.handleInput}
        />
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-slider': CcSlider;
  }
}
