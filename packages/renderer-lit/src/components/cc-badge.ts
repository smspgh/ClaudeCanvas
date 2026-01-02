import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { BadgeComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

@customElement('cc-badge')
export class CcBadge extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
      white-space: nowrap;
    }

    /* Sizes */
    .small {
      padding: 2px 6px;
      font-size: 0.625rem;
      border-radius: 4px;
    }

    .medium {
      padding: 4px 8px;
      font-size: 0.75rem;
      border-radius: 6px;
    }

    .large {
      padding: 6px 12px;
      font-size: 0.875rem;
      border-radius: 8px;
    }

    /* Pill shape */
    .pill.small { border-radius: 10px; }
    .pill.medium { border-radius: 12px; }
    .pill.large { border-radius: 16px; }

    /* Variants */
    .default {
      background: var(--cc-badge-default-bg, #e5e7eb);
      color: var(--cc-badge-default-text, #374151);
    }

    .success {
      background: var(--cc-badge-success-bg, #d1fae5);
      color: var(--cc-badge-success-text, #065f46);
    }

    .warning {
      background: var(--cc-badge-warning-bg, #fef3c7);
      color: var(--cc-badge-warning-text, #92400e);
    }

    .error {
      background: var(--cc-badge-error-bg, #fee2e2);
      color: var(--cc-badge-error-text, #991b1b);
    }

    .info {
      background: var(--cc-badge-info-bg, #dbeafe);
      color: var(--cc-badge-info-text, #1e40af);
    }

    /* Dot indicator */
    .dot {
      width: 8px;
      height: 8px;
      padding: 0;
      border-radius: 50%;
    }

    .dot.small { width: 6px; height: 6px; }
    .dot.large { width: 10px; height: 10px; }

    .icon {
      font-size: 1em;
    }
  `;

  @property({ type: Object })
  component!: BadgeComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  private getContent(): string {
    if (this.component.contentPath) {
      const value = getByPointer(this.dataModel, this.component.contentPath);
      return String(value ?? '');
    }
    return this.component.content ?? '';
  }

  render() {
    const content = this.getContent();
    const variant = this.component.variant ?? 'default';
    const size = this.component.size ?? 'medium';
    const pill = this.component.pill ?? false;
    const dot = this.component.dot ?? false;

    const customStyles: string[] = [];
    if (this.component.color) {
      customStyles.push(`background: ${this.component.color}`);
    }
    if (this.component.textColor) {
      customStyles.push(`color: ${this.component.textColor}`);
    }

    const classes = [
      'badge',
      variant,
      size,
      pill ? 'pill' : '',
      dot ? 'dot' : '',
    ].filter(Boolean).join(' ');

    return html`
      <span class="${classes}" style="${customStyles.join('; ')}">
        ${this.component.icon && !dot ? html`<span class="icon">${this.component.icon}</span>` : ''}
        ${!dot ? content : ''}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-badge': CcBadge;
  }
}
