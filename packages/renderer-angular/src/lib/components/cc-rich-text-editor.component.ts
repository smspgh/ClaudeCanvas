import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-rich-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cc-rte">
      <div class="cc-rte-toolbar">
        @for (tool of toolbar; track tool) {
          <button class="cc-rte-btn" [class.active]="isActive(tool)" (click)="toggleFormat(tool)" [disabled]="disabled">
            {{ getToolIcon(tool) }}
          </button>
        }
      </div>
      <textarea class="cc-rte-content" [value]="content" [placeholder]="placeholder" [disabled]="disabled" [style.min-height.px]="minHeight" (input)="onInput($event)"></textarea>
    </div>
  `,
  styles: [`
    .cc-rte { border: 1px solid #e2e8f0; border-radius: 0.5rem; overflow: hidden; }
    .cc-rte-toolbar { display: flex; gap: 0.25rem; padding: 0.5rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    .cc-rte-btn { padding: 0.25rem 0.5rem; border: none; background: none; cursor: pointer; border-radius: 0.25rem; font-size: 0.875rem; }
    .cc-rte-btn:hover:not(:disabled) { background: #e2e8f0; }
    .cc-rte-btn.active { background: #6366f1; color: white; }
    .cc-rte-content { width: 100%; border: none; padding: 1rem; font-family: inherit; resize: vertical; }
    .cc-rte-content:focus { outline: none; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcRichTextEditorComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();

  activeFormats = new Set<string>();

  get valuePath(): string | undefined { return this.component['valuePath'] as string; }
  get content(): string { return this.valuePath ? (getByPointer(this.dataModel, this.valuePath) as string)?.replace(/<[^>]*>/g, '') ?? '' : ''; }
  get placeholder(): string { return (this.component['placeholder'] as string) ?? ''; }
  get minHeight(): number { return (this.component['minHeight'] as number) ?? 200; }
  get toolbar(): string[] { return (this.component['toolbar'] as string[]) ?? ['bold', 'italic', 'underline']; }
  get disabled(): boolean { return (this.component['disabled'] as boolean) ?? false; }

  isActive(format: string): boolean { return this.activeFormats.has(format); }
  toggleFormat(format: string): void {
    if (this.activeFormats.has(format)) this.activeFormats.delete(format);
    else this.activeFormats.add(format);
  }
  getToolIcon(tool: string): string {
    const icons: Record<string, string> = { bold: 'B', italic: 'I', underline: 'U', heading: 'H', list: '≡', link: '🔗', code: '</>' };
    return icons[tool] ?? tool;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    if (this.valuePath) { this.inputChange.emit({ path: this.valuePath, value: target.value }); }
  }
}
