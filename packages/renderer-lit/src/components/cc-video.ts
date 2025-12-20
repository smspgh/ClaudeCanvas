import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { VideoComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

@customElement('cc-video')
export class CcVideo extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .video-wrapper {
      position: relative;
      width: 100%;
      border-radius: 0.5rem;
      overflow: hidden;
      background: var(--cc-surface-dim, #f3f4f6);
    }

    video {
      width: 100%;
      height: auto;
      display: block;
    }

    .no-source {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: var(--cc-text-secondary, #6b7280);
      font-size: 0.875rem;
    }
  `;

  @property({ type: Object })
  component!: VideoComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  private getSrc(): string | null {
    if (this.component.src) {
      return this.component.src;
    }
    if (this.component.srcPath) {
      const value = getByPointer(this.dataModel, this.component.srcPath);
      if (value != null && typeof value === 'string') {
        return value;
      }
    }
    return null;
  }

  render() {
    const src = this.getSrc();
    const controls = this.component.controls ?? true;

    if (!src) {
      return html`
        <div class="video-wrapper">
          <div class="no-source">No video source</div>
        </div>
      `;
    }

    return html`
      <div class="video-wrapper">
        <video
          src=${src}
          poster=${this.component.poster || ''}
          ?autoplay=${this.component.autoplay}
          ?controls=${controls}
          ?loop=${this.component.loop}
          ?muted=${this.component.muted}
          playsinline
        ></video>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-video': CcVideo;
  }
}
