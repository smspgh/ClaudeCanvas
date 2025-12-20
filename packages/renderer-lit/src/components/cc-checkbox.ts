import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { CheckboxComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

@customElement('cc-checkbox')
export class CcCheckbox extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .checkbox-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .checkbox-wrapper:has(input:disabled) {
      cursor: not-allowed;
      opacity: 0.6;
    }

    input[type="checkbox"] {
      width: 1.125rem;
      height: 1.125rem;
      margin: 0;
      cursor: pointer;
      accent-color: var(--cc-primary, #6366f1);
    }

    input[type="checkbox"]:disabled {
      cursor: not-allowed;
    }

    label {
      font-size: 0.9375rem;
      color: var(--cc-text, #333);
      cursor: pointer;
      user-select: none;
    }

    label.disabled {
      cursor: not-allowed;
    }
  `;

  @property({ type: Object })
  component!: CheckboxComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  private getValue(): boolean {
    const value = getByPointer(this.dataModel, this.component.valuePath);
    return Boolean(value);
  }

  private handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const event = new CustomEvent('cc-input', {
      bubbles: true,
      composed: true,
      detail: {
        path: this.component.valuePath,
        value: target.checked,
      },
    });
    this.dispatchEvent(event);
  }

  render() {
    const checked = this.getValue();
    const id = `checkbox-${this.component.valuePath.replace(/\//g, '-')}`;

    return html`
      <div class="checkbox-wrapper">
        <input
          type="checkbox"
          id=${id}
          .checked=${checked}
          ?disabled=${this.component.disabled}
          @change=${this.handleChange}
        />
        ${this.component.label
          ? html`<label for=${id} class=${this.component.disabled ? 'disabled' : ''}>${this.component.label}</label>`
          : null
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-checkbox': CcCheckbox;
  }
}
