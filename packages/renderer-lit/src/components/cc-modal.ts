import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { ModalComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

@customElement('cc-modal')
export class CcModal extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal {
      background: var(--cc-card-bg, white);
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                  0 10px 10px -5px rgba(0, 0, 0, 0.04);
      max-height: calc(100vh - 2rem);
      overflow: auto;
      display: flex;
      flex-direction: column;
    }

    .modal-small {
      width: 100%;
      max-width: 400px;
    }

    .modal-medium {
      width: 100%;
      max-width: 560px;
    }

    .modal-large {
      width: 100%;
      max-width: 800px;
    }

    .modal-fullscreen {
      width: calc(100vw - 2rem);
      height: calc(100vh - 2rem);
      max-width: none;
      max-height: none;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--cc-border, #e5e5e5);
    }

    .modal-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--cc-text, #333);
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--cc-text-secondary, #666);
      cursor: pointer;
      padding: 0;
      line-height: 1;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background-color 0.15s;
    }

    .modal-close:hover {
      background: var(--cc-disabled-bg, #f3f4f6);
      color: var(--cc-text, #333);
    }

    .modal-content {
      padding: 1.25rem;
      flex: 1;
      overflow: auto;
    }
  `;

  @property({ type: Object })
  component!: ModalComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  private get isOpen(): boolean {
    return Boolean(getByPointer(this.dataModel, this.component.openPath));
  }

  private get size(): string {
    return this.component.size ?? 'medium';
  }

  private get dismissible(): boolean {
    return this.component.dismissible ?? true;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.isOpen && this.dismissible) {
      this.close();
    }
  };

  private close() {
    this.dispatchEvent(new CustomEvent('cc-input', {
      bubbles: true,
      composed: true,
      detail: {
        path: this.component.openPath,
        value: false,
      },
    }));
  }

  private handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget && this.dismissible) {
      this.close();
    }
  }

  render() {
    if (!this.isOpen) return nothing;

    const modalClasses = {
      modal: true,
      [`modal-${this.size}`]: true,
    };

    return html`
      <div class="modal-backdrop" @click=${this.handleBackdropClick}>
        <div
          class=${classMap(modalClasses)}
          role="dialog"
          aria-modal="true"
          aria-labelledby=${this.component.title ? 'cc-modal-title' : nothing}
        >
          ${this.component.title ? html`
            <div class="modal-header">
              <h3 id="cc-modal-title" class="modal-title">${this.component.title}</h3>
              ${this.dismissible ? html`
                <button
                  class="modal-close"
                  @click=${this.close}
                  aria-label="Close modal"
                >
                  &times;
                </button>
              ` : nothing}
            </div>
          ` : nothing}
          <div class="modal-content">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-modal': CcModal;
  }
}
