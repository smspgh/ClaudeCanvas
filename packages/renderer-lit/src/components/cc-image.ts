import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { ImageComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

@customElement('cc-image')
export class CcImage extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .image-wrapper {
      overflow: hidden;
      border-radius: var(--cc-image-radius, 0.375rem);
    }

    img {
      display: block;
      width: 100%;
      height: auto;
    }

    img.cover {
      object-fit: cover;
    }

    img.contain {
      object-fit: contain;
    }

    img.fill {
      object-fit: fill;
    }

    img.none {
      object-fit: none;
    }

    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background-color: var(--cc-placeholder-bg, #f3f4f6);
      color: var(--cc-text-secondary, #666);
      min-height: 100px;
      font-size: 0.875rem;
      padding: 1rem;
    }

    .placeholder svg {
      opacity: 0.5;
    }
  `;

  @property({ type: Object })
  component!: ImageComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  @state()
  private imageError = false;

  private getSrc(): string | null {
    if (this.component.src) {
      return this.component.src;
    }
    if (this.component.srcPath) {
      const value = getByPointer(this.dataModel, this.component.srcPath);
      return value != null ? String(value) : null;
    }
    return null;
  }

  private handleError() {
    this.imageError = true;
  }

  private handleLoad() {
    this.imageError = false;
  }

  private renderPlaceholder(message: string) {
    return html`
      <div class="image-wrapper">
        <div class="placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>${message}</span>
        </div>
      </div>
    `;
  }

  render() {
    const src = this.getSrc();
    const fit = this.component.fit ?? 'cover';
    const alt = this.component.alt ?? '';

    if (!src) {
      return this.renderPlaceholder('No image');
    }

    if (this.imageError) {
      return this.renderPlaceholder(alt || 'Image not available');
    }

    return html`
      <div class="image-wrapper">
        <img
          src=${src}
          alt=${alt}
          class=${fit}
          loading="lazy"
          @error=${this.handleError}
          @load=${this.handleLoad}
        />
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-image': CcImage;
  }
}
