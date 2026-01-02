import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { SliderComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

@customElement('cc-slider')
export class CcSlider extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    :host([data-flex]) {
      flex: 1;
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
      background: var(--slider-thumb-color, var(--cc-primary, #6366f1));
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    input[type="range"]::-moz-range-thumb {
      width: 1.25rem;
      height: 1.25rem;
      background: var(--slider-thumb-color, var(--cc-primary, #6366f1));
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

  connectedCallback() {
    super.connectedCallback();
    // Apply flex from style to host element
    const style = this.component?.style as Record<string, unknown> | undefined;
    if (style?.flex) {
      this.setAttribute('data-flex', '');
      this.style.flex = String(style.flex);
    }
  }

  render() {
    const value = this.getValue();
    const min = this.component.min ?? 0;
    const max = this.component.max ?? 100;
    const step = this.component.step ?? 1;
    const showValue = this.component.showValue ?? true;
    const id = `slider-${this.component.valuePath.replace(/\//g, '-')}`;

    // Calculate percentage for gradient fill
    const percentage = ((value - min) / (max - min)) * 100;
    const trackColor = this.component.trackColor ?? 'var(--cc-border, #d1d5db)';
    const fillColor = this.component.fillColor ?? 'var(--cc-primary, #6366f1)';

    // Create gradient background to show filled portion
    const sliderStyle = `background: linear-gradient(to right, ${fillColor} 0%, ${fillColor} ${percentage}%, ${trackColor} ${percentage}%, ${trackColor} 100%);`;
    const thumbStyle = this.component.fillColor ? `--slider-thumb-color: ${fillColor};` : '';

    // Hide header if no label and showValue is false
    const hasHeader = this.component.label || showValue;

    return html`
      <div class="slider-wrapper" style=${thumbStyle}>
        ${hasHeader ? html`
          <div class="slider-header">
            ${this.component.label
              ? html`<label for=${id}>${this.component.label}</label>`
              : html`<span></span>`
            }
            ${showValue ? html`<span class="slider-value">${value}</span>` : nothing}
          </div>
        ` : nothing}
        <input
          type="range"
          id=${id}
          .value=${String(value)}
          min=${min}
          max=${max}
          step=${step}
          ?disabled=${this.component.disabled}
          @input=${this.handleInput}
          style=${sliderStyle}
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
