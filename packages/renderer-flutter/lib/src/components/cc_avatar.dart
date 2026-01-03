import 'package:flutter/material.dart';
import '../utils/json_pointer.dart';

/// Avatar component for user profile images
class CcAvatar extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;

  const CcAvatar({
    super.key,
    required this.component,
    required this.dataModel,
  });

  @override
  Widget build(BuildContext context) {
    String? src = component['src'] as String?;
    String? initials = component['initials'] as String?;

    // Support path bindings
    if (component['srcPath'] != null) {
      final value = getByPointer(dataModel, component['srcPath'] as String);
      src = value?.toString();
    }
    if (component['initialsPath'] != null) {
      final value = getByPointer(dataModel, component['initialsPath'] as String);
      initials = value?.toString();
    }

    final size = component['size'] as String? ?? 'medium';
    final shape = component['shape'] as String? ?? 'circle';
    final status = component['status'] as String?;

    final sizeValue = size == 'small' ? 32.0 : (size == 'large' ? 64.0 : 48.0);

    Widget avatar;
    if (src != null && src.isNotEmpty) {
      avatar = _buildImageAvatar(src, sizeValue, shape);
    } else if (initials != null && initials.isNotEmpty) {
      avatar = _buildInitialsAvatar(initials, sizeValue, shape);
    } else {
      avatar = _buildDefaultAvatar(sizeValue, shape);
    }

    if (status != null) {
      avatar = Stack(
        children: [
          avatar,
          Positioned(
            right: 0,
            bottom: 0,
            child: Container(
              width: sizeValue * 0.25,
              height: sizeValue * 0.25,
              decoration: BoxDecoration(
                color: _getStatusColor(status),
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
              ),
            ),
          ),
        ],
      );
    }

    return avatar;
  }

  Widget _buildImageAvatar(String src, double size, String shape) {
    final borderRadius = _getBorderRadius(shape, size);

    return ClipRRect(
      borderRadius: borderRadius,
      child: Image.network(
        src,
        width: size,
        height: size,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return _buildDefaultAvatar(size, shape);
        },
      ),
    );
  }

  Widget _buildInitialsAvatar(String initials, double size, String shape) {
    final borderRadius = _getBorderRadius(shape, size);

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: Colors.indigo[100],
        borderRadius: borderRadius,
      ),
      child: Center(
        child: Text(
          initials.toUpperCase().substring(0, initials.length > 2 ? 2 : initials.length),
          style: TextStyle(
            fontSize: size * 0.4,
            fontWeight: FontWeight.w600,
            color: Colors.indigo[700],
          ),
        ),
      ),
    );
  }

  Widget _buildDefaultAvatar(double size, String shape) {
    final borderRadius = _getBorderRadius(shape, size);

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: borderRadius,
      ),
      child: Icon(
        Icons.person,
        size: size * 0.6,
        color: Colors.grey[400],
      ),
    );
  }

  BorderRadius _getBorderRadius(String shape, double size) {
    switch (shape) {
      case 'square':
        return BorderRadius.zero;
      case 'rounded':
        return BorderRadius.circular(8);
      case 'circle':
      default:
        return BorderRadius.circular(size / 2);
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'online':
        return Colors.green;
      case 'offline':
        return Colors.grey;
      case 'busy':
        return Colors.red;
      case 'away':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }
}
