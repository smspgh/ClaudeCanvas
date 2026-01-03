import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-code-block',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-code-block">
      @if (showHeader) {
        <div class="cc-code-block-header">
          @if (language) { <span class="cc-code-block-language">{{ language }}</span> }
          @if (filename) { <span class="cc-code-block-filename">{{ filename }}</span> }
          @if (showCopyButton) {
            <button class="cc-code-block-copy" (click)="copyCode()">
              {{ copied ? '✓' : '📋' }}
            </button>
          }
        </div>
      }
      <pre class="cc-code-block-pre"><code>{{ code }}</code></pre>
    </div>
  `,
  styles: [`
    .cc-code-block {
      border-radius: 0.5rem;
      overflow: hidden;
      background: #1e293b;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }
    .cc-code-block-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #0f172a;
      border-bottom: 1px solid #334155;
      font-size: 0.75rem;
    }
    .cc-code-block-language {
      background: #334155;
      color: #94a3b8;
      padding: 0.125rem 0.5rem;
      border-radius: 0.25rem;
    }
    .cc-code-block-filename { color: #94a3b8; flex: 1; }
    .cc-code-block-copy {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.25rem;
    }
    .cc-code-block-pre {
      margin: 0;
      padding: 1rem;
      overflow-x: auto;
      color: #e2e8f0;
      font-size: 0.875rem;
      line-height: 1.5;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcCodeBlockComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};

  copied = false;

  get codePath(): string | undefined { return this.component['codePath'] as string; }
  get code(): string {
    if (this.codePath) {
      const v = getByPointer(this.dataModel, this.codePath);
      return v?.toString() ?? '';
    }
    return (this.component['code'] as string) ?? '';
  }
  get language(): string | undefined { return this.component['language'] as string; }
  get filename(): string | undefined { return this.component['filename'] as string; }
  get showCopyButton(): boolean { return (this.component['showCopyButton'] as boolean) ?? true; }
  get showLineNumbers(): boolean { return (this.component['showLineNumbers'] as boolean) ?? false; }
  get showHeader(): boolean { return !!(this.language || this.filename || this.showCopyButton); }

  copyCode(): void {
    navigator.clipboard.writeText(this.code).then(() => {
      this.copied = true;
      setTimeout(() => { this.copied = false; }, 2000);
    });
  }
}
