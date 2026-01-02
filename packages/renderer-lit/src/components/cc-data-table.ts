import { LitElement, html, css, nothing, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { DataTableComponent, DataTableColumn, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

@customElement('cc-data-table')
export class CcDataTable extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .table-wrapper {
      background: var(--cc-surface, white);
      border: 1px solid var(--cc-border, #e5e7eb);
      border-radius: 0.5rem;
      overflow-x: auto;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--cc-border, #e5e7eb);
      background: var(--cc-surface-dim, #f9fafb);
    }

    .search-input {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--cc-border, #d1d5db);
      border-radius: 0.375rem;
      font-size: 0.875rem;
      width: 200px;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--cc-primary, #6366f1);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: var(--cc-surface-dim, #f9fafb);
    }

    th {
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--cc-text-secondary, #6b7280);
      border-bottom: 1px solid var(--cc-border, #e5e7eb);
    }

    th.sortable {
      cursor: pointer;
      user-select: none;
    }

    th.sortable:hover {
      color: var(--cc-text, #333);
    }

    .sort-icon {
      margin-left: 0.25rem;
      opacity: 0.5;
    }

    .sort-icon.active {
      opacity: 1;
      color: var(--cc-primary, #6366f1);
    }

    td {
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: var(--cc-text, #333);
      border-bottom: 1px solid var(--cc-border, #e5e7eb);
    }

    tr:hover td {
      background: var(--cc-surface-dim, #f9fafb);
    }

    tr.selected td {
      background: rgba(99, 102, 241, 0.1);
    }

    .checkbox-cell {
      width: 40px;
      text-align: center;
    }

    .checkbox-cell input {
      width: 1rem;
      height: 1rem;
      cursor: pointer;
      accent-color: var(--cc-primary, #6366f1);
    }

    .cell-image {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
    }

    .cell-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
    }

    .cell-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 9999px;
      background: var(--cc-surface-dim, #e5e7eb);
      color: var(--cc-text, #333);
    }

    .cell-badge.badge-active, .cell-badge.badge-success {
      background: #dcfce7;
      color: #166534;
    }

    .cell-badge.badge-away, .cell-badge.badge-warning {
      background: #fef3c7;
      color: #92400e;
    }

    .cell-badge.badge-offline, .cell-badge.badge-error {
      background: #fee2e2;
      color: #991b1b;
    }

    .cell-badge.badge-info {
      background: #dbeafe;
      color: #1e40af;
    }

    /* Status dot styles */
    .status-dot-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--cc-text-secondary, #6b7280);
    }

    .status-dot.status-dot-active, .status-dot.status-dot-online {
      background: #22c55e;
    }

    .status-dot.status-dot-away, .status-dot.status-dot-busy {
      background: #f59e0b;
    }

    .status-dot.status-dot-offline, .status-dot.status-dot-inactive {
      background: #ef4444;
    }

    .status-dot-label {
      font-size: 0.875rem;
      color: var(--cc-text, #333);
    }

    /* Alternating row backgrounds */
    tr.alternate td {
      background: var(--cc-surface-dim, #f9fafb);
    }

    .empty-state {
      padding: 3rem;
      text-align: center;
      color: var(--cc-text-secondary, #6b7280);
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-top: 1px solid var(--cc-border, #e5e7eb);
      background: var(--cc-surface-dim, #f9fafb);
      font-size: 0.875rem;
      color: var(--cc-text-secondary, #6b7280);
    }

    .pagination-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .pagination-btn {
      padding: 0.375rem 0.75rem;
      border: 1px solid var(--cc-border, #d1d5db);
      border-radius: 0.375rem;
      background: var(--cc-surface, white);
      font-size: 0.875rem;
      cursor: pointer;
      color: var(--cc-text, #333);
    }

    .pagination-btn:hover:not(:disabled) {
      background: var(--cc-surface-dim, #f3f4f6);
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  @property({ type: Object })
  component!: DataTableComponent;

  @property({ type: Object })
  dataModel: DataModel = {};

  @state()
  private currentPage = 0;

  @state()
  private sortColumn: string | null = null;

  @state()
  private sortDirection: 'asc' | 'desc' = 'asc';

  @state()
  private searchQuery = '';

  @state()
  private selectedRows: Set<number> = new Set();

  private renderCellValue(row: Record<string, unknown>, col: DataTableColumn): TemplateResult | string {
    const value = row[col.key];
    const strValue = String(value ?? '');

    switch (col.type) {
      case 'image':
        return strValue ? html`<img class="cell-image" src=${strValue} alt="" />` : html``;
      case 'avatar':
        return strValue ? html`<img class="cell-avatar" src=${strValue} alt="" />` : html``;
      case 'badge': {
        const badgeClass = `badge-${strValue.toLowerCase()}`;
        return html`<span class="cell-badge ${badgeClass}">${strValue}</span>`;
      }
      case 'statusDot': {
        const dotClass = `status-dot-${strValue.toLowerCase()}`;
        return html`<span class="status-dot-container"><span class="status-dot ${dotClass}"></span><span class="status-dot-label">${strValue}</span></span>`;
      }
      default:
        return strValue;
    }
  }

  private getData(): Record<string, unknown>[] {
    const data = getByPointer(this.dataModel, this.component.dataPath);
    if (Array.isArray(data)) {
      return data as Record<string, unknown>[];
    }
    return [];
  }

  private getFilteredData(): Record<string, unknown>[] {
    let data = this.getData();

    // Filter by search
    if (this.searchQuery && this.component.searchable) {
      const query = this.searchQuery.toLowerCase();
      data = data.filter(row =>
        this.component.columns.some(col => {
          const value = row[col.key];
          return String(value).toLowerCase().includes(query);
        })
      );
    }

    // Sort
    if (this.sortColumn) {
      const col = this.sortColumn;
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      data = [...data].sort((a, b) => {
        const aVal = a[col];
        const bVal = b[col];
        if (aVal === bVal) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * dir;
        }
        return String(aVal).localeCompare(String(bVal)) * dir;
      });
    }

    return data;
  }

  private getPagedData(): Record<string, unknown>[] {
    const data = this.getFilteredData();
    if (!this.component.pagination) return data;

    const pageSize = this.component.pageSize || 10;
    const start = this.currentPage * pageSize;
    return data.slice(start, start + pageSize);
  }

  private handleSort(columnKey: string) {
    const column = this.component.columns.find(c => c.key === columnKey);
    if (!column?.sortable) return;

    if (this.sortColumn === columnKey) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }
  }

  private handleSearch(e: Event) {
    this.searchQuery = (e.target as HTMLInputElement).value;
    this.currentPage = 0;
  }

  private handleRowSelect(index: number) {
    if (!this.component.selectable) return;

    const newSelected = new Set(this.selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    this.selectedRows = newSelected;

    if (this.component.selectionPath) {
      const selectedData = this.getData().filter((_, i) => newSelected.has(i));
      const event = new CustomEvent('cc-input', {
        bubbles: true,
        composed: true,
        detail: {
          path: this.component.selectionPath,
          value: selectedData,
        },
      });
      this.dispatchEvent(event);
    }
  }

  private handleSelectAll(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    const data = this.getData();

    if (checked) {
      this.selectedRows = new Set(data.map((_, i) => i));
    } else {
      this.selectedRows = new Set();
    }

    if (this.component.selectionPath) {
      const selectedData = checked ? data : [];
      const event = new CustomEvent('cc-input', {
        bubbles: true,
        composed: true,
        detail: {
          path: this.component.selectionPath,
          value: selectedData,
        },
      });
      this.dispatchEvent(event);
    }
  }

  render() {
    const allData = this.getFilteredData();
    const pagedData = this.getPagedData();
    const pageSize = this.component.pageSize || 10;
    const totalPages = Math.ceil(allData.length / pageSize);

    return html`
      <div class="table-wrapper">
        ${this.component.searchable ? html`
          <div class="table-header">
            <input
              type="text"
              class="search-input"
              placeholder=${this.component.searchPlaceholder || 'Search...'}
              .value=${this.searchQuery}
              @input=${this.handleSearch}
            />
          </div>
        ` : nothing}

        ${pagedData.length === 0 ? html`
          <div class="empty-state">
            ${this.component.emptyMessage || 'No data available'}
          </div>
        ` : html`
          <table>
            <thead>
              <tr>
                ${this.component.selectable ? html`
                  <th class="checkbox-cell">
                    <input
                      type="checkbox"
                      .checked=${this.selectedRows.size === this.getData().length && this.getData().length > 0}
                      @change=${this.handleSelectAll}
                    />
                  </th>
                ` : nothing}
                ${this.component.columns.map(col => html`
                  <th
                    class=${col.sortable ? 'sortable' : ''}
                    style=${col.width ? `width: ${typeof col.width === 'number' ? col.width + 'px' : col.width}` : ''}
                    @click=${() => this.handleSort(col.key)}
                  >
                    ${col.label}
                    ${col.sortable ? html`
                      <span class="sort-icon ${this.sortColumn === col.key ? 'active' : ''}">
                        ${this.sortColumn === col.key ? (this.sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    ` : nothing}
                  </th>
                `)}
              </tr>
            </thead>
            <tbody>
              ${pagedData.map((row, i) => {
                const actualIndex = this.component.pagination ? this.currentPage * pageSize + i : i;
                const rowClasses: string[] = [];
                if (this.selectedRows.has(actualIndex)) rowClasses.push('selected');
                if (this.component.alternateBackground && i % 2 === 1) rowClasses.push('alternate');
                return html`
                  <tr class=${rowClasses.join(' ')}>
                    ${this.component.selectable ? html`
                      <td class="checkbox-cell">
                        <input
                          type="checkbox"
                          .checked=${this.selectedRows.has(actualIndex)}
                          @change=${() => this.handleRowSelect(actualIndex)}
                        />
                      </td>
                    ` : nothing}
                    ${this.component.columns.map(col => html`
                      <td>${this.renderCellValue(row, col)}</td>
                    `)}
                  </tr>
                `;
              })}
            </tbody>
          </table>
        `}

        ${this.component.pagination && allData.length > pageSize ? html`
          <div class="pagination">
            <span>
              Showing ${this.currentPage * pageSize + 1} - ${Math.min((this.currentPage + 1) * pageSize, allData.length)} of ${allData.length}
            </span>
            <div class="pagination-buttons">
              <button
                class="pagination-btn"
                ?disabled=${this.currentPage === 0}
                @click=${() => this.currentPage = 0}
              >
                First
              </button>
              <button
                class="pagination-btn"
                ?disabled=${this.currentPage === 0}
                @click=${() => this.currentPage--}
              >
                Prev
              </button>
              <button
                class="pagination-btn"
                ?disabled=${this.currentPage >= totalPages - 1}
                @click=${() => this.currentPage++}
              >
                Next
              </button>
              <button
                class="pagination-btn"
                ?disabled=${this.currentPage >= totalPages - 1}
                @click=${() => this.currentPage = totalPages - 1}
              >
                Last
              </button>
            </div>
          </div>
        ` : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cc-data-table': CcDataTable;
  }
}
