/// Data model utilities for ClaudeCanvas Flutter renderer
library;

import 'utils/json_pointer.dart';

/// Typedef for data model (JSON object)
typedef DataModel = Map<String, dynamic>;

/// Extension methods for DataModel operations
extension DataModelExtensions on DataModel {
  /// Get a value at a JSON Pointer path
  dynamic getAt(String path) => getByPointer(this, path);

  /// Set a value at a JSON Pointer path (returns new DataModel)
  DataModel setAt(String path, dynamic value) => setByPointer(this, path, value);

  /// Merge with another DataModel
  DataModel merge(DataModel other) {
    return {...this, ...other};
  }

  /// Deep clone the data model
  DataModel clone() {
    return Map<String, dynamic>.from(
      _deepClone(this) as Map<String, dynamic>,
    );
  }
}

dynamic _deepClone(dynamic value) {
  if (value is Map) {
    return Map<String, dynamic>.fromEntries(
      value.entries.map((e) => MapEntry(e.key.toString(), _deepClone(e.value))),
    );
  }
  if (value is List) {
    return value.map(_deepClone).toList();
  }
  return value;
}
