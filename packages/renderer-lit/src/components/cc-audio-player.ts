import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { AudioPlayerComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

@customElement('cc-audio-player')
export class CcAudioPlayer extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .audio-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem;
      background: var(--cc-surface-dim, #f3f4f6);
      border-radius: 0.5rem;
    }

    .audio-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--cc-text, #333);
    }

    audio {
      width: 100%;
      height: 40px;
    }

    .no-source {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      color: var(--cc-text-secondary, #6b7280);
      font-size: 0.875rem;
    }
  `;

  @property({ type: Object })
  component!: AudioPlayerComponent;

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
        <div class="audio-wrapper">
          <div class="no-source">No audio source</div>
        </div>
      `;
    }

    return html`
      <div class="audio-wrapper">
        ${this.component.title
          ? html`<div class="audio-title">${this.component.title}</div>`
          : null
        }
        <audio
          src=${src}
          ?autoplay=${this.component.autoplay}
          ?controls=${controls}
          ?loop=${this.component.loop}
        ></audio>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-audio-player': CcAudioPlayer;
  }
}
