import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { TextFieldComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

@customElement('cc-text-field')
export class CcTextField extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--cc-text, #333);
    }

    label.required::after {
      content: ' *';
      color: var(--cc-danger, #dc2626);
    }

    input,
    textarea {
      padding: 0.625rem 0.75rem;
      border: 1px solid var(--cc-border, #d1d5db);
      border-radius: 8px;
      font-size: 1rem;
      font-family: inherit;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      background: var(--cc-input-bg, white);
      color: var(--cc-text, #333);
    }

    input:focus,
    textarea:focus {
      outline: none;
      border-color: var(--cc-primary, #0066cc);
      box-shadow: 0 0 0 3px var(--cc-primary-light, rgba(0, 102, 204, 0.1));
    }

    input:disabled,
    textarea:disabled {
      background: var(--cc-disabled-bg, #f5f5f5);
      cursor: not-allowed;
    }

    input::placeholder,
    textarea::placeholder {
      color: var(--cc-text-placeholder, #9ca3af);
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }
  `;

  @property({ type: Object })
  component!: TextFieldComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  private getValue(): string {
    const value = getByPointer(this.dataModel, this.component.valuePath);
    // Handle null, undefined, and objects (avoid [object Object])
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return '';
    return String(value);
  }

  private handleInput(e: Event) {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
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

    if (this.component.multiline) {
      return html`
        <div class="field">
          ${this.component.label
            ? html`<label class=${this.component.required ? 'required' : ''}>${this.component.label}</label>`
            : null
          }
          <textarea
            .value=${value}
            placeholder=${this.component.placeholder ?? ''}
            ?disabled=${this.component.disabled}
            ?required=${this.component.required}
            rows=${this.component.rows ?? 3}
            @input=${this.handleInput}
          ></textarea>
        </div>
      `;
    }

    return html`
      <div class="field">
        ${this.component.label
          ? html`<label class=${this.component.required ? 'required' : ''}>${this.component.label}</label>`
          : null
        }
        <input
          type=${this.component.inputType ?? 'text'}
          .value=${value}
          placeholder=${this.component.placeholder ?? ''}
          ?disabled=${this.component.disabled}
          ?required=${this.component.required}
          @input=${this.handleInput}
        />
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-text-field': CcTextField;
  }
}
