package com.anthropic.claudecanvas.components

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.anthropic.claudecanvas.*
import com.anthropic.claudecanvas.utils.JsonPointer
import com.anthropic.claudecanvas.utils.VisibilityEvaluator
import kotlinx.serialization.json.*

/**
 * Chart component (simplified - shows data info)
 */
@Composable
fun CcChart(
    component: ComponentDefinition,
    dataModel: DataModel,
    modifier: Modifier = Modifier
) {
    val chartType = component["chartType"]?.jsonPrimitive?.content ?: "bar"
    val title = component["title"]?.jsonPrimitive?.content
    val dataPath = component["dataPath"]?.jsonPrimitive?.content
    val height = component["height"]?.jsonPrimitive?.intOrNull ?: 200

    val data = if (dataPath != null) {
        JsonPointer.getList(dataModel, dataPath) ?: emptyList()
    } else {
        component["data"]?.jsonArray?.toList() ?: emptyList()
    }

    Column(modifier = modifier.fillMaxWidth()) {
        title?.let {
            Text(
                text = it,
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(bottom = 8.dp)
            )
        }

        // Simplified chart visualization
        Surface(
            color = MaterialTheme.colorScheme.surfaceVariant,
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(height.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = when (chartType) {
                            "line" -> "📈"
                            "pie", "doughnut" -> "🥧"
                            else -> "📊"
                        },
                        style = MaterialTheme.typography.headlineLarge
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "${chartType.capitalize()} Chart",
                        style = MaterialTheme.typography.titleSmall
                    )
                    Text(
                        text = "${data.size} data points",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        // For production, integrate with a charting library like Vico
    }
}

/**
 * Data table component
 */
@Composable
fun CcDataTable(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    modifier: Modifier = Modifier
) {
    val columnsJson = component["columns"]?.jsonArray
    val columns = columnsJson?.map { Json.decodeFromJsonElement<TableColumn>(it) } ?: emptyList()
    val dataPath = component["dataPath"]?.jsonPrimitive?.content
    val data = if (dataPath != null) {
        JsonPointer.getList(dataModel, dataPath) ?: emptyList()
    } else {
        component["data"]?.jsonArray?.toList() ?: emptyList()
    }
    val striped = component["striped"]?.jsonPrimitive?.booleanOrNull ?: false
    val bordered = component["bordered"]?.jsonPrimitive?.booleanOrNull ?: true

    var sortColumn by remember { mutableStateOf<String?>(null) }
    var sortAscending by remember { mutableStateOf(true) }

    val sortedData = remember(data, sortColumn, sortAscending) {
        if (sortColumn == null) {
            data
        } else {
            val sorted = data.sortedBy { row ->
                val value = (row as? JsonObject)?.get(sortColumn)
                when (value) {
                    is JsonPrimitive -> value.content
                    else -> ""
                }
            }
            if (sortAscending) sorted else sorted.reversed()
        }
    }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
    ) {
        // Header row
        Row(
            modifier = Modifier
                .background(MaterialTheme.colorScheme.surfaceVariant)
                .then(if (bordered) Modifier.border(1.dp, MaterialTheme.colorScheme.outline) else Modifier)
        ) {
            columns.forEach { column ->
                TableCell(
                    content = column.label,
                    isHeader = true,
                    width = column.width,
                    align = column.align,
                    sortable = column.sortable,
                    isSorted = sortColumn == column.key,
                    sortAscending = sortAscending,
                    onSort = {
                        if (column.sortable) {
                            if (sortColumn == column.key) {
                                sortAscending = !sortAscending
                            } else {
                                sortColumn = column.key
                                sortAscending = true
                            }
                        }
                    }
                )
            }
        }

        // Data rows
        sortedData.forEachIndexed { index, row ->
            val rowData = row as? JsonObject ?: return@forEachIndexed
            Row(
                modifier = Modifier
                    .then(if (striped && index % 2 == 1) {
                        Modifier.background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    } else Modifier)
                    .then(if (bordered) Modifier.border(1.dp, MaterialTheme.colorScheme.outline) else Modifier)
            ) {
                columns.forEach { column ->
                    val cellValue = rowData[column.key]
                    val displayValue = when (cellValue) {
                        is JsonPrimitive -> cellValue.content
                        is JsonNull -> ""
                        else -> cellValue?.toString() ?: ""
                    }
                    TableCell(
                        content = displayValue,
                        isHeader = false,
                        width = column.width,
                        align = column.align
                    )
                }
            }
        }
    }
}

@Composable
private fun TableCell(
    content: String,
    isHeader: Boolean,
    width: String?,
    align: String,
    sortable: Boolean = false,
    isSorted: Boolean = false,
    sortAscending: Boolean = true,
    onSort: () -> Unit = {}
) {
    val textAlign = when (align) {
        "center" -> TextAlign.Center
        "right" -> TextAlign.End
        else -> TextAlign.Start
    }

    val cellModifier = Modifier
        .then(if (width != null) {
            val widthDp = width.replace("px", "").toIntOrNull()?.dp ?: 100.dp
            Modifier.width(widthDp)
        } else {
            Modifier.defaultMinSize(minWidth = 100.dp)
        })
        .padding(horizontal = 12.dp, vertical = 8.dp)

    Box(
        modifier = cellModifier.then(
            if (sortable) Modifier.clickable { onSort() } else Modifier
        )
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = content,
                style = if (isHeader) {
                    MaterialTheme.typography.titleSmall
                } else {
                    MaterialTheme.typography.bodyMedium
                },
                textAlign = textAlign,
                modifier = Modifier.weight(1f)
            )
            if (isHeader && sortable) {
                Text(
                    text = if (isSorted) (if (sortAscending) "▲" else "▼") else "⇅",
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}

private fun Modifier.border(width: androidx.compose.ui.unit.Dp, color: Color) = this.then(
    Modifier.background(color)
)

private fun Modifier.clickable(onClick: () -> Unit) = this.then(
    androidx.compose.foundation.clickable(onClick = onClick)
)

/**
 * List component
 */
@Composable
fun CcList(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    onAction: (Action) -> Unit,
    modifier: Modifier = Modifier
) {
    val itemsPath = component["itemsPath"]?.jsonPrimitive?.content
    val items = if (itemsPath != null) {
        JsonPointer.getList(dataModel, itemsPath) ?: emptyList()
    } else {
        component["items"]?.jsonArray?.toList() ?: emptyList()
    }
    val gap = component["gap"]?.jsonPrimitive?.intOrNull ?: 8
    val emptyMessage = component["emptyMessage"]?.jsonPrimitive?.content
    val alternateBackground = component["alternateBackground"]?.jsonPrimitive?.booleanOrNull ?: false
    val template = component["template"]?.jsonArray?.map {
        Json.decodeFromJsonElement<ComponentDefinition>(it)
    }

    if (items.isEmpty() && emptyMessage != null) {
        Box(
            modifier = modifier
                .fillMaxWidth()
                .padding(32.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = emptyMessage,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    } else {
        Column(
            modifier = modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(gap.dp)
        ) {
            items.forEachIndexed { index, item ->
                val backgroundColor = if (alternateBackground && index % 2 == 1) {
                    MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                } else {
                    Color.Transparent
                }

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(backgroundColor)
                ) {
                    // For now, just display item content
                    // Full template rendering would require context injection
                    when (item) {
                        is JsonPrimitive -> Text(item.content)
                        is JsonObject -> {
                            Column {
                                item.entries.take(3).forEach { (key, value) ->
                                    Text(
                                        text = "$key: ${(value as? JsonPrimitive)?.content ?: ""}",
                                        style = MaterialTheme.typography.bodySmall
                                    )
                                }
                            }
                        }
                        else -> Text(item.toString())
                    }
                }
            }
        }
    }
}
