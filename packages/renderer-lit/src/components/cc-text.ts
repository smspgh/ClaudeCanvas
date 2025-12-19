import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { TextComponent, TextStyle, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

@customElement('cc-text')
export class CcText extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .heading1 {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1.2;
      margin: 0;
    }

    .heading2 {
      font-size: 1.5rem;
      font-weight: 600;
      line-height: 1.3;
      margin: 0;
    }

    .heading3 {
      font-size: 1.25rem;
      font-weight: 600;
      line-height: 1.4;
      margin: 0;
    }

    .body {
      font-size: 1rem;
      line-height: 1.5;
      margin: 0;
    }

    .caption {
      font-size: 0.875rem;
      color: var(--cc-text-secondary, #666);
      line-height: 1.4;
      margin: 0;
    }

    .code {
      font-family: var(--cc-font-mono, monospace);
      font-size: 0.875rem;
      background: var(--cc-code-bg, #f4f4f4);
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      margin: 0;
    }
  `;

  @property({ type: Object })
  component!: TextComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  private getContent(): string {
    if (this.component.contentPath) {
      const value = getByPointer(this.dataModel, this.component.contentPath);
      return String(value ?? '');
    }
    return this.component.content ?? '';
  }

  private getStyleClass(): TextStyle {
    return this.component.textStyle ?? 'body';
  }

  render() {
    const content = this.getContent();
    const styleClass = this.getStyleClass();

    // For markdown, we'd need a markdown parser - keeping simple for now
    if (this.component.markdown) {
      // Basic markdown-like rendering (simplified)
      const rendered = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
      return html`<p class=${styleClass}>${unsafeHTML(rendered)}</p>`;
    }

    return html`<p class=${styleClass} style=${this.component.color ? `color: ${this.component.color}` : ''}>${content}</p>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-text': CcText;
  }
}
