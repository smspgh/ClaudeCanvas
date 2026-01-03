import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentDefinition, DataModel } from '../types';
import { getByPointer } from '../utils/json-pointer';

interface Column { key: string; label?: string; sortable?: boolean; type?: string; }

@Component({
  selector: 'cc-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cc-data-table">
      @if (searchable) {
        <input type="text" [placeholder]="searchPlaceholder" [(ngModel)]="searchQuery" class="cc-dt-search" />
      }
      @if (filteredData.length === 0) {
        <div class="cc-dt-empty">{{ emptyMessage }}</div>
      } @else {
        <table>
          <thead>
            <tr>
              @for (col of columns; track col.key) {
                <th [class.sortable]="col.sortable" (click)="col.sortable && sort(col.key)">
                  {{ col.label || col.key }}
                  @if (sortColumn === col.key) { <span>{{ sortAsc ? '↑' : '↓' }}</span> }
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of paginatedData; track $index; let i = $index) {
              <tr [class.alternate]="alternateBackground && i % 2 === 1">
                @for (col of columns; track col.key) {
                  <td>
                    @switch (col.type) {
                      @case ('badge') { <span class="cc-dt-badge">{{ row[col.key] }}</span> }
                      @default { {{ row[col.key] }} }
                    }
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
        @if (pagination && totalPages > 1) {
          <div class="cc-dt-pagination">
            <button [disabled]="currentPage === 0" (click)="currentPage = currentPage - 1">←</button>
            <span>{{ currentPage + 1 }} / {{ totalPages }}</span>
            <button [disabled]="currentPage >= totalPages - 1" (click)="currentPage = currentPage + 1">→</button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .cc-data-table { width: 100%; }
    .cc-dt-search { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; margin-bottom: 1rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { font-weight: 600; background: #f8fafc; }
    th.sortable { cursor: pointer; }
    th.sortable:hover { background: #e2e8f0; }
    tr.alternate { background: #f8fafc; }
    .cc-dt-empty { padding: 2rem; text-align: center; color: #64748b; }
    .cc-dt-pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1rem; }
    .cc-dt-pagination button { padding: 0.5rem 1rem; border: 1px solid #e2e8f0; border-radius: 0.25rem; background: white; cursor: pointer; }
    .cc-dt-pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .cc-dt-badge { background: #e2e8f0; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CcDataTableComponent {
  @Input() component!: ComponentDefinition;
  @Input() dataModel: DataModel = {};
  @Output() inputChange = new EventEmitter<{ path: string; value: unknown }>();

  searchQuery = '';
  sortColumn: string | null = null;
  sortAsc = true;
  currentPage = 0;

  get dataPath(): string | undefined { return this.component['dataPath'] as string; }
  get columns(): Column[] { return (this.component['columns'] as Column[]) ?? []; }
  get pagination(): boolean { return (this.component['pagination'] as boolean) ?? false; }
  get pageSize(): number { return (this.component['pageSize'] as number) ?? 10; }
  get searchable(): boolean { return (this.component['searchable'] as boolean) ?? false; }
  get searchPlaceholder(): string { return (this.component['searchPlaceholder'] as string) ?? 'Search...'; }
  get alternateBackground(): boolean { return (this.component['alternateBackground'] as boolean) ?? false; }
  get emptyMessage(): string { return (this.component['emptyMessage'] as string) ?? 'No data available'; }

  get rawData(): Record<string, unknown>[] {
    if (!this.dataPath) return [];
    const data = getByPointer(this.dataModel, this.dataPath);
    return Array.isArray(data) ? data : [];
  }

  get filteredData(): Record<string, unknown>[] {
    let data = this.rawData;
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      data = data.filter(row => Object.values(row).some(v => v?.toString().toLowerCase().includes(q)));
    }
    if (this.sortColumn) {
      data = [...data].sort((a, b) => {
        const av = a[this.sortColumn!], bv = b[this.sortColumn!];
        const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return this.sortAsc ? cmp : -cmp;
      });
    }
    return data;
  }

  get totalPages(): number { return Math.ceil(this.filteredData.length / this.pageSize); }

  get paginatedData(): Record<string, unknown>[] {
    if (!this.pagination) return this.filteredData;
    const start = this.currentPage * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  sort(column: string): void {
    if (this.sortColumn === column) { this.sortAsc = !this.sortAsc; }
    else { this.sortColumn = column; this.sortAsc = true; }
  }
}
