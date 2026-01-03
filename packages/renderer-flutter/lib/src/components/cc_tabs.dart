import 'package:flutter/material.dart';
import '../utils/json_pointer.dart';

/// Tabs component for tabbed navigation
class CcTabs extends StatefulWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;
  final void Function(String path, dynamic value) onInput;
  final Widget Function(Map<String, dynamic> component, {Key? key}) renderChild;

  const CcTabs({
    super.key,
    required this.component,
    required this.dataModel,
    required this.onInput,
    required this.renderChild,
  });

  @override
  State<CcTabs> createState() => _CcTabsState();
}

class _CcTabsState extends State<CcTabs> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    final tabs = _getTabs();
    _tabController = TabController(length: tabs.length, vsync: this);
    _initializeTabIndex();
  }

  @override
  void didUpdateWidget(CcTabs oldWidget) {
    super.didUpdateWidget(oldWidget);
    _initializeTabIndex();
  }

  void _initializeTabIndex() {
    final valuePath = widget.component['valuePath'] as String?;
    if (valuePath != null) {
      final value = getByPointer(widget.dataModel, valuePath);
      if (value != null) {
        final tabs = _getTabs();
        final index = tabs.indexWhere((t) => t['value'] == value);
        if (index >= 0 && index < _tabController.length) {
          _tabController.index = index;
        }
      }
    }
  }

  List<Map<String, dynamic>> _getTabs() {
    return (widget.component['tabs'] as List<dynamic>?)
            ?.map((e) => Map<String, dynamic>.from(e as Map))
            .toList() ??
        [];
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tabs = _getTabs();

    if (tabs.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        TabBar(
          controller: _tabController,
          isScrollable: tabs.length > 4,
          tabs: tabs.map((tab) {
            return Tab(text: tab['label'] as String? ?? '');
          }).toList(),
          onTap: (index) {
            final valuePath = widget.component['valuePath'] as String?;
            if (valuePath != null) {
              widget.onInput(valuePath, tabs[index]['value']);
            }
          },
        ),
        const SizedBox(height: 16),
        IndexedStack(
          index: _tabController.index,
          children: tabs.map((tab) {
            final children = (tab['children'] as List<dynamic>?)
                    ?.map((e) => Map<String, dynamic>.from(e as Map))
                    .toList() ??
                [];
            return Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: children.asMap().entries.map((entry) {
                return widget.renderChild(
                  entry.value,
                  key: ValueKey('tab-${tab['value']}-child-${entry.key}'),
                );
              }).toList(),
            );
          }).toList(),
        ),
      ],
    );
  }
}
