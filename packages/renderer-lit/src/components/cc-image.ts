import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
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
      align-items: center;
      justify-content: center;
      background-color: var(--cc-placeholder-bg, #f3f4f6);
      color: var(--cc-text-secondary, #666);
      min-height: 100px;
      font-size: 0.875rem;
    }
  `;

  @property({ type: Object })
  component!: ImageComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

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

  render() {
    const src = this.getSrc();
    const fit = this.component.fit ?? 'cover';
    const alt = this.component.alt ?? '';

    if (!src) {
      return html`
        <div class="image-wrapper">
          <div class="placeholder">No image</div>
        </div>
      `;
    }

    return html`
      <div class="image-wrapper">
        <img
          src=${src}
          alt=${alt}
          class=${fit}
          loading="lazy"
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
