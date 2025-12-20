import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { DateTimeInputComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

@customElement('cc-datetime-input')
export class CcDateTimeInput extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .datetime-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--cc-text, #333);
    }

    .inputs-row {
      display: flex;
      gap: 0.5rem;
    }

    input {
      flex: 1;
      padding: 0.625rem 0.75rem;
      border: 1px solid var(--cc-border, #d1d5db);
      border-radius: 0.375rem;
      font-size: 0.875rem;
      color: var(--cc-text, #333);
      background: var(--cc-input-bg, white);
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    input:focus {
      outline: none;
      border-color: var(--cc-primary, #6366f1);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    input:disabled {
      background: var(--cc-disabled-bg, #f3f4f6);
      color: var(--cc-disabled-text, #9ca3af);
      cursor: not-allowed;
    }

    input[type="date"] {
      min-width: 140px;
    }

    input[type="time"] {
      min-width: 100px;
    }
  `;

  @property({ type: Object })
  component!: DateTimeInputComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  private getValue(): string {
    const value = getByPointer(this.dataModel, this.component.valuePath);
    if (value != null && typeof value === 'string') {
      return value;
    }
    return '';
  }

  private getDateValue(): string {
    const value = this.getValue();
    if (!value) return '';
    // Handle ISO datetime or just date
    return value.split('T')[0] || '';
  }

  private getTimeValue(): string {
    const value = this.getValue();
    if (!value) return '';
    // Handle ISO datetime
    const timePart = value.split('T')[1];
    if (timePart) {
      // Return HH:MM format
      return timePart.substring(0, 5);
    }
    return '';
  }

  private handleDateChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const dateValue = target.value;
    const timeValue = this.getTimeValue() || '00:00';

    const enableTime = this.component.enableTime ?? false;
    const newValue = enableTime ? `${dateValue}T${timeValue}` : dateValue;

    this.emitChange(newValue);
  }

  private handleTimeChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const timeValue = target.value;
    const dateValue = this.getDateValue() || new Date().toISOString().split('T')[0];

    const newValue = `${dateValue}T${timeValue}`;
    this.emitChange(newValue);
  }

  private emitChange(value: string) {
    const event = new CustomEvent('cc-input', {
      bubbles: true,
      composed: true,
      detail: {
        path: this.component.valuePath,
        value,
      },
    });
    this.dispatchEvent(event);
  }

  render() {
    const enableDate = this.component.enableDate ?? true;
    const enableTime = this.component.enableTime ?? false;
    const id = `datetime-${this.component.valuePath.replace(/\//g, '-')}`;

    return html`
      <div class="datetime-wrapper">
        ${this.component.label
          ? html`<label for=${id}>${this.component.label}</label>`
          : null
        }
        <div class="inputs-row">
          ${enableDate
            ? html`
                <input
                  type="date"
                  id=${id}
                  .value=${this.getDateValue()}
                  min=${this.component.minDate || ''}
                  max=${this.component.maxDate || ''}
                  ?disabled=${this.component.disabled}
                  @change=${this.handleDateChange}
                />
              `
            : null
          }
          ${enableTime
            ? html`
                <input
                  type="time"
                  id=${enableDate ? `${id}-time` : id}
                  .value=${this.getTimeValue()}
                  ?disabled=${this.component.disabled}
                  @change=${this.handleTimeChange}
                />
              `
            : null
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-datetime-input': CcDateTimeInput;
  }
}
