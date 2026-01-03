import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

@Component({
  selector: 'cc-video',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (src) {
      <video [src]="src" [poster]="poster" [controls]="controls" [autoplay]="autoplay" [loop]="loop" [muted]="muted" class="cc-video"></video>
    } @else {
      <div class="cc-video-placeholder">No video source</div>
    }
  `,
  styles: [`
    .cc-video { width: 100%; max-width: 100%; border-radius: 0.5rem; }
    .cc-video-placeholder { background: #1e293b; color: #94a3b8; padding: 3rem; text-align: center; border-radius: 0.5rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcVideoComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};

  get src(): string | undefined { return this.component['srcPath'] ? getByPointer(this.dataModel, this.component['srcPath'] as string)?.toString() : this.component['src'] as string; }
  get poster(): string | undefined { return this.component['poster'] as string; }
  get controls(): boolean { return (this.component['controls'] as boolean) ?? true; }
  get autoplay(): boolean { return (this.component['autoplay'] as boolean) ?? false; }
  get loop(): boolean { return (this.component['loop'] as boolean) ?? false; }
  get muted(): boolean { return (this.component['muted'] as boolean) ?? false; }
}
