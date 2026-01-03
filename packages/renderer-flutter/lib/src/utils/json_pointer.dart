/// JSON Pointer (RFC 6901) implementation for ClaudeCanvas
library;

/// Get a value from a data model using a JSON Pointer path
dynamic getByPointer(Map<String, dynamic> dataModel, String path) {
  if (path.isEmpty || path == '/') {
    return dataModel;
  }

  final segments = path.split('/').where((s) => s.isNotEmpty).toList();
  dynamic current = dataModel;

  for (final segment in segments) {
    if (current == null) return null;

    // Unescape JSON Pointer special characters
    final key = segment.replaceAll('~1', '/').replaceAll('~0', '~');

    if (current is Map) {
      current = current[key];
    } else if (current is List) {
      final index = int.tryParse(key);
      if (index != null && index >= 0 && index < current.length) {
        current = current[index];
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  return current;
}

/// Set a value in a data model using a JSON Pointer path
/// Returns a new data model with the value set (immutable update)
Map<String, dynamic> setByPointer(
  Map<String, dynamic> dataModel,
  String path,
  dynamic value,
) {
  if (path.isEmpty || path == '/') {
    if (value is Map<String, dynamic>) {
      return value;
    }
    return dataModel;
  }

  final segments = path.split('/').where((s) => s.isNotEmpty).toList();
  return _setByPointerRecursive(dataModel, segments, 0, value);
}

Map<String, dynamic> _setByPointerRecursive(
  Map<String, dynamic> current,
  List<String> segments,
  int index,
  dynamic value,
) {
  if (index >= segments.length) {
    return current;
  }

  final key = segments[index].replaceAll('~1', '/').replaceAll('~0', '~');
  final result = Map<String, dynamic>.from(current);

  if (index == segments.length - 1) {
    // Last segment - set the value
    result[key] = value;
  } else {
    // Intermediate segment - recurse
    final next = current[key];
    if (next is Map<String, dynamic>) {
      result[key] = _setByPointerRecursive(next, segments, index + 1, value);
    } else {
      // Create intermediate object if needed
      result[key] = _setByPointerRecursive({}, segments, index + 1, value);
    }
  }

  return result;
}

/// Interpolate path patterns like {item.field} or {index}
String interpolatePath(String path, dynamic item, int index) {
  var result = path;

  // Replace {index}
  result = result.replaceAll('{index}', index.toString());

  // Replace {item} references
  final itemPattern = RegExp(r'\{item\.([^}]+)\}');
  result = result.replaceAllMapped(itemPattern, (match) {
    final field = match.group(1)!;
    if (item is Map) {
      return item[field]?.toString() ?? '';
    }
    return '';
  });

  // Replace {item} with the whole item
  if (result.contains('{item}')) {
    result = result.replaceAll('{item}', item?.toString() ?? '');
  }

  return result;
}

/// Evaluate a computed expression on a value
dynamic evaluateExpression(String expr, dynamic value) {
  switch (expr) {
    case 'count':
    case 'length':
      if (value is List) return value.length;
      if (value is String) return value.length;
      if (value is Map) return value.length;
      return 0;

    case 'sum':
      if (value is List) {
        return value.fold<num>(0, (sum, item) {
          if (item is num) return sum + item;
          return sum;
        });
      }
      return 0;

    case 'any':
      if (value is List) {
        return value.any((item) => item == true || item != null && item != 0);
      }
      return false;

    case 'all':
      if (value is List) {
        return value.every((item) => item == true || item != null && item != 0);
      }
      return false;

    case 'none':
      if (value is List) {
        return !value.any((item) => item == true || item != null && item != 0);
      }
      return true;

    default:
      return value;
  }
}

/// Generate a unique ID
String generateId() {
  return 'cc-${DateTime.now().millisecondsSinceEpoch}-${_idCounter++}';
}

int _idCounter = 0;
