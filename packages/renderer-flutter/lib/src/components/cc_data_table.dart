import 'package:flutter/material.dart';
import '../utils/json_pointer.dart';

/// DataTable component for displaying tabular data
class CcDataTable extends StatefulWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;
  final void Function(String path, dynamic value) onInput;

  const CcDataTable({
    super.key,
    required this.component,
    required this.dataModel,
    required this.onInput,
  });

  @override
  State<CcDataTable> createState() => _CcDataTableState();
}

class _CcDataTableState extends State<CcDataTable> {
  String _searchQuery = '';
  int _currentPage = 0;
  String? _sortColumn;
  bool _sortAscending = true;

  @override
  Widget build(BuildContext context) {
    final dataPath = widget.component['dataPath'] as String?;
    final columns = (widget.component['columns'] as List<dynamic>?)
            ?.map((e) => Map<String, dynamic>.from(e as Map))
            .toList() ??
        [];
    final pagination = widget.component['pagination'] as bool? ?? false;
    final pageSize = widget.component['pageSize'] as int? ?? 10;
    final searchable = widget.component['searchable'] as bool? ?? false;
    final searchPlaceholder = widget.component['searchPlaceholder'] as String? ?? 'Search...';
    final alternateBackground = widget.component['alternateBackground'] as bool? ?? false;
    final emptyMessage = widget.component['emptyMessage'] as String? ?? 'No data available';

    List<Map<String, dynamic>> data = [];
    if (dataPath != null) {
      final rawData = getByPointer(widget.dataModel, dataPath);
      if (rawData is List) {
        data = rawData.map((e) => Map<String, dynamic>.from(e as Map)).toList();
      }
    }

    // Apply search filter
    if (_searchQuery.isNotEmpty) {
      data = data.where((row) {
        return row.values.any((value) =>
            value.toString().toLowerCase().contains(_searchQuery.toLowerCase()));
      }).toList();
    }

    // Apply sorting
    if (_sortColumn != null) {
      data.sort((a, b) {
        final aValue = a[_sortColumn];
        final bValue = b[_sortColumn];
        int result;
        if (aValue is num && bValue is num) {
          result = aValue.compareTo(bValue);
        } else {
          result = aValue.toString().compareTo(bValue.toString());
        }
        return _sortAscending ? result : -result;
      });
    }

    // Apply pagination
    final totalPages = (data.length / pageSize).ceil();
    final paginatedData = pagination
        ? data.skip(_currentPage * pageSize).take(pageSize).toList()
        : data;

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (searchable)
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: TextField(
              decoration: InputDecoration(
                hintText: searchPlaceholder,
                prefixIcon: const Icon(Icons.search),
                border: const OutlineInputBorder(),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                  _currentPage = 0;
                });
              },
            ),
          ),
        if (data.isEmpty)
          Padding(
            padding: const EdgeInsets.all(32),
            child: Center(
              child: Text(emptyMessage, style: TextStyle(color: Colors.grey[600])),
            ),
          )
        else
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              sortColumnIndex: _sortColumn != null
                  ? columns.indexWhere((c) => c['key'] == _sortColumn)
                  : null,
              sortAscending: _sortAscending,
              columns: columns.map((col) {
                final key = col['key'] as String;
                final label = col['label'] as String? ?? key;
                final sortable = col['sortable'] as bool? ?? false;

                return DataColumn(
                  label: Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
                  onSort: sortable
                      ? (columnIndex, ascending) {
                          setState(() {
                            _sortColumn = key;
                            _sortAscending = ascending;
                          });
                        }
                      : null,
                );
              }).toList(),
              rows: paginatedData.asMap().entries.map((entry) {
                final index = entry.key;
                final row = entry.value;

                return DataRow(
                  color: alternateBackground && index % 2 == 1
                      ? WidgetStateProperty.all(Colors.grey[50])
                      : null,
                  cells: columns.map((col) {
                    final key = col['key'] as String;
                    final type = col['type'] as String?;
                    final value = row[key];

                    Widget cellWidget;
                    switch (type) {
                      case 'image':
                        cellWidget = value != null
                            ? Image.network(
                                value.toString(),
                                width: 40,
                                height: 40,
                                fit: BoxFit.cover,
                              )
                            : const Icon(Icons.image, color: Colors.grey);
                        break;
                      case 'badge':
                        cellWidget = _buildBadge(value?.toString() ?? '');
                        break;
                      case 'statusDot':
                        cellWidget = _buildStatusDot(value?.toString() ?? '');
                        break;
                      default:
                        cellWidget = Text(value?.toString() ?? '');
                    }

                    return DataCell(cellWidget);
                  }).toList(),
                );
              }).toList(),
            ),
          ),
        if (pagination && totalPages > 1)
          Padding(
            padding: const EdgeInsets.only(top: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left),
                  onPressed: _currentPage > 0
                      ? () => setState(() => _currentPage--)
                      : null,
                ),
                Text('Page ${_currentPage + 1} of $totalPages'),
                IconButton(
                  icon: const Icon(Icons.chevron_right),
                  onPressed: _currentPage < totalPages - 1
                      ? () => setState(() => _currentPage++)
                      : null,
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildBadge(String text) {
    Color bgColor = Colors.grey[200]!;
    Color textColor = Colors.grey[700]!;

    final lower = text.toLowerCase();
    if (lower.contains('complete') || lower.contains('success') || lower.contains('active')) {
      bgColor = Colors.green[100]!;
      textColor = Colors.green[800]!;
    } else if (lower.contains('pending') || lower.contains('warning')) {
      bgColor = Colors.orange[100]!;
      textColor = Colors.orange[800]!;
    } else if (lower.contains('error') || lower.contains('failed')) {
      bgColor = Colors.red[100]!;
      textColor = Colors.red[800]!;
    } else if (lower.contains('processing') || lower.contains('info')) {
      bgColor = Colors.blue[100]!;
      textColor = Colors.blue[800]!;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        text,
        style: TextStyle(fontSize: 12, color: textColor, fontWeight: FontWeight.w500),
      ),
    );
  }

  Widget _buildStatusDot(String status) {
    Color color;
    switch (status.toLowerCase()) {
      case 'active':
      case 'online':
      case 'success':
        color = Colors.green;
        break;
      case 'warning':
      case 'pending':
        color = Colors.orange;
        break;
      case 'error':
      case 'offline':
      case 'failed':
        color = Colors.red;
        break;
      default:
        color = Colors.grey;
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 8),
        Text(status),
      ],
    );
  }
}
