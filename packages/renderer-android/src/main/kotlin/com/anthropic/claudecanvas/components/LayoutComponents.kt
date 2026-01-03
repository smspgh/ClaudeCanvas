package com.anthropic.claudecanvas.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.anthropic.claudecanvas.*
import com.anthropic.claudecanvas.utils.JsonPointer
import com.anthropic.claudecanvas.utils.VisibilityEvaluator
import kotlinx.serialization.json.*

/**
 * Row layout component - horizontal arrangement
 */
@Composable
fun CcRow(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    onAction: (Action) -> Unit,
    modifier: Modifier = Modifier
) {
    val gap = component["gap"]?.jsonPrimitive?.intOrNull ?: 8
    val align = component["align"]?.jsonPrimitive?.content ?: "start"
    val justify = component["justify"]?.jsonPrimitive?.content ?: "start"
    val children = component["children"]?.jsonArray?.map {
        Json.decodeFromJsonElement<ComponentDefinition>(it)
    } ?: emptyList()

    val verticalAlignment = when (align) {
        "center" -> Alignment.CenterVertically
        "end" -> Alignment.Bottom
        else -> Alignment.Top
    }

    val horizontalArrangement = when (justify) {
        "center" -> Arrangement.Center
        "end" -> Arrangement.End
        "spaceBetween" -> Arrangement.SpaceBetween
        "spaceAround" -> Arrangement.SpaceAround
        "spaceEvenly" -> Arrangement.SpaceEvenly
        else -> Arrangement.Start
    }

    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = horizontalArrangement,
        verticalAlignment = verticalAlignment
    ) {
        children.forEachIndexed { index, child ->
            if (VisibilityEvaluator.evaluate(child.visibleIf, dataModel)) {
                CcComponent(child, dataModel, onInputChange, onAction)
                if (index < children.size - 1) {
                    Spacer(modifier = Modifier.width(gap.dp))
                }
            }
        }
    }
}

/**
 * Column layout component - vertical arrangement
 */
@Composable
fun CcColumn(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    onAction: (Action) -> Unit,
    modifier: Modifier = Modifier
) {
    val gap = component["gap"]?.jsonPrimitive?.intOrNull ?: 8
    val align = component["align"]?.jsonPrimitive?.content ?: "start"
    val children = component["children"]?.jsonArray?.map {
        Json.decodeFromJsonElement<ComponentDefinition>(it)
    } ?: emptyList()

    val horizontalAlignment = when (align) {
        "center" -> Alignment.CenterHorizontally
        "end" -> Alignment.End
        else -> Alignment.Start
    }

    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = horizontalAlignment
    ) {
        children.forEachIndexed { index, child ->
            if (VisibilityEvaluator.evaluate(child.visibleIf, dataModel)) {
                CcComponent(child, dataModel, onInputChange, onAction)
                if (index < children.size - 1) {
                    Spacer(modifier = Modifier.height(gap.dp))
                }
            }
        }
    }
}

/**
 * Card container component
 */
@Composable
fun CcCard(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    onAction: (Action) -> Unit,
    modifier: Modifier = Modifier
) {
    val title = component["title"]?.jsonPrimitive?.content
    val subtitle = component["subtitle"]?.jsonPrimitive?.content
    val elevation = component["elevation"]?.jsonPrimitive?.intOrNull ?: 1
    val padding = component["padding"]?.jsonPrimitive?.intOrNull ?: 16
    val children = component["children"]?.jsonArray?.map {
        Json.decodeFromJsonElement<ComponentDefinition>(it)
    } ?: emptyList()

    Card(
        modifier = modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = elevation.dp),
        shape = RoundedCornerShape(8.dp)
    ) {
        Column(modifier = Modifier.padding(padding.dp)) {
            if (title != null) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium
                )
                subtitle?.let {
                    Text(
                        text = it,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
            }

            children.forEach { child ->
                if (VisibilityEvaluator.evaluate(child.visibleIf, dataModel)) {
                    CcComponent(child, dataModel, onInputChange, onAction)
                }
            }
        }
    }
}

/**
 * Divider component
 */
@Composable
fun CcDivider(
    component: ComponentDefinition,
    modifier: Modifier = Modifier
) {
    val orientation = component["orientation"]?.jsonPrimitive?.content ?: "horizontal"
    val thickness = component["thickness"]?.jsonPrimitive?.intOrNull ?: 1
    val color = component["color"]?.jsonPrimitive?.content

    val dividerColor = if (color != null) {
        try { Color(android.graphics.Color.parseColor(color)) }
        catch (e: Exception) { MaterialTheme.colorScheme.outlineVariant }
    } else {
        MaterialTheme.colorScheme.outlineVariant
    }

    if (orientation == "vertical") {
        VerticalDivider(
            modifier = modifier.height(IntrinsicSize.Max),
            thickness = thickness.dp,
            color = dividerColor
        )
    } else {
        HorizontalDivider(
            modifier = modifier.fillMaxWidth().padding(vertical = 8.dp),
            thickness = thickness.dp,
            color = dividerColor
        )
    }
}

/**
 * Modal dialog component
 */
@Composable
fun CcModal(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    onAction: (Action) -> Unit
) {
    val openPath = component["openPath"]?.jsonPrimitive?.content
    val isOpen = if (openPath != null) {
        JsonPointer.getBoolean(dataModel, openPath)
    } else {
        component["open"]?.jsonPrimitive?.booleanOrNull ?: false
    }
    val title = component["title"]?.jsonPrimitive?.content
    val size = component["size"]?.jsonPrimitive?.content ?: "medium"
    val dismissible = component["dismissible"]?.jsonPrimitive?.booleanOrNull ?: true
    val children = component["children"]?.jsonArray?.map {
        Json.decodeFromJsonElement<ComponentDefinition>(it)
    } ?: emptyList()

    if (isOpen) {
        Dialog(
            onDismissRequest = {
                if (dismissible && openPath != null) {
                    onInputChange(openPath, false)
                }
            }
        ) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(24.dp)) {
                    if (title != null) {
                        Text(
                            text = title,
                            style = MaterialTheme.typography.headlineSmall
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                    }

                    children.forEach { child ->
                        if (VisibilityEvaluator.evaluate(child.visibleIf, dataModel)) {
                            CcComponent(child, dataModel, onInputChange, onAction)
                        }
                    }
                }
            }
        }
    }
}

/**
 * Tabs component
 */
@Composable
fun CcTabs(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    onAction: (Action) -> Unit,
    modifier: Modifier = Modifier
) {
    val tabsJson = component["tabs"]?.jsonArray
    val tabs = tabsJson?.map { Json.decodeFromJsonElement<TabDefinition>(it) } ?: emptyList()
    val selectedPath = component["selectedPath"]?.jsonPrimitive?.content
    val defaultTab = component["defaultTab"]?.jsonPrimitive?.content ?: tabs.firstOrNull()?.id

    var selectedTabIndex by remember {
        val initialIndex = if (selectedPath != null) {
            val selectedId = JsonPointer.getString(dataModel, selectedPath)
            tabs.indexOfFirst { it.id == selectedId }.takeIf { it >= 0 } ?: 0
        } else {
            tabs.indexOfFirst { it.id == defaultTab }.takeIf { it >= 0 } ?: 0
        }
        mutableStateOf(initialIndex)
    }

    Column(modifier = modifier.fillMaxWidth()) {
        TabRow(selectedTabIndex = selectedTabIndex) {
            tabs.forEachIndexed { index, tab ->
                Tab(
                    selected = selectedTabIndex == index,
                    onClick = {
                        selectedTabIndex = index
                        selectedPath?.let { onInputChange(it, tab.id) }
                    },
                    text = { Text(tab.label) },
                    enabled = !tab.disabled
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Render selected tab content
        tabs.getOrNull(selectedTabIndex)?.content?.forEach { child ->
            if (VisibilityEvaluator.evaluate(child.visibleIf, dataModel)) {
                CcComponent(child, dataModel, onInputChange, onAction)
            }
        }
    }
}

/**
 * Accordion component
 */
@Composable
fun CcAccordion(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    onAction: (Action) -> Unit,
    modifier: Modifier = Modifier
) {
    val sectionsJson = component["sections"]?.jsonArray
    val sections = sectionsJson?.map { Json.decodeFromJsonElement<AccordionSection>(it) } ?: emptyList()
    val allowMultiple = component["allowMultiple"]?.jsonPrimitive?.booleanOrNull ?: false

    var expandedSections by remember {
        mutableStateOf(sections.filter { it.expanded }.map { it.id }.toSet())
    }

    Column(modifier = modifier.fillMaxWidth()) {
        sections.forEach { section ->
            val isExpanded = section.id in expandedSections

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                shape = RoundedCornerShape(8.dp)
            ) {
                Column {
                    // Header
                    Surface(
                        onClick = {
                            if (!section.disabled) {
                                expandedSections = if (isExpanded) {
                                    expandedSections - section.id
                                } else if (allowMultiple) {
                                    expandedSections + section.id
                                } else {
                                    setOf(section.id)
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = section.title,
                                    style = MaterialTheme.typography.titleMedium
                                )
                                section.subtitle?.let {
                                    Text(
                                        text = it,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                            Text(text = if (isExpanded) "▲" else "▼")
                        }
                    }

                    // Content
                    if (isExpanded) {
                        HorizontalDivider()
                        Column(modifier = Modifier.padding(16.dp)) {
                            section.content.forEach { child ->
                                if (VisibilityEvaluator.evaluate(child.visibleIf, dataModel)) {
                                    CcComponent(child, dataModel, onInputChange, onAction)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// Helper to decode children
private fun CcComponent(
    child: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    onAction: (Action) -> Unit
) {
    com.anthropic.claudecanvas.CcComponent(child, dataModel, onInputChange, onAction)
}
