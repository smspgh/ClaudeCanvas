import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { MultipleChoiceComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

@customElement('cc-multiple-choice')
export class CcMultipleChoice extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .multiple-choice-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label.group-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--cc-text, #333);
      margin-bottom: 0.25rem;
    }

    .options-list {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: var(--cc-surface, white);
      border: 1px solid var(--cc-border, #d1d5db);
      border-radius: 0.375rem;
      cursor: pointer;
      transition: background-color 0.15s, border-color 0.15s;
    }

    .option:hover:not(.disabled) {
      background: var(--cc-surface-dim, #f9fafb);
    }

    .option.selected {
      border-color: var(--cc-primary, #6366f1);
      background: rgba(99, 102, 241, 0.05);
    }

    .option.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .option input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      accent-color: var(--cc-primary, #6366f1);
      cursor: inherit;
    }

    .option-label {
      font-size: 0.875rem;
      color: var(--cc-text, #333);
    }

    .selection-info {
      font-size: 0.75rem;
      color: var(--cc-text-secondary, #6b7280);
    }
  `;

  @property({ type: Object })
  component!: MultipleChoiceComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  private getSelectedValues(): string[] {
    const value = getByPointer(this.dataModel, this.component.valuePath);
    if (Array.isArray(value)) {
      return value.filter((v): v is string => typeof v === 'string');
    }
    return [];
  }

  private handleOptionClick(optionValue: string) {
    if (this.component.disabled) return;

    const currentValues = this.getSelectedValues();
    const isSelected = currentValues.includes(optionValue);
    let newValues: string[];

    if (isSelected) {
      // Remove the value
      newValues = currentValues.filter(v => v !== optionValue);
    } else {
      // Add the value (if within max limit)
      const maxSelections = this.component.maxSelections;
      if (maxSelections && currentValues.length >= maxSelections) {
        // At max, don't add more
        return;
      }
      newValues = [...currentValues, optionValue];
    }

    const event = new CustomEvent('cc-input', {
      bubbles: true,
      composed: true,
      detail: {
        path: this.component.valuePath,
        value: newValues,
      },
    });
    this.dispatchEvent(event);
  }

  render() {
    const selectedValues = this.getSelectedValues();
    const options = this.component.options || [];
    const maxSelections = this.component.maxSelections;

    return html`
      <div class="multiple-choice-wrapper">
        ${this.component.label
          ? html`<label class="group-label">${this.component.label}</label>`
          : null
        }
        ${maxSelections
          ? html`<span class="selection-info">Select up to ${maxSelections} options (${selectedValues.length} selected)</span>`
          : null
        }
        <div class="options-list">
          ${options.map(option => {
            const isSelected = selectedValues.includes(option.value);
            const isDisabled = this.component.disabled ||
              (!isSelected && maxSelections && selectedValues.length >= maxSelections);

            return html`
              <div
                class="option ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}"
                @click=${() => this.handleOptionClick(option.value)}
              >
                <input
                  type="checkbox"
                  .checked=${isSelected}
                  ?disabled=${isDisabled}
                  @click=${(e: Event) => e.stopPropagation()}
                  @change=${() => this.handleOptionClick(option.value)}
                />
                <span class="option-label">${option.label}</span>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-multiple-choice': CcMultipleChoice;
  }
}
