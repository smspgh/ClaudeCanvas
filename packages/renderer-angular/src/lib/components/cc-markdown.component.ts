import { Component, Input, ChangeDetectionStrategy, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-markdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-markdown" [innerHTML]="renderedHtml"></div>
  `,
  styles: [`
    .cc-markdown { line-height: 1.6; }
    :host ::ng-deep .cc-markdown h1 { font-size: 2rem; font-weight: 700; margin: 1rem 0; }
    :host ::ng-deep .cc-markdown h2 { font-size: 1.5rem; font-weight: 600; margin: 0.875rem 0; }
    :host ::ng-deep .cc-markdown h3 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0; }
    :host ::ng-deep .cc-markdown p { margin: 0.5rem 0; }
    :host ::ng-deep .cc-markdown ul, :host ::ng-deep .cc-markdown ol { margin: 0.5rem 0; padding-left: 1.5rem; }
    :host ::ng-deep .cc-markdown li { margin: 0.25rem 0; }
    :host ::ng-deep .cc-markdown code { background: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace; }
    :host ::ng-deep .cc-markdown pre { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
    :host ::ng-deep .cc-markdown pre code { background: transparent; padding: 0; }
    :host ::ng-deep .cc-markdown blockquote { border-left: 4px solid #d1d5db; padding-left: 1rem; margin: 0.5rem 0; color: #6b7280; }
    :host ::ng-deep .cc-markdown a { color: #6366f1; text-decoration: underline; }
    :host ::ng-deep .cc-markdown hr { border: none; border-top: 1px solid #e5e7eb; margin: 1rem 0; }
    :host ::ng-deep .cc-markdown table { border-collapse: collapse; width: 100%; margin: 0.5rem 0; }
    :host ::ng-deep .cc-markdown th, :host ::ng-deep .cc-markdown td { border: 1px solid #e5e7eb; padding: 0.5rem; text-align: left; }
    :host ::ng-deep .cc-markdown th { background: #f9fafb; font-weight: 600; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcMarkdownComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};

  constructor(private sanitizer: DomSanitizer) {}

  get contentPath(): string | undefined { return this.component['contentPath'] as string; }
  get content(): string {
    if (this.contentPath) {
      const v = getByPointer(this.dataModel, this.contentPath);
      return v?.toString() ?? '';
    }
    return (this.component['content'] as string) ?? '';
  }

  get renderedHtml(): SafeHtml {
    const html = this.parseMarkdown(this.content);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Simple markdown parser - for production use a library like marked
   */
  private parseMarkdown(md: string): string {
    let html = md
      // Escape HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Bold and italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<')) {
      html = `<p>${html}</p>`;
    }

    return html;
  }
}
