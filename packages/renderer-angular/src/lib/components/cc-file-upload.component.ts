import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentDefinition, DataModel, Action } from '../types';

@Component({
  selector: 'cc-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cc-file-upload" [class.disabled]="disabled">
      @if (label) {
        <label class="cc-file-upload-label">
          {{ label }}
          @if (required) { <span class="required">*</span> }
        </label>
      }
      <div
        class="cc-file-upload-zone"
        [class.dragover]="isDragOver"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="openFilePicker()">
        <input
          #fileInput
          type="file"
          [accept]="accept"
          [multiple]="multiple"
          [disabled]="disabled"
          (change)="onFileSelect($event)"
          hidden
        />
        <div class="cc-file-upload-content">
          <span class="cc-file-upload-icon">📁</span>
          <span class="cc-file-upload-text">{{ dropzoneText }}</span>
          <span class="cc-file-upload-hint">or click to browse</span>
        </div>
      </div>
      @if (selectedFiles.length > 0) {
        <div class="cc-file-upload-files">
          @for (file of selectedFiles; track file.name) {
            <div class="cc-file-upload-file">
              <span class="cc-file-name">{{ file.name }}</span>
              <span class="cc-file-size">{{ formatSize(file.size) }}</span>
              <button class="cc-file-remove" (click)="removeFile(file)">×</button>
            </div>
          }
        </div>
      }
      @if (helperText) { <div class="cc-file-upload-helper">{{ helperText }}</div> }
    </div>
  `,
  styles: [`
    .cc-file-upload { display: flex; flex-direction: column; gap: 0.5rem; }
    .cc-file-upload.disabled { opacity: 0.5; pointer-events: none; }
    .cc-file-upload-label { font-size: 0.875rem; font-weight: 500; color: #374151; }
    .cc-file-upload-label .required { color: #ef4444; }
    .cc-file-upload-zone {
      border: 2px dashed #d1d5db;
      border-radius: 0.5rem;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .cc-file-upload-zone:hover, .cc-file-upload-zone.dragover {
      border-color: #6366f1;
      background: rgba(99, 102, 241, 0.05);
    }
    .cc-file-upload-content { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .cc-file-upload-icon { font-size: 2rem; }
    .cc-file-upload-text { font-size: 0.875rem; color: #374151; }
    .cc-file-upload-hint { font-size: 0.75rem; color: #9ca3af; }
    .cc-file-upload-files { display: flex; flex-direction: column; gap: 0.25rem; }
    .cc-file-upload-file {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: #f3f4f6;
      border-radius: 0.25rem;
      font-size: 0.875rem;
    }
    .cc-file-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .cc-file-size { color: #6b7280; }
    .cc-file-remove { background: none; border: none; cursor: pointer; color: #ef4444; font-size: 1rem; }
    .cc-file-upload-helper { font-size: 0.75rem; color: #6b7280; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcFileUploadComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();
  @Output() action = new EventEmitter<Action>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isDragOver = false;
  selectedFiles: File[] = [];

  get label(): string | undefined { return this.component['label'] as string; }
  get helperText(): string | undefined { return this.component['helperText'] as string; }
  get accept(): string { return (this.component['accept'] as string) ?? '*/*'; }
  get multiple(): boolean { return (this.component['multiple'] as boolean) ?? false; }
  get disabled(): boolean { return (this.component['disabled'] as boolean) ?? false; }
  get required(): boolean { return (this.component['required'] as boolean) ?? false; }
  get maxSize(): number | undefined { return this.component['maxSize'] as number; }
  get dropzoneText(): string { return (this.component['dropzoneText'] as string) ?? 'Drag and drop files here'; }

  openFilePicker(): void {
    if (!this.disabled) {
      this.fileInput.nativeElement.click();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  onFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.handleFiles(Array.from(target.files));
    }
  }

  handleFiles(files: File[]): void {
    if (this.maxSize) {
      files = files.filter(f => f.size <= this.maxSize!);
    }
    if (!this.multiple) {
      files = files.slice(0, 1);
    }
    this.selectedFiles = this.multiple ? [...this.selectedFiles, ...files] : files;
    this.emitAction();
  }

  removeFile(file: File): void {
    this.selectedFiles = this.selectedFiles.filter(f => f !== file);
    this.emitAction();
  }

  emitAction(): void {
    const actionData = this.component['action'] as Action | undefined;
    if (actionData) {
      this.action.emit({
        ...actionData,
        payload: { ...actionData.payload, files: this.selectedFiles }
      });
    }
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
