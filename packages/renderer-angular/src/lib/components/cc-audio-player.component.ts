import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-audio-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-audio">
      @if (title) { <div class="cc-audio-title">{{ title }}</div> }
      @if (src) {
        <audio [src]="src" [controls]="controls" [autoplay]="autoplay" [loop]="loop" class="cc-audio-player"></audio>
      } @else {
        <div class="cc-audio-placeholder">No audio source</div>
      }
    </div>
  `,
  styles: [`
    .cc-audio { padding: 1rem; background: #f8fafc; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
    .cc-audio-title { font-weight: 500; margin-bottom: 0.5rem; }
    .cc-audio-player { width: 100%; }
    .cc-audio-placeholder { color: #64748b; font-size: 0.875rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcAudioPlayerComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};

  get src(): string | undefined { return this.component['srcPath'] ? getByPointer(this.dataModel, this.component['srcPath'] as string)?.toString() : this.component['src'] as string; }
  get title(): string | undefined { return this.component['title'] as string; }
  get controls(): boolean { return (this.component['controls'] as boolean) ?? true; }
  get autoplay(): boolean { return (this.component['autoplay'] as boolean) ?? false; }
  get loop(): boolean { return (this.component['loop'] as boolean) ?? false; }
}
