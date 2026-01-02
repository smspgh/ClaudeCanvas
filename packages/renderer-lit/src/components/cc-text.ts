import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { TextComponent, TextStyle, DataModel } from '@claude-canvas/core';
import { getByPointer, evaluateExpression } from '@claude-canvas/core';

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
      overflow-wrap: break-word;
      word-break: break-word;
    }

    .heading2 {
      font-size: 1.5rem;
      font-weight: 600;
      line-height: 1.3;
      margin: 0;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    .heading3 {
      font-size: 1.25rem;
      font-weight: 600;
      line-height: 1.4;
      margin: 0;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    .body {
      font-size: 1rem;
      line-height: 1.5;
      margin: 0;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    .caption {
      font-size: 0.875rem;
      color: var(--cc-text-secondary, #666);
      line-height: 1.4;
      margin: 0;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    .code {
      font-family: var(--cc-font-mono, monospace);
      font-size: 0.875rem;
      background: var(--cc-code-bg, #f4f4f4);
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      margin: 0;
      overflow-wrap: break-word;
      word-break: break-word;
    }
  `;

  @property({ type: Object })
  component!: TextComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  private getContent(): string {
    if (this.component.contentPath) {
      let value = getByPointer(this.dataModel, this.component.contentPath);
      if (this.component.contentExpr) {
        value = evaluateExpression(this.component.contentExpr, value);
      }
      return String(value ?? '');
    }
    return this.component.content ?? '';
  }

  private getStyleClass(): TextStyle {
    return this.component.textStyle ?? 'body';
  }

  private getInlineStyle(): string {
    const styles: string[] = [];
    const componentStyle = this.component.style as Record<string, unknown> | undefined;

    // Check both component.color and style.color
    const color = this.component.color ?? componentStyle?.color;
    if (color) {
      styles.push(`color: ${color}`);
    }

    // Apply fontWeight from style
    if (componentStyle?.fontWeight) {
      styles.push(`font-weight: ${componentStyle.fontWeight}`);
    }

    // Apply fontSize from style
    if (componentStyle?.fontSize) {
      const fontSize = typeof componentStyle.fontSize === 'number'
        ? `${componentStyle.fontSize}px`
        : componentStyle.fontSize;
      styles.push(`font-size: ${fontSize}`);
    }

    // Apply textAlign from style
    if (componentStyle?.textAlign) {
      styles.push(`text-align: ${componentStyle.textAlign}`);
    }

    return styles.join('; ');
  }

  render() {
    const content = this.getContent();
    const styleClass = this.getStyleClass();
    const inlineStyle = this.getInlineStyle();

    // For markdown, we'd need a markdown parser - keeping simple for now
    if (this.component.markdown) {
      // Basic markdown-like rendering (simplified)
      const rendered = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
      return html`<p class=${styleClass} style=${inlineStyle}>${unsafeHTML(rendered)}</p>`;
    }

    return html`<p class=${styleClass} style=${inlineStyle}>${content}</p>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-text': CcText;
  }
}
