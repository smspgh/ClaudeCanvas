import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type {
  Surface,
  Component,
  DataModel,
  AgentToClientMessage,
  UserActionMessage,
  Action,
  VisibilityCondition,
} from '@claude-canvas/core';
import { setByPointer, getByPointer, generateId } from '@claude-canvas/core';

// Import all components
import './components/index.js';

@customElement('cc-surface')
export class CcSurface extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--cc-font, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
      color: var(--cc-text, #333);
    }

    .surface {
      padding: 1rem;
    }

    .surface-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 1rem 0;
    }
  `;

  @property({ type: Object })
  surface: Surface | null = null;

  @state()
  private dataModel: DataModel = {};

  /**
   * Process a message from the agent
   */
  processMessage(message: AgentToClientMessage): void {
    switch (message.type) {
      case 'surfaceUpdate':
        this.surface = message.surface;
        break;
      case 'dataModelUpdate':
        this.dataModel = setByPointer(this.dataModel, message.path, message.data);
        break;
      case 'deleteSurface':
        if (this.surface?.id === message.surfaceId) {
          this.surface = null;
        }
        break;
    }
  }

  /**
   * Process multiple messages from the agent
   */
  processMessages(messages: AgentToClientMessage[]): void {
    for (const message of messages) {
      this.processMessage(message);
    }
  }

  /**
   * Update the data model directly
   */
  updateDataModel(path: string, value: unknown): void {
    this.dataModel = setByPointer(this.dataModel, path, value);
  }

  private handleAction(e: CustomEvent<{ action: Action; dataModel: DataModel }>) {
    const { action } = e.detail;

    // Handle update/updateData action locally - used for modal open/close, etc.
    if ((action.type === 'updateData' || action.type === 'update') && action.path !== undefined) {
      this.dataModel = setByPointer(this.dataModel, action.path, action.value);
      return;
    }

    const userAction: UserActionMessage = {
      type: 'userAction',
      surfaceId: this.surface?.id ?? '',
      action,
      dataModel: this.dataModel,
    };

    this.dispatchEvent(new CustomEvent('cc-user-action', {
      bubbles: true,
      composed: true,
      detail: userAction,
    }));
  }

  private handleInput(e: CustomEvent<{ path: string; value: unknown }>) {
    const { path, value } = e.detail;
    this.dataModel = setByPointer(this.dataModel, path, value);
  }

  private isVisible(component: Component): boolean {
    if (!component.visibleIf) return true;

    // Simple string path - truthy check
    if (typeof component.visibleIf === 'string') {
      const value = getByPointer(this.dataModel, component.visibleIf);
      return Boolean(value);
    }

    // Object syntax with comparison operators
    const condition = component.visibleIf as VisibilityCondition;
    const value = getByPointer(this.dataModel, condition.path);

    if (condition.eq !== undefined) return value === condition.eq;
    if (condition.neq !== undefined) return value !== condition.neq;
    if (condition.gt !== undefined) return typeof value === 'number' && value > condition.gt;
    if (condition.gte !== undefined) return typeof value === 'number' && value >= condition.gte;
    if (condition.lt !== undefined) return typeof value === 'number' && value < condition.lt;
    if (condition.lte !== undefined) return typeof value === 'number' && value <= condition.lte;

    // Default to truthy check if no operator specified
    return Boolean(value);
  }

  private renderComponent(component: Component): TemplateResult | typeof nothing {
    if (!this.isVisible(component)) return nothing;

    const id = component.id ?? generateId();

    switch (component.component) {
      case 'Text':
        return html`<cc-text .component=${component} .dataModel=${this.dataModel}></cc-text>`;

      case 'Button':
        return html`<cc-button .component=${component} .dataModel=${this.dataModel}></cc-button>`;

      case 'TextField':
        return html`<cc-text-field .component=${component} .dataModel=${this.dataModel}></cc-text-field>`;

      case 'Checkbox':
        return html`<cc-checkbox .component=${component} .dataModel=${this.dataModel}></cc-checkbox>`;

      case 'Select':
        return html`<cc-select .component=${component} .dataModel=${this.dataModel}></cc-select>`;

      case 'Slider':
        return html`<cc-slider .component=${component} .dataModel=${this.dataModel}></cc-slider>`;

      case 'DateTimeInput':
        return html`<cc-datetime-input .component=${component} .dataModel=${this.dataModel}></cc-datetime-input>`;

      case 'Video':
        return html`<cc-video .component=${component} .dataModel=${this.dataModel}></cc-video>`;

      case 'AudioPlayer':
        return html`<cc-audio-player .component=${component} .dataModel=${this.dataModel}></cc-audio-player>`;

      case 'MultipleChoice':
        return html`<cc-multiple-choice .component=${component} .dataModel=${this.dataModel}></cc-multiple-choice>`;

      case 'Chart':
        return html`<cc-chart .component=${component} .dataModel=${this.dataModel}></cc-chart>`;

      case 'DataTable':
        return html`<cc-data-table .component=${component} .dataModel=${this.dataModel}></cc-data-table>`;

      case 'RichTextEditor':
        return html`<cc-rich-text-editor .component=${component} .dataModel=${this.dataModel}></cc-rich-text-editor>`;

      case 'Image':
        return html`<cc-image .component=${component} .dataModel=${this.dataModel}></cc-image>`;

      case 'Icon':
        return html`<cc-icon .component=${component} .dataModel=${this.dataModel}></cc-icon>`;

      case 'Row':
        return html`
          <cc-row .component=${component} .dataModel=${this.dataModel}>
            ${component.children.map(child => this.renderComponent(child))}
          </cc-row>
        `;

      case 'Column':
        return html`
          <cc-column .component=${component} .dataModel=${this.dataModel}>
            ${component.children.map(child => this.renderComponent(child))}
          </cc-column>
        `;

      case 'Card':
        return html`
          <cc-card .component=${component} .dataModel=${this.dataModel}>
            ${component.children.map(child => this.renderComponent(child))}
          </cc-card>
        `;

      case 'Divider':
        return html`<hr style=${component.vertical ? 'width: 1px; height: 100%; margin: 0 0.5rem;' : ''} />`;

      case 'Modal':
        return html`
          <cc-modal .component=${component} .dataModel=${this.dataModel}>
            ${component.children.map(child => this.renderComponent(child))}
          </cc-modal>
        `;

      case 'Tabs': {
        const activeTabValue = getByPointer(this.dataModel, component.valuePath) as string | undefined;
        const activeTab = activeTabValue ?? component.tabs[0]?.value;
        const activeTabData = component.tabs.find(tab => tab.value === activeTab);
        return html`
          <cc-tabs .component=${component} .dataModel=${this.dataModel}>
            ${activeTabData ? activeTabData.children.map(child => this.renderComponent(child)) : nothing}
          </cc-tabs>
        `;
      }

      case 'Progress':
        return html`<cc-progress .component=${component} .dataModel=${this.dataModel}></cc-progress>`;

      case 'Badge':
        return html`<cc-badge .component=${component} .dataModel=${this.dataModel}></cc-badge>`;

      case 'Avatar':
        return html`<cc-avatar .component=${component} .dataModel=${this.dataModel}></cc-avatar>`;

      case 'Toast':
        return html`<cc-toast .component=${component} .dataModel=${this.dataModel}></cc-toast>`;

      case 'Accordion':
        return html`
          <cc-accordion .component=${component} .dataModel=${this.dataModel}>
            ${component.items.map(item =>
              item.children.map(child => this.renderComponent(child))
            )}
          </cc-accordion>
        `;

      case 'Skeleton':
        return html`<cc-skeleton .component=${component} .dataModel=${this.dataModel}></cc-skeleton>`;

      case 'Alert':
        return html`<cc-alert .component=${component} .dataModel=${this.dataModel}></cc-alert>`;

      case 'Tooltip':
        return html`
          <cc-tooltip .component=${component} .dataModel=${this.dataModel}>
            ${component.children.map(child => this.renderComponent(child))}
          </cc-tooltip>
        `;

      default:
        console.warn(`Unknown component type: ${(component as Component).component}`);
        return nothing;
    }
  }

  render() {
    if (!this.surface) {
      return html`<div class="surface"><slot></slot></div>`;
    }

    return html`
      <div class="surface" @cc-action=${this.handleAction} @cc-input=${this.handleInput}>
        ${this.surface.title ? html`<h2 class="surface-title">${this.surface.title}</h2>` : nothing}
        ${this.surface.components.map(component => this.renderComponent(component))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-surface': CcSurface;
  }
}
