import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { ToastComponent, DataModel, Action } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

@customElement('cc-toast')
export class CcToast extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .toast-container {
      position: fixed;
      z-index: 10000;
      pointer-events: none;
    }

    /* Positions */
    .top { top: 16px; left: 50%; transform: translateX(-50%); }
    .top-left { top: 16px; left: 16px; }
    .top-right { top: 16px; right: 16px; }
    .bottom { bottom: 16px; left: 50%; transform: translateX(-50%); }
    .bottom-left { bottom: 16px; left: 16px; }
    .bottom-right { bottom: 16px; right: 16px; }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      pointer-events: auto;
      min-width: 280px;
      max-width: 400px;
      animation: toast-in 0.3s ease-out;
    }

    .toast.hiding {
      animation: toast-out 0.3s ease-in forwards;
    }

    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes toast-out {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-20px);
      }
    }

    /* Variants */
    .info {
      background: var(--cc-toast-info-bg, #dbeafe);
      color: var(--cc-toast-info-text, #1e40af);
    }

    .success {
      background: var(--cc-toast-success-bg, #d1fae5);
      color: var(--cc-toast-success-text, #065f46);
    }

    .warning {
      background: var(--cc-toast-warning-bg, #fef3c7);
      color: var(--cc-toast-warning-text, #92400e);
    }

    .error {
      background: var(--cc-toast-error-bg, #fee2e2);
      color: var(--cc-toast-error-text, #991b1b);
    }

    .icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .message {
      flex: 1;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .action-btn {
      background: transparent;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      color: inherit;
      opacity: 0.8;
    }

    .action-btn:hover {
      opacity: 1;
      background: rgba(0, 0, 0, 0.1);
    }

    .close-btn {
      background: transparent;
      border: none;
      padding: 4px;
      cursor: pointer;
      color: inherit;
      opacity: 0.6;
      font-size: 1.25rem;
      line-height: 1;
    }

    .close-btn:hover {
      opacity: 1;
    }

    .hidden {
      display: none;
    }
  `;

  @property({ type: Object })
  component!: ToastComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  @state()
  private hiding = false;

  private autoHideTimeout?: ReturnType<typeof setTimeout>;

  private getIcon(): string {
    const variant = this.component.variant ?? 'info';
    const icons: Record<string, string> = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    };
    return icons[variant];
  }

  private getMessage(): string {
    if (this.component.messagePath) {
      const value = getByPointer(this.dataModel, this.component.messagePath);
      return String(value ?? '');
    }
    return this.component.message ?? '';
  }

  private isOpen(): boolean {
    const value = getByPointer(this.dataModel, this.component.openPath);
    return Boolean(value);
  }

  private handleDismiss() {
    this.hiding = true;
    setTimeout(() => {
      this.dispatchEvent(new CustomEvent('cc-action', {
        bubbles: true,
        composed: true,
        detail: {
          action: { type: 'update', path: this.component.openPath, value: false },
          dataModel: this.dataModel,
        },
      }));
      this.hiding = false;
    }, 300);
  }

  private handleAction() {
    if (this.component.action) {
      this.dispatchEvent(new CustomEvent('cc-action', {
        bubbles: true,
        composed: true,
        detail: {
          action: this.component.action,
          dataModel: this.dataModel,
        },
      }));
    }
  }

  updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);

    // Handle auto-dismiss
    const duration = this.component.duration ?? 5000;
    if (duration > 0 && this.isOpen() && !this.hiding) {
      if (this.autoHideTimeout) {
        clearTimeout(this.autoHideTimeout);
      }
      this.autoHideTimeout = setTimeout(() => {
        this.handleDismiss();
      }, duration);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.autoHideTimeout) {
      clearTimeout(this.autoHideTimeout);
    }
  }

  render() {
    const isOpen = this.isOpen();
    const variant = this.component.variant ?? 'info';
    const position = this.component.position ?? 'top';
    const dismissible = this.component.dismissible ?? true;
    const message = this.getMessage();
    const icon = this.getIcon();

    const positionClass = position.replace('-', '-');

    return html`
      <div class="toast-container ${positionClass} ${isOpen ? '' : 'hidden'}">
        <div class="toast ${variant} ${this.hiding ? 'hiding' : ''}">
          <span class="icon">${icon}</span>
          <span class="message">${message}</span>
          ${this.component.actionLabel ? html`
            <button class="action-btn" @click="${this.handleAction}">
              ${this.component.actionLabel}
            </button>
          ` : ''}
          ${dismissible ? html`
            <button class="close-btn" @click="${this.handleDismiss}">×</button>
          ` : ''}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-toast': CcToast;
  }
}
