import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ProgressComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

@customElement('cc-progress')
export class CcProgress extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .progress-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .progress-label {
      font-size: 0.875rem;
      color: var(--cc-text-secondary, #666);
    }

    /* Linear Progress */
    .linear {
      width: 100%;
      height: 8px;
      background: var(--cc-progress-track, #e0e0e0);
      border-radius: 4px;
      overflow: hidden;
    }

    .linear-fill {
      height: 100%;
      background: var(--cc-progress-fill, #6366f1);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .linear-indeterminate .linear-fill {
      width: 30%;
      animation: linear-indeterminate 1.5s ease-in-out infinite;
    }

    @keyframes linear-indeterminate {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(400%); }
    }

    /* Circular Progress */
    .circular {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .circular svg {
      transform: rotate(-90deg);
    }

    .circular-track {
      fill: none;
      stroke: var(--cc-progress-track, #e0e0e0);
    }

    .circular-fill {
      fill: none;
      stroke: var(--cc-progress-fill, #6366f1);
      stroke-linecap: round;
      transition: stroke-dashoffset 0.3s ease;
    }

    .circular-indeterminate .circular-fill {
      animation: circular-indeterminate 1.5s ease-in-out infinite;
    }

    @keyframes circular-indeterminate {
      0% { stroke-dashoffset: 280; transform: rotate(0deg); }
      50% { stroke-dashoffset: 75; }
      100% { stroke-dashoffset: 280; transform: rotate(360deg); }
    }

    .circular-label {
      position: absolute;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--cc-text-primary, #333);
    }

    /* Sizes */
    .small .linear { height: 4px; }
    .medium .linear { height: 8px; }
    .large .linear { height: 12px; }

    .small.circular { width: 32px; height: 32px; }
    .medium.circular { width: 48px; height: 48px; }
    .large.circular { width: 64px; height: 64px; }

    .small .circular-label { font-size: 0.625rem; }
    .medium .circular-label { font-size: 0.75rem; }
    .large .circular-label { font-size: 0.875rem; }
  `;

  @property({ type: Object })
  component!: ProgressComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  private getValue(): number | undefined {
    if (this.component.valuePath) {
      const value = getByPointer(this.dataModel, this.component.valuePath);
      return typeof value === 'number' ? value : undefined;
    }
    return this.component.value;
  }

  private getSize(): string {
    return this.component.size ?? 'medium';
  }

  private getSizePixels(): number {
    const size = this.getSize();
    switch (size) {
      case 'small': return 32;
      case 'large': return 64;
      default: return 48;
    }
  }

  private renderLinear(value: number | undefined) {
    const isIndeterminate = value === undefined;
    const trackColor = this.component.trackColor ?? 'var(--cc-progress-track, #e0e0e0)';
    const fillColor = this.component.color ?? 'var(--cc-progress-fill, #6366f1)';

    return html`
      <div class="linear ${isIndeterminate ? 'linear-indeterminate' : ''}"
           style="background: ${trackColor}">
        <div class="linear-fill"
             style="width: ${isIndeterminate ? '30%' : `${value}%`}; background: ${fillColor}">
        </div>
      </div>
    `;
  }

  private renderCircular(value: number | undefined) {
    const isIndeterminate = value === undefined;
    const size = this.getSizePixels();
    const strokeWidth = size < 40 ? 3 : 4;
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = isIndeterminate ? 0 : circumference - (value! / 100) * circumference;

    const trackColor = this.component.trackColor ?? 'var(--cc-progress-track, #e0e0e0)';
    const fillColor = this.component.color ?? 'var(--cc-progress-fill, #6366f1)';

    return html`
      <div class="circular ${isIndeterminate ? 'circular-indeterminate' : ''}"
           style="width: ${size}px; height: ${size}px">
        <svg width="${size}" height="${size}">
          <circle class="circular-track"
                  cx="${size / 2}" cy="${size / 2}" r="${radius}"
                  stroke-width="${strokeWidth}"
                  style="stroke: ${trackColor}" />
          <circle class="circular-fill"
                  cx="${size / 2}" cy="${size / 2}" r="${radius}"
                  stroke-width="${strokeWidth}"
                  stroke-dasharray="${circumference}"
                  stroke-dashoffset="${offset}"
                  style="stroke: ${fillColor}; transform-origin: center;" />
        </svg>
        ${this.component.showLabel && !isIndeterminate ? html`
          <span class="circular-label">${Math.round(value!)}%</span>
        ` : ''}
      </div>
    `;
  }

  render() {
    const value = this.getValue();
    const variant = this.component.variant ?? 'linear';
    const size = this.getSize();
    const label = this.component.label ?? (this.component.showLabel && value !== undefined ? `${Math.round(value)}%` : '');

    return html`
      <div class="progress-container ${size}">
        ${variant === 'linear' ? this.renderLinear(value) : this.renderCircular(value)}
        ${variant === 'linear' && label ? html`<span class="progress-label">${label}</span>` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-progress': CcProgress;
  }
}
