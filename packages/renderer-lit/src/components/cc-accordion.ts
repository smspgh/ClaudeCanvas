import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { AccordionComponent, AccordionItem, DataModel } from '@claude-canvas/core';
import { getByPointer, setByPointer } from '@claude-canvas/core';

@customElement('cc-accordion')
export class CcAccordion extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .accordion {
      display: flex;
      flex-direction: column;
    }

    .accordion.bordered {
      border: 1px solid var(--cc-border, #e5e7eb);
      border-radius: 8px;
      overflow: hidden;
    }

    .accordion.separated {
      gap: 8px;
    }

    .accordion-item {
      border-bottom: 1px solid var(--cc-border, #e5e7eb);
    }

    .accordion.bordered .accordion-item:last-child {
      border-bottom: none;
    }

    .accordion.separated .accordion-item {
      border: 1px solid var(--cc-border, #e5e7eb);
      border-radius: 8px;
      overflow: hidden;
    }

    .accordion-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--cc-accordion-header-bg, transparent);
      border: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      transition: background 0.2s;
    }

    .accordion-header:hover {
      background: var(--cc-accordion-header-hover, rgba(0, 0, 0, 0.04));
    }

    .accordion-header:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .accordion-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .accordion-title-section {
      flex: 1;
    }

    .accordion-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--cc-text-primary, #111827);
      margin: 0;
    }

    .accordion-subtitle {
      font-size: 0.875rem;
      color: var(--cc-text-secondary, #6b7280);
      margin: 4px 0 0 0;
    }

    .accordion-chevron {
      font-size: 1rem;
      color: var(--cc-text-secondary, #6b7280);
      transition: transform 0.2s;
    }

    .accordion-chevron.expanded {
      transform: rotate(180deg);
    }

    .accordion-content {
      overflow: hidden;
      max-height: 0;
      transition: max-height 0.3s ease-out;
    }

    .accordion-content.expanded {
      max-height: 1000px;
    }

    .accordion-content-inner {
      padding: 0 16px 16px 16px;
    }
  `;

  @property({ type: Object })
  component!: AccordionComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  @state()
  private localExpanded: Set<string> = new Set();

  connectedCallback() {
    super.connectedCallback();
    // Initialize with default expanded items
    this.component.items.forEach(item => {
      if (item.defaultExpanded) {
        this.localExpanded.add(item.id);
      }
    });
  }

  private getExpanded(): Set<string> {
    if (this.component.expandedPath) {
      const value = getByPointer(this.dataModel, this.component.expandedPath);
      if (Array.isArray(value)) {
        return new Set(value);
      }
    }
    return this.localExpanded;
  }

  private toggleItem(itemId: string) {
    const expanded = this.getExpanded();
    const allowMultiple = this.component.allowMultiple ?? false;

    let newExpanded: Set<string>;
    if (expanded.has(itemId)) {
      newExpanded = new Set(expanded);
      newExpanded.delete(itemId);
    } else {
      if (allowMultiple) {
        newExpanded = new Set(expanded);
        newExpanded.add(itemId);
      } else {
        newExpanded = new Set([itemId]);
      }
    }

    if (this.component.expandedPath) {
      this.dispatchEvent(new CustomEvent('cc-action', {
        bubbles: true,
        composed: true,
        detail: {
          action: { type: 'update', path: this.component.expandedPath, value: Array.from(newExpanded) },
          dataModel: this.dataModel,
        },
      }));
    } else {
      this.localExpanded = newExpanded;
      this.requestUpdate();
    }
  }

  private renderItem(item: AccordionItem) {
    const expanded = this.getExpanded();
    const isExpanded = expanded.has(item.id);

    return html`
      <div class="accordion-item">
        <button
          class="accordion-header"
          ?disabled="${item.disabled}"
          @click="${() => this.toggleItem(item.id)}"
        >
          ${item.icon ? html`<span class="accordion-icon">${item.icon}</span>` : ''}
          <div class="accordion-title-section">
            <p class="accordion-title">${item.title}</p>
            ${item.subtitle ? html`<p class="accordion-subtitle">${item.subtitle}</p>` : ''}
          </div>
          <span class="accordion-chevron ${isExpanded ? 'expanded' : ''}">▼</span>
        </button>
        <div class="accordion-content ${isExpanded ? 'expanded' : ''}">
          <div class="accordion-content-inner">
            <slot name="${item.id}"></slot>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const variant = this.component.variant ?? 'default';

    return html`
      <div class="accordion ${variant}">
        ${this.component.items.map(item => this.renderItem(item))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-accordion': CcAccordion;
  }
}
