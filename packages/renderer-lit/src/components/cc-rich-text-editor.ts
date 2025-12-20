import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import type { RichTextEditorComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

type ToolbarItem = 'bold' | 'italic' | 'underline' | 'strike' | 'heading' | 'list' | 'link' | 'image' | 'code';

const DEFAULT_TOOLBAR: ToolbarItem[] = ['bold', 'italic', 'underline', 'heading', 'list', 'link', 'code'];

@customElement('cc-rich-text-editor')
export class CcRichTextEditor extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .editor-wrapper {
      border: 1px solid var(--cc-border, #d1d5db);
      border-radius: 0.5rem;
      overflow: hidden;
      background: var(--cc-surface, white);
    }

    .editor-wrapper.disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      padding: 0.5rem;
      border-bottom: 1px solid var(--cc-border, #e5e7eb);
      background: var(--cc-surface-dim, #f9fafb);
    }

    .toolbar-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--cc-text-secondary, #6b7280);
      transition: background-color 0.15s, color 0.15s;
    }

    .toolbar-btn:hover {
      background: var(--cc-border, #e5e7eb);
      color: var(--cc-text, #333);
    }

    .toolbar-btn.active {
      background: var(--cc-primary, #6366f1);
      color: white;
    }

    .toolbar-divider {
      width: 1px;
      height: 24px;
      margin: 4px 0.25rem;
      background: var(--cc-border, #d1d5db);
    }

    .editor-content {
      min-height: 150px;
      padding: 1rem;
      outline: none;
      font-size: 0.875rem;
      line-height: 1.6;
      color: var(--cc-text, #333);
    }

    .editor-content:empty::before {
      content: attr(data-placeholder);
      color: var(--cc-text-secondary, #9ca3af);
      pointer-events: none;
    }

    .editor-content h1 { font-size: 1.5rem; font-weight: 700; margin: 0.5em 0; }
    .editor-content h2 { font-size: 1.25rem; font-weight: 600; margin: 0.5em 0; }
    .editor-content h3 { font-size: 1.125rem; font-weight: 600; margin: 0.5em 0; }
    .editor-content p { margin: 0.5em 0; }
    .editor-content ul, .editor-content ol { margin: 0.5em 0; padding-left: 1.5em; }
    .editor-content li { margin: 0.25em 0; }
    .editor-content a { color: var(--cc-primary, #6366f1); }
    .editor-content code {
      background: var(--cc-surface-dim, #f3f4f6);
      padding: 0.125em 0.375em;
      border-radius: 0.25rem;
      font-family: monospace;
      font-size: 0.9em;
    }
    .editor-content pre {
      background: var(--cc-surface-dim, #f3f4f6);
      padding: 1em;
      border-radius: 0.5rem;
      overflow-x: auto;
    }
    .editor-content pre code {
      background: none;
      padding: 0;
    }
  `;

  @property({ type: Object })
  component!: RichTextEditorComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  @query('.editor-content')
  private editorEl!: HTMLDivElement;

  @state()
  private activeFormats: Set<string> = new Set();

  private getValue(): string {
    const value = getByPointer(this.dataModel, this.component.valuePath);
    if (value != null && typeof value === 'string') {
      return value;
    }
    return '';
  }

  private getToolbar(): ToolbarItem[] {
    return this.component.toolbar || DEFAULT_TOOLBAR;
  }

  private updateActiveFormats() {
    const formats = new Set<string>();

    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('strikeThrough')) formats.add('strike');
    if (document.queryCommandState('insertUnorderedList')) formats.add('list');

    this.activeFormats = formats;
  }

  private execCommand(command: string, value?: string) {
    document.execCommand(command, false, value);
    this.updateActiveFormats();
    this.emitChange();
  }

  private handleBold() {
    this.execCommand('bold');
  }

  private handleItalic() {
    this.execCommand('italic');
  }

  private handleUnderline() {
    this.execCommand('underline');
  }

  private handleStrike() {
    this.execCommand('strikeThrough');
  }

  private handleHeading() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const parent = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as Element;

      // Cycle through heading levels
      if (parent?.closest('h1')) {
        this.execCommand('formatBlock', 'h2');
      } else if (parent?.closest('h2')) {
        this.execCommand('formatBlock', 'h3');
      } else if (parent?.closest('h3')) {
        this.execCommand('formatBlock', 'p');
      } else {
        this.execCommand('formatBlock', 'h1');
      }
    }
  }

  private handleList() {
    this.execCommand('insertUnorderedList');
  }

  private handleLink() {
    const url = prompt('Enter URL:');
    if (url) {
      this.execCommand('createLink', url);
    }
  }

  private handleImage() {
    const url = prompt('Enter image URL:');
    if (url) {
      this.execCommand('insertImage', url);
    }
  }

  private handleCode() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const selectedText = selection.toString();
      if (selectedText) {
        const code = document.createElement('code');
        code.textContent = selectedText;
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(code);
        this.emitChange();
      }
    }
  }

  private handleInput() {
    this.updateActiveFormats();
    this.emitChange();
  }

  private handleSelectionChange() {
    this.updateActiveFormats();
  }

  private emitChange() {
    if (!this.editorEl) return;

    const event = new CustomEvent('cc-input', {
      bubbles: true,
      composed: true,
      detail: {
        path: this.component.valuePath,
        value: this.editorEl.innerHTML,
      },
    });
    this.dispatchEvent(event);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('selectionchange', this.handleSelectionChange.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('selectionchange', this.handleSelectionChange.bind(this));
  }

  firstUpdated() {
    if (this.editorEl) {
      this.editorEl.innerHTML = this.getValue();
    }
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('dataModel') && this.editorEl) {
      const value = this.getValue();
      if (this.editorEl.innerHTML !== value) {
        this.editorEl.innerHTML = value;
      }
    }
  }

  private renderToolbarButton(item: ToolbarItem) {
    const isActive = this.activeFormats.has(item);
    const labels: Record<ToolbarItem, string> = {
      bold: 'B',
      italic: 'I',
      underline: 'U',
      strike: 'S',
      heading: 'H',
      list: '☰',
      link: '🔗',
      image: '🖼',
      code: '</>',
    };

    const handlers: Record<ToolbarItem, () => void> = {
      bold: () => this.handleBold(),
      italic: () => this.handleItalic(),
      underline: () => this.handleUnderline(),
      strike: () => this.handleStrike(),
      heading: () => this.handleHeading(),
      list: () => this.handleList(),
      link: () => this.handleLink(),
      image: () => this.handleImage(),
      code: () => this.handleCode(),
    };

    return html`
      <button
        class="toolbar-btn ${isActive ? 'active' : ''}"
        @click=${handlers[item]}
        title=${item.charAt(0).toUpperCase() + item.slice(1)}
      >
        ${labels[item]}
      </button>
    `;
  }

  render() {
    const toolbar = this.getToolbar();
    const minHeight = this.component.minHeight || 150;

    // Group toolbar items
    const formatItems = toolbar.filter(t => ['bold', 'italic', 'underline', 'strike'].includes(t));
    const blockItems = toolbar.filter(t => ['heading', 'list'].includes(t));
    const insertItems = toolbar.filter(t => ['link', 'image', 'code'].includes(t));

    return html`
      <div class="editor-wrapper ${this.component.disabled ? 'disabled' : ''}">
        <div class="toolbar">
          ${formatItems.map(item => this.renderToolbarButton(item))}
          ${formatItems.length > 0 && blockItems.length > 0 ? html`<div class="toolbar-divider"></div>` : nothing}
          ${blockItems.map(item => this.renderToolbarButton(item))}
          ${blockItems.length > 0 && insertItems.length > 0 ? html`<div class="toolbar-divider"></div>` : nothing}
          ${insertItems.map(item => this.renderToolbarButton(item))}
        </div>
        <div
          class="editor-content"
          contenteditable=${!this.component.disabled}
          data-placeholder=${this.component.placeholder || 'Start typing...'}
          style="min-height: ${minHeight}px"
          @input=${this.handleInput}
        ></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-rich-text-editor': CcRichTextEditor;
  }
}
