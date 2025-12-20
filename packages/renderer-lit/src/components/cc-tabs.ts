import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { TabsComponent, DataModel, Component } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

@customElement('cc-tabs')
export class CcTabs extends LitElement {
  static styles = css`
    :host {
      display: block;
      align-self: stretch;
    }

    .tabs {
      display: flex;
      flex-direction: column;
    }

    .tabs-list {
      display: flex;
      gap: 0;
      border-bottom: 1px solid var(--cc-border, #e5e5e5);
      margin-bottom: 1rem;
    }

    .tab {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--cc-text-secondary, #666);
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
      font-family: inherit;
    }

    .tab:hover:not(:disabled) {
      color: var(--cc-text, #333);
    }

    .tab.active {
      color: var(--cc-primary, #6366f1);
      border-bottom-color: var(--cc-primary, #6366f1);
    }

    .tab.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .tab-icon {
      display: inline-flex;
      font-size: 1rem;
    }

    .tabs-panel {
      flex: 1;
    }
  `;

  @property({ type: Object })
  component!: TabsComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  @property({ attribute: false })
  renderChild?: (component: Component) => TemplateResult | typeof nothing;

  private get activeTab(): string {
    const value = getByPointer(this.dataModel, this.component.valuePath) as string | undefined;
    return value ?? this.component.tabs[0]?.value ?? '';
  }

  private handleTabClick(value: string, disabled?: boolean) {
    if (disabled) return;

    this.dispatchEvent(new CustomEvent('cc-input', {
      bubbles: true,
      composed: true,
      detail: {
        path: this.component.valuePath,
        value,
      },
    }));
  }

  render() {
    const activeTabData = this.component.tabs.find(tab => tab.value === this.activeTab);

    return html`
      <div class="tabs">
        <div class="tabs-list" role="tablist">
          ${this.component.tabs.map(tab => {
            const classes = {
              tab: true,
              active: tab.value === this.activeTab,
              disabled: tab.disabled ?? false,
            };
            return html`
              <button
                role="tab"
                aria-selected=${tab.value === this.activeTab}
                aria-controls="cc-tabpanel-${tab.value}"
                class=${classMap(classes)}
                @click=${() => this.handleTabClick(tab.value, tab.disabled)}
                ?disabled=${tab.disabled}
              >
                ${tab.icon ? html`<span class="tab-icon">${tab.icon}</span>` : nothing}
                ${tab.label}
              </button>
            `;
          })}
        </div>
        <div
          class="tabs-panel"
          role="tabpanel"
          id="cc-tabpanel-${this.activeTab}"
        >
          <slot></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-tabs': CcTabs;
  }
}
