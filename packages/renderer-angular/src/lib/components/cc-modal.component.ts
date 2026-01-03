import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel, Action } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="cc-modal-backdrop" (click)="dismissible && close()">
        <div class="cc-modal-content" [class]="sizeClass" (click)="$event.stopPropagation()">
          @if (title || dismissible) {
            <div class="cc-modal-header">
              @if (title) {
                <h3 class="cc-modal-title">{{ title }}</h3>
              }
              @if (dismissible) {
                <button class="cc-modal-close" (click)="close()">&times;</button>
              }
            </div>
          }
          <div class="cc-modal-body">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .cc-modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .cc-modal-content {
      background: white; border-radius: 0.75rem; padding: 1.5rem;
      max-height: 90vh; overflow-y: auto;
    }
    .cc-modal-small { width: 400px; max-width: 90vw; }
    .cc-modal-medium { width: 600px; max-width: 90vw; }
    .cc-modal-large { width: 800px; max-width: 90vw; }
    .cc-modal-fullscreen { width: 100vw; height: 100vh; max-width: none; border-radius: 0; }
    .cc-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .cc-modal-title { font-size: 1.25rem; font-weight: 600; margin: 0; }
    .cc-modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcModalComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();
  @Output() action = new EventEmitter<Action>();

  get openPath(): string | undefined { return this.component['openPath'] as string; }
  get isOpen(): boolean {
    return this.openPath ? getByPointer(this.dataModel, this.openPath) === true : false;
  }
  get title(): string | undefined { return this.component['title'] as string; }
  get size(): string { return (this.component['size'] as string) ?? 'medium'; }
  get dismissible(): boolean { return (this.component['dismissible'] as boolean) ?? true; }
  get sizeClass(): string { return `cc-modal-${this.size}`; }

  close(): void {
    if (this.openPath) {
      this.inputChange.emit({ path: this.openPath, value: false });
    }
  }
}
