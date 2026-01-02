import { useState, useMemo } from 'react';
import type { DataTableComponent, DataTableColumn, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcDataTableProps {
  component: DataTableComponent;
  dataModel: DataModel;
  onInput?: (path: string, value: unknown) => void;
}

export function CcDataTable({ component, dataModel, onInput }: CcDataTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const rawData = useMemo(() => {
    const data = getByPointer(dataModel, component.dataPath);
    return Array.isArray(data) ? data as Record<string, unknown>[] : [];
  }, [dataModel, component.dataPath]);

  const filteredData = useMemo(() => {
    let data = rawData;

    if (searchQuery && component.searchable) {
      const query = searchQuery.toLowerCase();
      data = data.filter(row =>
        component.columns.some(col => {
          const value = row[col.key];
          return String(value).toLowerCase().includes(query);
        })
      );
    }

    if (sortColumn) {
      const col = sortColumn;
      const dir = sortDirection === 'asc' ? 1 : -1;
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
  }, [rawData, searchQuery, component.searchable, component.columns, sortColumn, sortDirection]);

  const pageSize = component.pageSize || 10;
  const totalPages = Math.ceil(filteredData.length / pageSize);

  const pagedData = useMemo(() => {
    if (!component.pagination) return filteredData;
    const start = currentPage * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, component.pagination, currentPage, pageSize]);

  const handleSort = (columnKey: string) => {
    const column = component.columns.find(c => c.key === columnKey);
    if (!column?.sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleRowSelect = (index: number) => {
    if (!component.selectable) return;

    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);

    if (component.selectionPath && onInput) {
      const selectedData = rawData.filter((_, i) => newSelected.has(i));
      onInput(component.selectionPath, selectedData);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(rawData.map((_, i) => i)));
    } else {
      setSelectedRows(new Set());
    }

    if (component.selectionPath && onInput) {
      onInput(component.selectionPath, checked ? rawData : []);
    }
  };

  const renderCellValue = (row: Record<string, unknown>, col: DataTableColumn) => {
    const value = row[col.key];
    const strValue = String(value ?? '');

    switch (col.type) {
      case 'image':
        return strValue ? <img className="cc-data-table-cell-image" src={strValue} alt="" /> : null;
      case 'avatar':
        return strValue ? <img className="cc-data-table-cell-avatar" src={strValue} alt="" /> : null;
      case 'badge': {
        const badgeClass = `cc-data-table-cell-badge badge-${strValue.toLowerCase()}`;
        return <span className={badgeClass}>{strValue}</span>;
      }
      default:
        return strValue;
    }
  };

  return (
    <div className="cc-data-table">
      {component.searchable && (
        <div className="cc-data-table-header">
          <input
            type="text"
            className="cc-data-table-search"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(0); }}
          />
        </div>
      )}

      {pagedData.length === 0 ? (
        <div className="cc-data-table-empty">
          {component.emptyMessage || 'No data available'}
        </div>
      ) : (
        <table className="cc-data-table-table">
          <thead>
            <tr>
              {component.selectable && (
                <th className="cc-data-table-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === rawData.length && rawData.length > 0}
                    onChange={e => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              {component.columns.map(col => (
                <th
                  key={col.key}
                  className={col.sortable ? 'cc-data-table-sortable' : ''}
                  style={col.width ? { width: typeof col.width === 'number' ? col.width : col.width } : undefined}
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  {col.sortable && (
                    <span className={`cc-data-table-sort ${sortColumn === col.key ? 'active' : ''}`}>
                      {sortColumn === col.key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedData.map((row, i) => {
              const actualIndex = component.pagination ? currentPage * pageSize + i : i;
              return (
                <tr key={i} className={selectedRows.has(actualIndex) ? 'selected' : ''}>
                  {component.selectable && (
                    <td className="cc-data-table-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(actualIndex)}
                        onChange={() => handleRowSelect(actualIndex)}
                      />
                    </td>
                  )}
                  {component.columns.map(col => (
                    <td key={col.key}>{renderCellValue(row, col)}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {component.pagination && filteredData.length > pageSize && (
        <div className="cc-data-table-pagination">
          <span>
            Showing {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, filteredData.length)} of {filteredData.length}
          </span>
          <div className="cc-data-table-pagination-buttons">
            <button disabled={currentPage === 0} onClick={() => setCurrentPage(0)}>First</button>
            <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
            <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
            <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(totalPages - 1)}>Last</button>
          </div>
        </div>
      )}
    </div>
  );
}
