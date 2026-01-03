import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../utils/json_pointer.dart';

/// Chart component for data visualization
class CcChart extends StatelessWidget {
  final Map<String, dynamic> component;
  final Map<String, dynamic> dataModel;

  const CcChart({
    super.key,
    required this.component,
    required this.dataModel,
  });

  @override
  Widget build(BuildContext context) {
    final chartType = component['chartType'] as String? ?? 'bar';
    final title = component['title'] as String?;
    final showLegend = component['showLegend'] as bool? ?? true;
    final height = (component['height'] as num?)?.toDouble() ?? 300;

    // Get data from dataPath or direct data
    Map<String, dynamic>? chartData;
    if (component['dataPath'] != null) {
      final data = getByPointer(dataModel, component['dataPath'] as String);
      if (data is Map<String, dynamic>) {
        chartData = data;
      }
    } else if (component['data'] != null) {
      chartData = component['data'] as Map<String, dynamic>?;
    }

    if (chartData == null) {
      return SizedBox(
        height: height,
        child: const Center(child: Text('No chart data')),
      );
    }

    final labels = (chartData['labels'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [];
    final datasets = (chartData['datasets'] as List<dynamic>?)
            ?.map((e) => Map<String, dynamic>.from(e as Map))
            .toList() ??
        [];

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (title != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
          ),
        SizedBox(
          height: height,
          child: _buildChart(chartType, labels, datasets),
        ),
        if (showLegend && datasets.isNotEmpty) _buildLegend(datasets),
      ],
    );
  }

  Widget _buildChart(String type, List<String> labels, List<Map<String, dynamic>> datasets) {
    switch (type) {
      case 'line':
        return _buildLineChart(labels, datasets);
      case 'pie':
        return _buildPieChart(labels, datasets);
      case 'doughnut':
        return _buildPieChart(labels, datasets, isDoughnut: true);
      case 'bar':
      default:
        return _buildBarChart(labels, datasets);
    }
  }

  Widget _buildBarChart(List<String> labels, List<Map<String, dynamic>> datasets) {
    final groups = <BarChartGroupData>[];

    for (var i = 0; i < labels.length; i++) {
      final rods = <BarChartRodData>[];
      for (var j = 0; j < datasets.length; j++) {
        final dataset = datasets[j];
        final data = (dataset['data'] as List<dynamic>?) ?? [];
        final value = i < data.length ? (data[i] as num).toDouble() : 0.0;
        final color = _parseColor(dataset['color'] as String?) ?? Colors.blue;

        rods.add(BarChartRodData(
          toY: value,
          color: color,
          width: 16,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(4),
            topRight: Radius.circular(4),
          ),
        ));
      }
      groups.add(BarChartGroupData(x: i, barRods: rods));
    }

    return BarChart(
      BarChartData(
        barGroups: groups,
        titlesData: FlTitlesData(
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                final index = value.toInt();
                if (index >= 0 && index < labels.length) {
                  return Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(labels[index], style: const TextStyle(fontSize: 10)),
                  );
                }
                return const SizedBox.shrink();
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 40,
              getTitlesWidget: (value, meta) {
                return Text(value.toInt().toString(), style: const TextStyle(fontSize: 10));
              },
            ),
          ),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false),
        gridData: const FlGridData(show: true, drawVerticalLine: false),
      ),
    );
  }

  Widget _buildLineChart(List<String> labels, List<Map<String, dynamic>> datasets) {
    final lines = <LineChartBarData>[];

    for (final dataset in datasets) {
      final data = (dataset['data'] as List<dynamic>?) ?? [];
      final color = _parseColor(dataset['color'] as String?) ?? Colors.blue;

      final spots = <FlSpot>[];
      for (var i = 0; i < data.length; i++) {
        spots.add(FlSpot(i.toDouble(), (data[i] as num).toDouble()));
      }

      lines.add(LineChartBarData(
        spots: spots,
        color: color,
        barWidth: 3,
        dotData: const FlDotData(show: true),
        belowBarData: BarAreaData(
          show: true,
          color: color.withOpacity(0.1),
        ),
      ));
    }

    return LineChart(
      LineChartData(
        lineBarsData: lines,
        titlesData: FlTitlesData(
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                final index = value.toInt();
                if (index >= 0 && index < labels.length) {
                  return Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(labels[index], style: const TextStyle(fontSize: 10)),
                  );
                }
                return const SizedBox.shrink();
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 40,
              getTitlesWidget: (value, meta) {
                return Text(value.toInt().toString(), style: const TextStyle(fontSize: 10));
              },
            ),
          ),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false),
        gridData: const FlGridData(show: true),
      ),
    );
  }

  Widget _buildPieChart(List<String> labels, List<Map<String, dynamic>> datasets, {bool isDoughnut = false}) {
    if (datasets.isEmpty) return const SizedBox.shrink();

    final dataset = datasets[0];
    final data = (dataset['data'] as List<dynamic>?) ?? [];
    final colors = [
      const Color(0xFF6366F1),
      const Color(0xFFF43F5E),
      const Color(0xFF22C55E),
      const Color(0xFFF97316),
      const Color(0xFF8B5CF6),
      const Color(0xFF06B6D4),
    ];

    final sections = <PieChartSectionData>[];
    for (var i = 0; i < data.length; i++) {
      sections.add(PieChartSectionData(
        value: (data[i] as num).toDouble(),
        title: i < labels.length ? labels[i] : '',
        color: colors[i % colors.length],
        radius: isDoughnut ? 60 : 100,
        titleStyle: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold),
      ));
    }

    return PieChart(
      PieChartData(
        sections: sections,
        centerSpaceRadius: isDoughnut ? 40 : 0,
        sectionsSpace: 2,
      ),
    );
  }

  Widget _buildLegend(List<Map<String, dynamic>> datasets) {
    return Padding(
      padding: const EdgeInsets.only(top: 16),
      child: Wrap(
        spacing: 16,
        runSpacing: 8,
        children: datasets.map((dataset) {
          final label = dataset['label'] as String? ?? '';
          final color = _parseColor(dataset['color'] as String?) ?? Colors.blue;

          return Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 6),
              Text(label, style: const TextStyle(fontSize: 12)),
            ],
          );
        }).toList(),
      ),
    );
  }

  Color? _parseColor(String? color) {
    if (color == null) return null;
    if (color.startsWith('#')) {
      final hex = color.substring(1);
      if (hex.length == 6) {
        return Color(int.parse('FF$hex', radix: 16));
      }
    }
    return null;
  }
}
