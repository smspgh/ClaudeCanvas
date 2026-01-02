import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { AvatarComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

@customElement('cc-avatar')
export class CcAvatar extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    .avatar {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: var(--cc-avatar-bg, #e5e7eb);
      color: var(--cc-avatar-text, #374151);
      font-weight: 600;
    }

    .circle { border-radius: 50%; }
    .square { border-radius: 0; }
    .rounded { border-radius: 8px; }

    /* Sizes */
    .small {
      width: 32px;
      height: 32px;
      font-size: 0.75rem;
    }

    .medium {
      width: 40px;
      height: 40px;
      font-size: 0.875rem;
    }

    .large {
      width: 56px;
      height: 56px;
      font-size: 1.25rem;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .initials {
      text-transform: uppercase;
      user-select: none;
    }

    /* Status indicator */
    .status {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 25%;
      height: 25%;
      min-width: 8px;
      min-height: 8px;
      border-radius: 50%;
      border: 2px solid var(--cc-bg, #fff);
    }

    .status.online { background: #22c55e; }
    .status.offline { background: #9ca3af; }
    .status.busy { background: #ef4444; }
    .status.away { background: #f59e0b; }
  `;

  @property({ type: Object })
  component!: AvatarComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  @state()
  private imageError = false;

  private getSrc(): string | undefined {
    if (this.component.srcPath) {
      const value = getByPointer(this.dataModel, this.component.srcPath);
      return typeof value === 'string' ? value : undefined;
    }
    return this.component.src;
  }

  private getInitials(): string {
    if (this.component.initialsPath) {
      const value = getByPointer(this.dataModel, this.component.initialsPath);
      return typeof value === 'string' ? value : '';
    }
    return this.component.initials ?? '';
  }

  private getSizeClass(): string {
    const size = this.component.size;
    if (typeof size === 'number') return '';
    return size ?? 'medium';
  }

  private getCustomSize(): string {
    const size = this.component.size;
    if (typeof size === 'number') {
      return `width: ${size}px; height: ${size}px; font-size: ${size * 0.4}px;`;
    }
    return '';
  }

  private handleImageError() {
    this.imageError = true;
  }

  render() {
    const src = this.getSrc();
    const initials = this.getInitials();
    const shape = this.component.shape ?? 'circle';
    const sizeClass = this.getSizeClass();
    const customSize = this.getCustomSize();
    const showImage = src && !this.imageError;

    const customStyles: string[] = [];
    if (customSize) customStyles.push(customSize);
    if (this.component.color && !showImage) {
      customStyles.push(`background: ${this.component.color}`);
    }

    const classes = [
      'avatar',
      shape,
      sizeClass,
    ].filter(Boolean).join(' ');

    return html`
      <div class="${classes}" style="${customStyles.join('; ')}">
        ${showImage ? html`
          <img src="${src}"
               alt="${this.component.alt ?? ''}"
               @error="${this.handleImageError}" />
        ` : html`
          <span class="initials">${initials}</span>
        `}
        ${this.component.status ? html`
          <span class="status ${this.component.status}"></span>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-avatar': CcAvatar;
  }
}
