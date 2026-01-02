import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { AlertComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

@customElement('cc-alert')
export class CcAlert extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .alert {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid transparent;
    }

    .hidden {
      display: none;
    }

    /* Variants */
    .info {
      background: var(--cc-alert-info-bg, #dbeafe);
      border-color: var(--cc-alert-info-border, #93c5fd);
      color: var(--cc-alert-info-text, #1e40af);
    }

    .success {
      background: var(--cc-alert-success-bg, #d1fae5);
      border-color: var(--cc-alert-success-border, #6ee7b7);
      color: var(--cc-alert-success-text, #065f46);
    }

    .warning {
      background: var(--cc-alert-warning-bg, #fef3c7);
      border-color: var(--cc-alert-warning-border, #fcd34d);
      color: var(--cc-alert-warning-text, #92400e);
    }

    .error {
      background: var(--cc-alert-error-bg, #fee2e2);
      border-color: var(--cc-alert-error-border, #fca5a5);
      color: var(--cc-alert-error-text, #991b1b);
    }

    .icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .content {
      flex: 1;
      min-width: 0;
    }

    .title {
      font-weight: 600;
      font-size: 0.875rem;
      margin: 0 0 4px 0;
    }

    .message {
      font-size: 0.875rem;
      margin: 0;
      line-height: 1.5;
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
      flex-shrink: 0;
    }

    .close-btn:hover {
      opacity: 1;
    }

    .actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
  `;

  @property({ type: Object })
  component!: AlertComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

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
    if (this.component.openPath) {
      const value = getByPointer(this.dataModel, this.component.openPath);
      return Boolean(value);
    }
    return true; // Default to visible if no openPath
  }

  private handleDismiss() {
    if (this.component.openPath) {
      this.dispatchEvent(new CustomEvent('cc-action', {
        bubbles: true,
        composed: true,
        detail: {
          action: { type: 'update', path: this.component.openPath, value: false },
          dataModel: this.dataModel,
        },
      }));
    }
  }

  render() {
    const isOpen = this.isOpen();
    const variant = this.component.variant ?? 'info';
    const showIcon = this.component.showIcon ?? true;
    const dismissible = this.component.dismissible ?? false;
    const message = this.getMessage();
    const icon = this.getIcon();

    return html`
      <div class="alert ${variant} ${isOpen ? '' : 'hidden'}">
        ${showIcon ? html`<span class="icon">${icon}</span>` : ''}
        <div class="content">
          ${this.component.title ? html`<p class="title">${this.component.title}</p>` : ''}
          <p class="message">${message}</p>
          ${this.component.actions?.length ? html`
            <div class="actions">
              <slot name="actions"></slot>
            </div>
          ` : ''}
        </div>
        ${dismissible ? html`
          <button class="close-btn" @click="${this.handleDismiss}">×</button>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-alert': CcAlert;
  }
}
