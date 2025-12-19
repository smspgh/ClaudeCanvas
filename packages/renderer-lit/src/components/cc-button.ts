import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { ButtonComponent, DataModel, Action } from '@claude-canvas/core';

@customElement('cc-button')
export class CcButton extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      border: none;
      font-family: inherit;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    button.primary {
      background: var(--cc-primary, #0066cc);
      color: white;
    }

    button.primary:hover:not(:disabled) {
      background: var(--cc-primary-hover, #0052a3);
    }

    button.secondary {
      background: var(--cc-secondary, #e5e5e5);
      color: var(--cc-text, #333);
    }

    button.secondary:hover:not(:disabled) {
      background: var(--cc-secondary-hover, #d5d5d5);
    }

    button.outline {
      background: transparent;
      color: var(--cc-primary, #0066cc);
      border: 1px solid var(--cc-primary, #0066cc);
    }

    button.outline:hover:not(:disabled) {
      background: var(--cc-primary-light, #e6f0ff);
    }

    button.ghost {
      background: transparent;
      color: var(--cc-primary, #0066cc);
    }

    button.ghost:hover:not(:disabled) {
      background: var(--cc-ghost-hover, #f5f5f5);
    }

    button.danger {
      background: var(--cc-danger, #dc2626);
      color: white;
    }

    button.danger:hover:not(:disabled) {
      background: var(--cc-danger-hover, #b91c1c);
    }

    .loading-spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  @property({ type: Object })
  component!: ButtonComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  private handleClick() {
    if (this.component.disabled || this.component.loading) return;

    const event = new CustomEvent<{ action: Action; dataModel: DataModel }>('cc-action', {
      bubbles: true,
      composed: true,
      detail: {
        action: this.component.action,
        dataModel: this.dataModel,
      },
    });
    this.dispatchEvent(event);
  }

  render() {
    const variant = this.component.variant ?? 'primary';
    const classes = {
      [variant]: true,
    };

    return html`
      <button
        class=${classMap(classes)}
        ?disabled=${this.component.disabled || this.component.loading}
        @click=${this.handleClick}
      >
        ${this.component.loading
          ? html`<span class="loading-spinner"></span>`
          : this.component.icon
            ? html`<span class="icon">${this.component.icon}</span>`
            : null
        }
        ${this.component.label}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-button': CcButton;
  }
}
