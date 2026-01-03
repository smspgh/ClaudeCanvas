/**
 * ClaudeCanvas Demo Application
 * Multi-renderer comparison: Lit, React, Angular (Live), Flutter, Android (Code Preview)
 */

import '@claude-canvas/renderer-lit';
import type { CcSurface } from '@claude-canvas/renderer-lit';
import type { AgentToClientMessage, Surface, DataModel, Component } from '@claude-canvas/core';
import { setByPointer } from '@claude-canvas/core';

// React imports
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { CcSurface as CcSurfaceReact } from '@claude-canvas/renderer-react';
import '@claude-canvas/renderer-react/styles.css';

// Angular imports - currently disabled pending bundle format compatibility
// TODO: Enable when Angular renderer supports browser bundling
// import { initAngularElement } from '@claude-canvas/renderer-angular';

const SERVER_URL = 'http://localhost:3001';

// DOM Elements
const surfaceLit = document.getElementById('surface-lit') as CcSurface;
const surfaceReactContainer = document.getElementById('surface-react') as HTMLDivElement;
const promptInput = document.getElementById('prompt') as HTMLTextAreaElement;
const generateBtn = document.getElementById('generate') as HTMLButtonElement;
const newSessionBtn = document.getElementById('new-session') as HTMLButtonElement;
const iterationIndicator = document.getElementById('iteration-indicator') as HTMLSpanElement;
const emptyStateLit = document.getElementById('empty-state-lit') as HTMLDivElement;
const emptyStateReact = document.getElementById('empty-state-react') as HTMLDivElement;
const emptyStateAngular = document.getElementById('empty-state-angular') as HTMLDivElement;

// Angular surface element (custom element from @angular/elements)
const surfaceAngular = document.getElementById('surface-angular') as HTMLElement & {
  surface: Surface | null;
  initialDataModel: DataModel;
  processMessages?: (messages: AgentToClientMessage[]) => void;
};
const loading = document.getElementById('loading') as HTMLDivElement;
const jsonOutput = document.getElementById('json-output') as HTMLDivElement;
const serverStatus = document.getElementById('server-status') as HTMLDivElement;
const copyJsonBtn = document.getElementById('copy-json') as HTMLButtonElement;

// Renderer selection elements
const rendererChips = document.querySelectorAll('.renderer-chip') as NodeListOf<HTMLDivElement>;
const rendererPanels = document.querySelectorAll('.renderer-panel') as NodeListOf<HTMLDivElement>;

// Code output elements (Flutter and Android only - Angular is now a live renderer)
const flutterCode = document.getElementById('flutter-code') as HTMLPreElement;
const flutterStateCode = document.getElementById('flutter-state-code') as HTMLPreElement;
const androidCode = document.getElementById('android-code') as HTMLPreElement;
const androidViewModelCode = document.getElementById('android-viewmodel-code') as HTMLPreElement;

// React state
let reactRoot: Root | null = null;
let reactSurface: Surface | null = null;
let reactDataModel: DataModel = {};

// Tracked state for iteration
let currentSurface: Surface | null = null;
let currentDataModel: DataModel = {};

// Update iteration indicator
function updateIterationIndicator() {
  if (currentSurface && serverAvailable) {
    iterationIndicator.style.display = 'inline-block';
  } else {
    iterationIndicator.style.display = 'none';
  }
}

function renderReact() {
  if (!reactRoot) {
    reactRoot = createRoot(surfaceReactContainer);
  }

  reactRoot.render(
    React.createElement(CcSurfaceReact, {
      surface: reactSurface,
      initialDataModel: reactDataModel,
      onAction: (action) => {
        console.log('React action:', action);
        alert(`React Action: ${action.action.type}\nData: ${JSON.stringify(action.dataModel, null, 2)}`);
      },
      onDataModelChange: (dm) => {
        reactDataModel = dm;
      },
    })
  );
}

// Process messages for React
function processMessagesReact(messages: AgentToClientMessage[]) {
  for (const message of messages) {
    switch (message.type) {
      case 'surfaceUpdate':
        reactSurface = message.surface;
        break;
      case 'dataModelUpdate':
        reactDataModel = setByPointer(reactDataModel, message.path, message.data);
        break;
      case 'deleteSurface':
        if (reactSurface?.id === message.surfaceId) {
          reactSurface = null;
        }
        break;
    }
  }
  renderReact();
}

// Angular state
let angularSurface: Surface | null = null;
let angularDataModel: DataModel = {};

// Process messages for Angular
function processMessagesAngular(messages: AgentToClientMessage[]) {
  for (const message of messages) {
    switch (message.type) {
      case 'surfaceUpdate':
        angularSurface = message.surface;
        break;
      case 'dataModelUpdate':
        angularDataModel = setByPointer(angularDataModel, message.path, message.data);
        break;
      case 'deleteSurface':
        if (angularSurface?.id === message.surfaceId) {
          angularSurface = null;
        }
        break;
    }
  }
  renderAngular();
}

// Render Angular surface
function renderAngular() {
  if (!surfaceAngular) return;

  // Angular Elements use property binding, set properties directly
  if (surfaceAngular.processMessages) {
    // If the Angular component has processMessages method, use it
    // This is the preferred way as it handles change detection
  } else {
    // Fallback: Set properties directly (may require manual change detection)
    (surfaceAngular as any).surface = angularSurface;
    (surfaceAngular as any).initialDataModel = angularDataModel;
  }

  // Hide empty state if we have a surface
  if (emptyStateAngular) {
    emptyStateAngular.style.display = angularSurface ? 'none' : 'block';
  }
}

// ============================================================================
// CODE GENERATORS
// ============================================================================

function indent(code: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return code.split('\n').map(line => pad + line).join('\n');
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================================
// ANGULAR CODE GENERATOR
// ============================================================================

function generateAngularComponent(surface: Surface): string {
  const componentName = toPascalCase(surface.id || 'Generated') + 'Component';

  return `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CcSurfaceComponent } from '@claude-canvas/renderer-angular';

@Component({
  selector: 'app-${toKebabCase(surface.id || 'generated')}',
  standalone: true,
  imports: [CommonModule, CcSurfaceComponent],
  templateUrl: './${toKebabCase(surface.id || 'generated')}.component.html',
})
export class ${componentName} {
  surface = ${JSON.stringify(surface, null, 2).split('\n').map((l, i) => i === 0 ? l : '  ' + l).join('\n')};

  dataModel = signal<Record<string, unknown>>({});

  onAction(event: { action: { type: string }; dataModel: unknown }) {
    console.log('User action:', event);
    if (event.action.type === 'submit') {
      // Handle form submission
      console.log('Form data:', event.dataModel);
    }
  }

  onDataModelChange(dataModel: Record<string, unknown>) {
    this.dataModel.set(dataModel);
  }
}`;
}

function generateAngularTemplate(surface: Surface): string {
  return `<cc-surface
  [surface]="surface"
  [initialDataModel]="dataModel()"
  (action)="onAction($event)"
  (dataModelChange)="onDataModelChange($event)">
</cc-surface>`;
}

// ============================================================================
// FLUTTER CODE GENERATOR
// ============================================================================

function componentToFlutterWidget(comp: Component, indentLevel: number = 0): string {
  const pad = '  '.repeat(indentLevel);
  const childPad = '  '.repeat(indentLevel + 1);

  switch (comp.component) {
    case 'Column':
      return `${pad}Column(
${childPad}crossAxisAlignment: CrossAxisAlignment.${comp.align === 'center' ? 'center' : 'start'},
${childPad}children: [
${(comp.children as Component[] || []).map(c => componentToFlutterWidget(c, indentLevel + 2)).join(',\n')},
${childPad}],
${pad})`;

    case 'Row':
      return `${pad}Row(
${childPad}mainAxisAlignment: MainAxisAlignment.${comp.justify === 'spaceBetween' ? 'spaceBetween' : 'start'},
${childPad}children: [
${(comp.children as Component[] || []).map(c => componentToFlutterWidget(c, indentLevel + 2)).join(',\n')},
${childPad}],
${pad})`;

    case 'Card':
      return `${pad}Card(
${childPad}elevation: ${comp.elevated ? '4' : '0'},
${childPad}child: Padding(
${childPad}  padding: EdgeInsets.all(16),
${childPad}  child: ${(comp.children as Component[])?.[0] ? componentToFlutterWidget((comp.children as Component[])[0], 0).trim() : 'SizedBox()'},
${childPad}),
${pad})`;

    case 'Text':
      const textStyle = comp.textStyle === 'heading1' ? 'headlineLarge' :
                       comp.textStyle === 'heading2' ? 'headlineMedium' :
                       comp.textStyle === 'heading3' ? 'titleLarge' : 'bodyMedium';
      return `${pad}Text(
${childPad}'${comp.content || ''}',
${childPad}style: Theme.of(context).textTheme.${textStyle},
${pad})`;

    case 'TextField':
      return `${pad}TextField(
${childPad}decoration: InputDecoration(
${childPad}  labelText: '${comp.label || ''}',
${childPad}  hintText: '${comp.placeholder || ''}',
${childPad}),
${childPad}onChanged: (value) => _updateDataModel('${comp.valuePath}', value),
${pad})`;

    case 'Button':
      const variant = comp.variant === 'outline' ? 'OutlinedButton' :
                     comp.variant === 'secondary' ? 'TextButton' : 'ElevatedButton';
      return `${pad}${variant}(
${childPad}onPressed: () => _handleAction('${(comp.action as { type: string })?.type || 'custom'}'),
${childPad}child: Text('${comp.label || 'Button'}'),
${pad})`;

    case 'Checkbox':
      return `${pad}CheckboxListTile(
${childPad}title: Text('${comp.label || ''}'),
${childPad}value: _getDataModel('${comp.valuePath}') ?? false,
${childPad}onChanged: (value) => _updateDataModel('${comp.valuePath}', value),
${pad})`;

    case 'Select':
      return `${pad}DropdownButtonFormField<String>(
${childPad}decoration: InputDecoration(labelText: '${comp.label || ''}'),
${childPad}value: _getDataModel('${comp.valuePath}'),
${childPad}items: [
${(comp.options as Array<{label: string, value: string}> || []).map(o => `${childPad}  DropdownMenuItem(value: '${o.value}', child: Text('${o.label}'))`).join(',\n')},
${childPad}],
${childPad}onChanged: (value) => _updateDataModel('${comp.valuePath}', value),
${pad})`;

    case 'Slider':
      return `${pad}Column(
${childPad}crossAxisAlignment: CrossAxisAlignment.start,
${childPad}children: [
${childPad}  Text('${comp.label || ''}'),
${childPad}  Slider(
${childPad}    value: (_getDataModel('${comp.valuePath}') ?? ${comp.min ?? 0}).toDouble(),
${childPad}    min: ${comp.min ?? 0}.0,
${childPad}    max: ${comp.max ?? 100}.0,
${childPad}    divisions: ${Math.floor(((comp.max as number) ?? 100) - ((comp.min as number) ?? 0))},
${childPad}    onChanged: (value) => _updateDataModel('${comp.valuePath}', value.round()),
${childPad}  ),
${childPad}],
${pad})`;

    default:
      return `${pad}// TODO: Implement ${comp.component}
${pad}SizedBox()`;
  }
}

function generateFlutterWidget(surface: Surface): string {
  const className = toPascalCase(surface.id || 'Generated') + 'Widget';

  const widgetCode = (surface.components || []).map(c => componentToFlutterWidget(c, 3)).join(',\n');

  return `import 'package:flutter/material.dart';
import 'package:claude_canvas_renderer/claude_canvas_renderer.dart';

class ${className} extends StatefulWidget {
  const ${className}({super.key});

  @override
  State<${className}> createState() => _${className}State();
}

class _${className}State extends State<${className}> {
  Map<String, dynamic> _dataModel = {};

  dynamic _getDataModel(String path) {
    final parts = path.split('/').where((p) => p.isNotEmpty).toList();
    dynamic current = _dataModel;
    for (final part in parts) {
      if (current is Map && current.containsKey(part)) {
        current = current[part];
      } else {
        return null;
      }
    }
    return current;
  }

  void _updateDataModel(String path, dynamic value) {
    setState(() {
      final parts = path.split('/').where((p) => p.isNotEmpty).toList();
      if (parts.isEmpty) return;

      Map<String, dynamic> current = _dataModel;
      for (int i = 0; i < parts.length - 1; i++) {
        current[parts[i]] ??= <String, dynamic>{};
        current = current[parts[i]] as Map<String, dynamic>;
      }
      current[parts.last] = value;
    });
  }

  void _handleAction(String type) {
    if (type == 'submit') {
      // Handle form submission
      print('Form submitted: $_dataModel');
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
${widgetCode}
        ],
      ),
    );
  }
}`;
}

function generateFlutterState(surface: Surface): string {
  return `// State management for ${surface.id || 'generated'} widget

import 'package:flutter_riverpod/flutter_riverpod.dart';

// Data model state
final dataModelProvider = StateNotifierProvider<DataModelNotifier, Map<String, dynamic>>((ref) {
  return DataModelNotifier();
});

class DataModelNotifier extends StateNotifier<Map<String, dynamic>> {
  DataModelNotifier() : super({});

  void update(String path, dynamic value) {
    final parts = path.split('/').where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return;

    final newState = Map<String, dynamic>.from(state);
    Map<String, dynamic> current = newState;

    for (int i = 0; i < parts.length - 1; i++) {
      current[parts[i]] ??= <String, dynamic>{};
      current = Map<String, dynamic>.from(current[parts[i]] as Map);
    }
    current[parts.last] = value;

    state = newState;
  }

  dynamic get(String path) {
    final parts = path.split('/').where((p) => p.isNotEmpty).toList();
    dynamic current = state;
    for (final part in parts) {
      if (current is Map && current.containsKey(part)) {
        current = current[part];
      } else {
        return null;
      }
    }
    return current;
  }

  void reset() {
    state = {};
  }
}

// Action handler
final actionHandlerProvider = Provider((ref) {
  return ActionHandler(ref);
});

class ActionHandler {
  final Ref _ref;
  ActionHandler(this._ref);

  void handle(String type, {Map<String, dynamic>? payload}) {
    switch (type) {
      case 'submit':
        final dataModel = _ref.read(dataModelProvider);
        print('Form submitted: \$dataModel');
        break;
      case 'navigate':
        // Handle navigation
        break;
      case 'dismiss':
        // Handle dismissal
        break;
    }
  }
}`;
}

// ============================================================================
// ANDROID/KOTLIN CODE GENERATOR
// ============================================================================

function componentToKotlinComposable(comp: Component, indentLevel: number = 0): string {
  const pad = '    '.repeat(indentLevel);
  const childPad = '    '.repeat(indentLevel + 1);

  switch (comp.component) {
    case 'Column':
      return `${pad}Column(
${childPad}verticalArrangement = Arrangement.spacedBy(${comp.gap || 8}.dp),
${childPad}horizontalAlignment = Alignment.${comp.align === 'center' ? 'CenterHorizontally' : 'Start'}
${pad}) {
${(comp.children as Component[] || []).map(c => componentToKotlinComposable(c, indentLevel + 1)).join('\n')}
${pad}}`;

    case 'Row':
      return `${pad}Row(
${childPad}horizontalArrangement = Arrangement.${comp.justify === 'spaceBetween' ? 'SpaceBetween' : `spacedBy(${comp.gap || 8}.dp)`},
${childPad}verticalAlignment = Alignment.CenterVertically
${pad}) {
${(comp.children as Component[] || []).map(c => componentToKotlinComposable(c, indentLevel + 1)).join('\n')}
${pad}}`;

    case 'Card':
      return `${pad}Card(
${childPad}elevation = CardDefaults.cardElevation(defaultElevation = ${comp.elevated ? '4' : '0'}.dp)
${pad}) {
${childPad}Column(modifier = Modifier.padding(16.dp)) {
${(comp.children as Component[] || []).map(c => componentToKotlinComposable(c, indentLevel + 2)).join('\n')}
${childPad}}
${pad}}`;

    case 'Text':
      const style = comp.textStyle === 'heading1' ? 'headlineLarge' :
                   comp.textStyle === 'heading2' ? 'headlineMedium' :
                   comp.textStyle === 'heading3' ? 'titleLarge' : 'bodyMedium';
      return `${pad}Text(
${childPad}text = "${comp.content || ''}",
${childPad}style = MaterialTheme.typography.${style}
${pad})`;

    case 'TextField':
      return `${pad}OutlinedTextField(
${childPad}value = viewModel.getField("${comp.valuePath}") ?: "",
${childPad}onValueChange = { viewModel.updateField("${comp.valuePath}", it) },
${childPad}label = { Text("${comp.label || ''}") },
${childPad}placeholder = { Text("${comp.placeholder || ''}") },
${childPad}modifier = Modifier.fillMaxWidth()
${pad})`;

    case 'Button':
      const buttonType = comp.variant === 'outline' ? 'OutlinedButton' :
                        comp.variant === 'secondary' ? 'TextButton' : 'Button';
      return `${pad}${buttonType}(
${childPad}onClick = { viewModel.handleAction("${(comp.action as { type: string })?.type || 'custom'}") }
${pad}) {
${childPad}Text("${comp.label || 'Button'}")
${pad}}`;

    case 'Checkbox':
      return `${pad}Row(
${childPad}verticalAlignment = Alignment.CenterVertically,
${childPad}modifier = Modifier.clickable {
${childPad}    viewModel.toggleField("${comp.valuePath}")
${childPad}}
${pad}) {
${childPad}Checkbox(
${childPad}    checked = viewModel.getField("${comp.valuePath}") == true,
${childPad}    onCheckedChange = { viewModel.updateField("${comp.valuePath}", it) }
${childPad})
${childPad}Text("${comp.label || ''}")
${pad}}`;

    case 'Select':
      return `${pad}// Dropdown for ${comp.label || 'Select'}
${pad}ExposedDropdownMenuBox(
${childPad}expanded = expanded,
${childPad}onExpandedChange = { expanded = !expanded }
${pad}) {
${childPad}OutlinedTextField(
${childPad}    value = viewModel.getField("${comp.valuePath}") ?: "",
${childPad}    onValueChange = {},
${childPad}    readOnly = true,
${childPad}    label = { Text("${comp.label || ''}") },
${childPad}    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded) },
${childPad}    modifier = Modifier.menuAnchor().fillMaxWidth()
${childPad})
${childPad}ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
${(comp.options as Array<{label: string, value: string}> || []).map(o => `${childPad}    DropdownMenuItem(text = { Text("${o.label}") }, onClick = { viewModel.updateField("${comp.valuePath}", "${o.value}"); expanded = false })`).join('\n')}
${childPad}}
${pad}}`;

    case 'Slider':
      return `${pad}Column {
${childPad}Text("${comp.label || ''}")
${childPad}Slider(
${childPad}    value = (viewModel.getField("${comp.valuePath}") as? Number)?.toFloat() ?: ${comp.min || 0}f,
${childPad}    onValueChange = { viewModel.updateField("${comp.valuePath}", it.toInt()) },
${childPad}    valueRange = ${comp.min || 0}f..${comp.max || 100}f,
${childPad}    steps = ${Math.floor(((comp.max as number) ?? 100) - ((comp.min as number) ?? 0)) - 1}
${childPad})
${pad}}`;

    default:
      return `${pad}// TODO: Implement ${comp.component}
${pad}Spacer(modifier = Modifier.height(8.dp))`;
  }
}

function generateAndroidComposable(surface: Surface): string {
  const screenName = toPascalCase(surface.id || 'Generated') + 'Screen';

  const composableCode = (surface.components || []).map(c => componentToKotlinComposable(c, 2)).join('\n');

  return `package com.example.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ${screenName}(
    viewModel: ${screenName}ViewModel = viewModel()
) {
    var expanded by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
${composableCode}
    }
}`;
}

function generateAndroidViewModel(surface: Surface): string {
  const screenName = toPascalCase(surface.id || 'Generated') + 'Screen';

  return `package com.example.app.ui.screens

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

class ${screenName}ViewModel : ViewModel() {

    private val _dataModel = MutableStateFlow<Map<String, Any?>>(emptyMap())
    val dataModel: StateFlow<Map<String, Any?>> = _dataModel.asStateFlow()

    fun getField(path: String): Any? {
        val parts = path.split("/").filter { it.isNotEmpty() }
        var current: Any? = _dataModel.value
        for (part in parts) {
            current = (current as? Map<*, *>)?.get(part)
        }
        return current
    }

    fun updateField(path: String, value: Any?) {
        val parts = path.split("/").filter { it.isNotEmpty() }
        if (parts.isEmpty()) return

        _dataModel.update { currentMap ->
            val newMap = currentMap.toMutableMap()
            var current = newMap

            for (i in 0 until parts.size - 1) {
                val part = parts[i]
                if (!current.containsKey(part) || current[part] !is MutableMap<*, *>) {
                    current[part] = mutableMapOf<String, Any?>()
                }
                @Suppress("UNCHECKED_CAST")
                current = current[part] as MutableMap<String, Any?>
            }
            current[parts.last()] = value

            newMap
        }
    }

    fun toggleField(path: String) {
        val current = getField(path) as? Boolean ?: false
        updateField(path, !current)
    }

    fun handleAction(type: String) {
        when (type) {
            "submit" -> {
                // Handle form submission
                println("Form submitted: \${_dataModel.value}")
            }
            "navigate" -> {
                // Handle navigation
            }
            "dismiss" -> {
                // Handle dismissal
            }
        }
    }

    fun reset() {
        _dataModel.value = emptyMap()
    }
}`;
}

// ============================================================================
// UPDATE CODE PREVIEWS
// ============================================================================

function updateCodePreviews(surface: Surface) {
  // Flutter
  if (flutterCode) flutterCode.textContent = generateFlutterWidget(surface);
  if (flutterStateCode) flutterStateCode.textContent = generateFlutterState(surface);

  // Android
  if (androidCode) androidCode.textContent = generateAndroidComposable(surface);
  if (androidViewModelCode) androidViewModelCode.textContent = generateAndroidViewModel(surface);
}

// ============================================================================
// RENDERER SELECTION
// ============================================================================

function setupRendererSelection() {
  rendererChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const renderer = chip.dataset.renderer;
      if (!renderer) return;

      // Toggle selection
      chip.classList.toggle('selected');

      // Update panel visibility
      const panel = document.querySelector(`.renderer-panel[data-renderer="${renderer}"]`) as HTMLDivElement;
      if (panel) {
        if (chip.classList.contains('selected')) {
          panel.classList.add('visible');
        } else {
          panel.classList.remove('visible');
        }
      }
    });
  });
}

// Setup code tabs
function setupCodeTabs() {
  document.querySelectorAll('.code-tabs').forEach(tabContainer => {
    const tabs = tabContainer.querySelectorAll('.code-tab');
    const panel = tabContainer.closest('.renderer-panel');
    if (!panel) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = (tab as HTMLElement).dataset.tab;
        if (!tabName) return;

        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update content visibility
        panel.querySelectorAll('.code-content').forEach(content => {
          content.classList.remove('active');
        });

        const contentId = panel.id.replace('-panel', `-${tabName}`);
        const content = document.getElementById(contentId);
        if (content) {
          content.classList.add('active');
        }
      });
    });
  });
}

// Check server connection
async function checkServer(): Promise<boolean> {
  try {
    const response = await fetch(`${SERVER_URL}/health`);
    if (response.ok) {
      serverStatus.textContent = 'Connected to Claude Code';
      serverStatus.style.color = '#22c55e';
      return true;
    }
  } catch {
    // Server not available
  }
  serverStatus.textContent = 'Server offline - using demo mode';
  serverStatus.style.color = '#ef4444';
  return false;
}

// Demo responses for when server is offline
const demoResponses: Record<string, AgentToClientMessage[]> = {
  dashboard: [
    {
      type: 'dataModelUpdate',
      path: '/',
      data: {
        chartData: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            { label: 'Revenue', data: [12000, 19000, 15000, 22000, 18000, 25000], color: '#6366f1' },
            { label: 'Expenses', data: [8000, 11000, 9500, 13000, 10000, 14000], color: '#f43f5e' },
          ],
        },
        orders: [
          { id: 1, customer: 'Acme Corp', amount: 1250, status: 'Completed' },
          { id: 2, customer: 'TechStart Inc', amount: 890, status: 'Pending' },
          { id: 3, customer: 'Global Foods', amount: 2100, status: 'Completed' },
          { id: 4, customer: 'City Motors', amount: 3400, status: 'Processing' },
          { id: 5, customer: 'DataFlow LLC', amount: 1780, status: 'Completed' },
          { id: 6, customer: 'CloudSync Pro', amount: 2950, status: 'Pending' },
          { id: 7, customer: 'GreenEnergy Co', amount: 4200, status: 'Completed' },
          { id: 8, customer: 'SmartHome Ltd', amount: 1100, status: 'Processing' },
        ],
      },
    },
    {
      type: 'surfaceUpdate',
      surface: {
        id: 'dashboard',
        title: 'Sales Dashboard',
        components: [
          {
            component: 'Column',
            gap: 24,
            children: [
              { component: 'Text', content: 'Sales Dashboard', textStyle: 'heading1' },
              {
                component: 'Card',
                elevated: true,
                children: [
                  {
                    component: 'Column',
                    gap: 16,
                    children: [
                      { component: 'Text', content: 'Monthly Revenue vs Expenses', textStyle: 'heading3' },
                      {
                        component: 'Chart',
                        chartType: 'bar',
                        dataPath: '/chartData',
                        title: 'Revenue Comparison',
                        showLegend: true,
                        height: 280,
                      },
                    ],
                  },
                ],
              },
              {
                component: 'Card',
                elevated: true,
                children: [
                  {
                    component: 'Column',
                    gap: 16,
                    children: [
                      { component: 'Text', content: 'Recent Orders', textStyle: 'heading3' },
                      {
                        component: 'DataTable',
                        dataPath: '/orders',
                        columns: [
                          { key: 'id', label: 'ID', width: 60, sortable: true },
                          { key: 'customer', label: 'Customer', sortable: true },
                          { key: 'amount', label: 'Amount ($)', sortable: true },
                          { key: 'status', label: 'Status', sortable: true },
                        ],
                        pagination: true,
                        pageSize: 5,
                        searchable: true,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
  editor: [
    {
      type: 'dataModelUpdate',
      path: '/',
      data: {
        content: '<h2>Welcome to the Editor</h2><p>Start typing your content here...</p>',
      },
    },
    {
      type: 'surfaceUpdate',
      surface: {
        id: 'editor',
        title: 'Rich Text Editor',
        components: [
          {
            component: 'Card',
            elevated: true,
            children: [
              {
                component: 'Column',
                gap: 16,
                children: [
                  { component: 'Text', content: 'Document Editor', textStyle: 'heading2' },
                  {
                    component: 'RichTextEditor',
                    valuePath: '/content',
                    placeholder: 'Start writing...',
                    minHeight: 300,
                    toolbar: ['bold', 'italic', 'underline', 'heading', 'list', 'link', 'code'],
                  },
                  {
                    component: 'Row',
                    gap: 12,
                    justify: 'end',
                    children: [
                      { component: 'Button', label: 'Cancel', variant: 'outline', action: { type: 'custom', event: 'cancel' } },
                      { component: 'Button', label: 'Save Document', variant: 'primary', action: { type: 'submit' } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
  charts: [
    {
      type: 'dataModelUpdate',
      path: '/',
      data: {
        pieData: {
          labels: ['Product A', 'Product B', 'Product C', 'Product D'],
          datasets: [{ label: 'Sales', data: [35, 25, 22, 18], color: '#6366f1' }],
        },
        lineData: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
          datasets: [
            { label: 'Visitors', data: [1200, 1900, 1700, 2400, 2100, 2800], color: '#22c55e' },
            { label: 'Conversions', data: [120, 180, 150, 220, 190, 260], color: '#f97316' },
          ],
        },
      },
    },
    {
      type: 'surfaceUpdate',
      surface: {
        id: 'charts',
        title: 'Chart Gallery',
        components: [
          {
            component: 'Column',
            gap: 24,
            children: [
              { component: 'Text', content: 'Chart Gallery', textStyle: 'heading1' },
              {
                component: 'Row',
                gap: 24,
                wrap: true,
                children: [
                  {
                    component: 'Card',
                    elevated: true,
                    style: { flex: 1, minWidth: 300 },
                    children: [
                      {
                        component: 'Column',
                        gap: 12,
                        children: [
                          { component: 'Text', content: 'Product Distribution (Pie)', textStyle: 'heading3' },
                          { component: 'Chart', chartType: 'pie', dataPath: '/pieData', showLegend: true, height: 250 },
                        ],
                      },
                    ],
                  },
                  {
                    component: 'Card',
                    elevated: true,
                    style: { flex: 1, minWidth: 300 },
                    children: [
                      {
                        component: 'Column',
                        gap: 12,
                        children: [
                          { component: 'Text', content: 'Product Distribution (Doughnut)', textStyle: 'heading3' },
                          { component: 'Chart', chartType: 'doughnut', dataPath: '/pieData', showLegend: true, height: 250 },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                component: 'Card',
                elevated: true,
                children: [
                  {
                    component: 'Column',
                    gap: 12,
                    children: [
                      { component: 'Text', content: 'Website Traffic (Line Chart)', textStyle: 'heading3' },
                      { component: 'Chart', chartType: 'line', dataPath: '/lineData', showLegend: true, height: 300 },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
  settings: [
    {
      type: 'dataModelUpdate',
      path: '/',
      data: {
        settings: { volume: 50, theme: 'system', notifications: true, sounds: false },
      },
    },
    {
      type: 'surfaceUpdate',
      surface: {
        id: 'settings-form',
        title: 'Settings',
        components: [
          {
            component: 'Card',
            elevated: true,
            children: [
              {
                component: 'Column',
                gap: 20,
                children: [
                  { component: 'Text', content: 'Settings', textStyle: 'heading2' },
                  {
                    component: 'Slider',
                    valuePath: '/settings/volume',
                    label: 'Volume',
                    min: 0,
                    max: 100,
                    step: 1,
                  },
                  {
                    component: 'Select',
                    valuePath: '/settings/theme',
                    label: 'Theme',
                    options: [
                      { label: 'Light', value: 'light' },
                      { label: 'Dark', value: 'dark' },
                      { label: 'System', value: 'system' },
                    ],
                  },
                  {
                    component: 'Checkbox',
                    valuePath: '/settings/notifications',
                    label: 'Enable Notifications',
                  },
                  {
                    component: 'Checkbox',
                    valuePath: '/settings/sounds',
                    label: 'Enable Sounds',
                  },
                  {
                    component: 'Button',
                    label: 'Save Settings',
                    variant: 'primary',
                    action: { type: 'submit' },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
  login: [
    {
      type: 'dataModelUpdate',
      path: '/',
      data: {
        form: { email: '', password: '', rememberMe: false },
      },
    },
    {
      type: 'surfaceUpdate',
      surface: {
        id: 'login-form',
        title: 'Sign In',
        components: [
          {
            component: 'Column',
            gap: 16,
            children: [
              {
                component: 'TextField',
                valuePath: '/form/email',
                label: 'Email',
                placeholder: 'Enter your email',
                inputType: 'email',
                required: true,
              },
              {
                component: 'TextField',
                valuePath: '/form/password',
                label: 'Password',
                placeholder: 'Enter your password',
                inputType: 'password',
                required: true,
              },
              {
                component: 'Checkbox',
                valuePath: '/form/rememberMe',
                label: 'Remember me',
              },
              {
                component: 'Button',
                label: 'Sign In',
                variant: 'primary',
                action: { type: 'submit' },
              },
            ],
          },
        ],
      },
    },
  ],
  profile: [
    {
      type: 'dataModelUpdate',
      path: '/',
      data: {
        profile: { name: '', country: 'us' },
      },
    },
    {
      type: 'surfaceUpdate',
      surface: {
        id: 'profile-card',
        title: 'User Profile',
        components: [
          {
            component: 'Card',
            elevated: true,
            children: [
              {
                component: 'Column',
                gap: 16,
                children: [
                  {
                    component: 'Row',
                    gap: 12,
                    children: [
                      { component: 'Text', content: 'Profile Settings', textStyle: 'heading2' },
                      { component: 'Icon', name: 'settings', size: 24, color: '#666' },
                    ],
                  },
                  {
                    component: 'TextField',
                    valuePath: '/profile/name',
                    label: 'Name',
                    placeholder: 'Enter your name',
                  },
                  {
                    component: 'Select',
                    valuePath: '/profile/country',
                    label: 'Country',
                    options: [
                      { label: 'United States', value: 'us' },
                      { label: 'United Kingdom', value: 'uk' },
                      { label: 'Canada', value: 'ca' },
                      { label: 'Australia', value: 'au' },
                    ],
                  },
                  {
                    component: 'Button',
                    label: 'Save',
                    variant: 'primary',
                    action: { type: 'submit' },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
};

function matchDemoPrompt(prompt: string): AgentToClientMessage[] | null {
  const lower = prompt.toLowerCase();
  if (lower.includes('dashboard') || lower.includes('sales') || lower.includes('table')) return demoResponses.dashboard;
  if (lower.includes('chart') || lower.includes('graph') || lower.includes('pie') || lower.includes('line')) return demoResponses.charts;
  if (lower.includes('editor') || lower.includes('rich text') || lower.includes('wysiwyg')) return demoResponses.editor;
  if (lower.includes('settings') || lower.includes('slider') || lower.includes('volume')) return demoResponses.settings;
  if (lower.includes('login') || lower.includes('sign in')) return demoResponses.login;
  if (lower.includes('profile') || lower.includes('user')) return demoResponses.profile;
  return null;
}

let serverAvailable = false;

async function generateUI() {
  const prompt = promptInput.value.trim();
  if (!prompt) return;

  // Show loading, hide empty states
  emptyStateLit.style.display = 'none';
  emptyStateReact.style.display = 'none';
  if (emptyStateAngular) emptyStateAngular.style.display = 'none';
  loading.style.display = 'flex';
  generateBtn.disabled = true;

  let messages: AgentToClientMessage[];
  let isIteration = false;

  if (serverAvailable) {
    try {
      // Send current state for iteration support
      const requestBody: Record<string, unknown> = { prompt };
      if (currentSurface) {
        requestBody.currentSurface = currentSurface;
        requestBody.dataModel = currentDataModel;
      }

      const response = await fetch(`${SERVER_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      messages = data.messages;
      isIteration = data.isIteration;
    } catch (error) {
      console.error('Server error, falling back to demo:', error);
      messages = matchDemoPrompt(prompt) ?? demoResponses.settings;
    }
  } else {
    // Demo mode
    await new Promise(resolve => setTimeout(resolve, 500));
    messages = matchDemoPrompt(prompt) ?? demoResponses.settings;
  }

  // Process messages for all live renderers
  surfaceLit.processMessages(messages);
  processMessagesReact(messages);
  processMessagesAngular(messages);

  // Track state for future iterations
  for (const msg of messages) {
    if (msg.type === 'surfaceUpdate') {
      currentSurface = msg.surface;
      // Update code previews
      updateCodePreviews(msg.surface);
    } else if (msg.type === 'dataModelUpdate') {
      if (msg.path === '/') {
        currentDataModel = msg.data as DataModel;
      } else {
        currentDataModel = setByPointer(currentDataModel, msg.path, msg.data);
      }
    }
  }
  updateIterationIndicator();

  // Show JSON output
  const outputData = isIteration
    ? { messages, note: 'Iterated on existing UI' }
    : { messages };
  jsonOutput.textContent = JSON.stringify(outputData, null, 2);

  // Hide loading
  loading.style.display = 'none';
  generateBtn.disabled = false;
}

// Clear session and start fresh
async function clearSession() {
  // Clear local state
  currentSurface = null;
  currentDataModel = {};
  reactSurface = null;
  reactDataModel = {};
  angularSurface = null;
  angularDataModel = {};

  // Clear server state if available
  if (serverAvailable) {
    try {
      await fetch(`${SERVER_URL}/api/clear`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to clear server state:', error);
    }
  }

  // Reset UI
  surfaceLit.processMessages([{ type: 'deleteSurface', surfaceId: 'main' }]);
  renderReact();
  renderAngular();
  emptyStateLit.style.display = 'block';
  emptyStateReact.style.display = 'block';
  if (emptyStateAngular) emptyStateAngular.style.display = 'block';
  jsonOutput.textContent = '// Generated JSON will appear here';

  // Reset code previews (Flutter and Android only)
  if (flutterCode) flutterCode.textContent = '// Generate a UI to see Flutter code';
  if (flutterStateCode) flutterStateCode.textContent = '// Generate a UI to see Flutter state';
  if (androidCode) androidCode.textContent = '// Generate a UI to see Android code';
  if (androidViewModelCode) androidViewModelCode.textContent = '// Generate a UI to see Android ViewModel';

  updateIterationIndicator();

  console.log('[ClaudeCanvas] Session cleared - next prompt will start fresh');
}

// Event listeners
generateBtn.addEventListener('click', generateUI);
newSessionBtn.addEventListener('click', clearSession);

promptInput.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    generateUI();
  }
});

// Handle Lit user actions
surfaceLit.addEventListener('cc-user-action', async (e: Event) => {
  const detail = (e as CustomEvent).detail;
  console.log('Lit action:', detail);
  alert(`Lit Action: ${detail.action.type}\nData: ${JSON.stringify(detail.dataModel, null, 2)}`);
});

// Copy JSON button
copyJsonBtn.addEventListener('click', async () => {
  const jsonText = jsonOutput.textContent ?? '';
  if (jsonText && jsonText !== '// Generated JSON will appear here') {
    try {
      await navigator.clipboard.writeText(jsonText);
      copyJsonBtn.textContent = 'Copied!';
      copyJsonBtn.classList.add('copied');
      setTimeout(() => {
        copyJsonBtn.textContent = 'Copy JSON';
        copyJsonBtn.classList.remove('copied');
      }, 2000);
    } catch {
      console.error('Failed to copy JSON');
    }
  }
});

// Initialize
(async () => {
  serverAvailable = await checkServer();
  console.log('ClaudeCanvas Multi-Renderer Demo loaded');
  console.log('Server available:', serverAvailable);
  if (!serverAvailable) {
    console.log('Demo prompts: "dashboard", "charts", "editor", "settings", "login", "profile"');
  }

  // Setup renderer selection
  setupRendererSelection();

  // Setup code tabs
  setupCodeTabs();

  // Initialize React root
  renderReact();

  // Initialize Angular custom element (disabled pending bundle format compatibility)
  // try {
  //   await initAngularElement();
  //   console.log('Angular renderer initialized');
  // } catch (error) {
  //   console.error('Failed to initialize Angular renderer:', error);
  // }
})();
