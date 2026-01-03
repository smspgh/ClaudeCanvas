import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-audio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-audio">
      @if (title) { <div class="cc-audio-title">{{ title }}</div> }
      <audio
        [src]="src"
        [controls]="showControls"
        [autoplay]="autoplay"
        [loop]="loop"
        [muted]="muted"
        [preload]="preload">
        Your browser does not support the audio element.
      </audio>
    </div>
  `,
  styles: [`
    .cc-audio { display: flex; flex-direction: column; gap: 0.5rem; }
    .cc-audio-title { font-size: 0.875rem; font-weight: 500; color: #374151; }
    audio { width: 100%; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcAudioComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};

  get srcPath(): string | undefined { return this.component['srcPath'] as string; }
  get src(): string {
    if (this.srcPath) {
      const v = getByPointer(this.dataModel, this.srcPath);
      return v?.toString() ?? '';
    }
    return (this.component['src'] as string) ?? '';
  }
  get title(): string | undefined { return this.component['title'] as string; }
  get showControls(): boolean { return (this.component['controls'] as boolean) ?? true; }
  get autoplay(): boolean { return (this.component['autoplay'] as boolean) ?? false; }
  get loop(): boolean { return (this.component['loop'] as boolean) ?? false; }
  get muted(): boolean { return (this.component['muted'] as boolean) ?? false; }
  get preload(): 'none' | 'metadata' | 'auto' { return (this.component['preload'] as 'none' | 'metadata' | 'auto') ?? 'metadata'; }
}
