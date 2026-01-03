import 'package:flutter/material.dart';

/// Skeleton loading placeholder component
class CcSkeleton extends StatefulWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;

  const CcSkeleton({
    super.key,
    required this.component,
    required this.dataModel,
  });

  @override
  State<CcSkeleton> createState() => _CcSkeletonState();
}

class _CcSkeletonState extends State<CcSkeleton> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    final animation = widget.component['animation'] as String? ?? 'pulse';

    if (animation != 'none') {
      _controller = AnimationController(
        duration: const Duration(milliseconds: 1500),
        vsync: this,
      )..repeat(reverse: animation == 'pulse');

      _animation = Tween<double>(begin: 0.4, end: 1.0).animate(_controller);
    } else {
      _controller = AnimationController(vsync: this);
      _animation = const AlwaysStoppedAnimation(0.6);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final variant = widget.component['variant'] as String? ?? 'text';
    final width = (widget.component['width'] as num?)?.toDouble();
    final height = (widget.component['height'] as num?)?.toDouble();
    final lines = widget.component['lines'] as int? ?? 1;
    final animation = widget.component['animation'] as String? ?? 'pulse';

    if (variant == 'text' && lines > 1) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: List.generate(lines, (index) {
          // Make last line shorter for more natural look
          final lineWidth = index == lines - 1 ? (width ?? double.infinity) * 0.7 : width;
          return Padding(
            padding: EdgeInsets.only(bottom: index < lines - 1 ? 8 : 0),
            child: _buildSkeleton(
              variant: 'text',
              width: lineWidth,
              height: height ?? 16,
              animation: animation,
            ),
          );
        }),
      );
    }

    return _buildSkeleton(
      variant: variant,
      width: width,
      height: height,
      animation: animation,
    );
  }

  Widget _buildSkeleton({
    required String variant,
    double? width,
    double? height,
    required String animation,
  }) {
    BorderRadius borderRadius;
    double effectiveWidth;
    double effectiveHeight;

    switch (variant) {
      case 'circular':
        final size = width ?? height ?? 40;
        effectiveWidth = size;
        effectiveHeight = size;
        borderRadius = BorderRadius.circular(size / 2);
        break;
      case 'rectangular':
        effectiveWidth = width ?? double.infinity;
        effectiveHeight = height ?? 100;
        borderRadius = BorderRadius.zero;
        break;
      case 'text':
      default:
        effectiveWidth = width ?? double.infinity;
        effectiveHeight = height ?? 16;
        borderRadius = BorderRadius.circular(4);
    }

    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          width: effectiveWidth,
          height: effectiveHeight,
          decoration: BoxDecoration(
            color: Colors.grey[300]!.withOpacity(_animation.value),
            borderRadius: borderRadius,
          ),
        );
      },
    );
  }
}
