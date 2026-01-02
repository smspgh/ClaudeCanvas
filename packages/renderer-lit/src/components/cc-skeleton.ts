import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { SkeletonComponent, DataModel } from '@claude-canvas/core';

@customElement('cc-skeleton')
export class CcSkeleton extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .skeleton {
      background: var(--cc-skeleton-bg, #e5e7eb);
      position: relative;
      overflow: hidden;
    }

    /* Variants */
    .text {
      height: 1em;
      border-radius: 4px;
    }

    .circular {
      border-radius: 50%;
    }

    .rectangular {
      border-radius: 4px;
    }

    /* Animation: Pulse */
    .pulse {
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* Animation: Wave */
    .wave::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.4),
        transparent
      );
      animation: wave 1.5s linear infinite;
    }

    @keyframes wave {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .lines {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .line {
      height: 1em;
      border-radius: 4px;
    }

    .line:last-child {
      width: 60%;
    }
  `;

  @property({ type: Object })
  component!: SkeletonComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  private getWidth(): string {
    const width = this.component.width;
    if (width === undefined) return '100%';
    return typeof width === 'number' ? `${width}px` : width;
  }

  private getHeight(): string {
    const variant = this.component.variant ?? 'rectangular';
    const height = this.component.height;

    if (height !== undefined) {
      return typeof height === 'number' ? `${height}px` : height;
    }

    // Default heights based on variant
    switch (variant) {
      case 'text': return '1em';
      case 'circular': return this.getWidth();
      default: return '100px';
    }
  }

  render() {
    const variant = this.component.variant ?? 'rectangular';
    const animation = this.component.animation ?? 'pulse';
    const lines = this.component.lines ?? 1;
    const width = this.getWidth();
    const height = this.getHeight();

    // For text variant with multiple lines
    if (variant === 'text' && lines > 1) {
      return html`
        <div class="lines" style="width: ${width}">
          ${Array.from({ length: lines }, (_, i) => html`
            <div class="skeleton line ${animation}"
                 style="height: ${height}"></div>
          `)}
        </div>
      `;
    }

    return html`
      <div class="skeleton ${variant} ${animation}"
           style="width: ${width}; height: ${height}">
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-skeleton': CcSkeleton;
  }
}
