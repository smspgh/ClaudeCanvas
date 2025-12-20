import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { SelectComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

@customElement('cc-select')
export class CcSelect extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .select-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--cc-text, #333);
    }

    select {
      padding: 0.625rem 0.75rem;
      font-size: 0.9375rem;
      border: 1px solid var(--cc-border, #d1d5db);
      border-radius: 0.375rem;
      background-color: var(--cc-input-bg, #fff);
      color: var(--cc-text, #333);
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      padding-right: 2rem;
    }

    select:focus {
      outline: none;
      border-color: var(--cc-primary, #6366f1);
      box-shadow: 0 0 0 3px var(--cc-primary-light, rgba(99, 102, 241, 0.1));
    }

    select:disabled {
      background-color: var(--cc-disabled-bg, #f3f4f6);
      color: var(--cc-disabled-text, #9ca3af);
      cursor: not-allowed;
    }

    option {
      padding: 0.5rem;
    }
  `;

  @property({ type: Object })
  component!: SelectComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  private getValue(): string {
    const value = getByPointer(this.dataModel, this.component.valuePath);
    return value != null ? String(value) : '';
  }

  private handleChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    const event = new CustomEvent('cc-input', {
      bubbles: true,
      composed: true,
      detail: {
        path: this.component.valuePath,
        value: target.value,
      },
    });
    this.dispatchEvent(event);
  }

  render() {
    const value = this.getValue();
    const id = `select-${this.component.valuePath.replace(/\//g, '-')}`;

    return html`
      <div class="select-wrapper">
        ${this.component.label
          ? html`<label for=${id}>${this.component.label}</label>`
          : null
        }
        <select
          id=${id}
          .value=${value}
          ?disabled=${this.component.disabled}
          @change=${this.handleChange}
        >
          ${this.component.placeholder
            ? html`<option value="" disabled ?selected=${!value}>${this.component.placeholder}</option>`
            : null
          }
          ${this.component.options.map(
            option => html`
              <option value=${option.value} ?selected=${value === option.value}>
                ${option.label}
              </option>
            `
          )}
        </select>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-select': CcSelect;
  }
}
