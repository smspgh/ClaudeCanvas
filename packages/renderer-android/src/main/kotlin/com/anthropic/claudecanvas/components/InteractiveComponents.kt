package com.anthropic.claudecanvas.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.anthropic.claudecanvas.*
import com.anthropic.claudecanvas.utils.JsonPointer
import kotlinx.serialization.json.*

/**
 * Button component
 */
@Composable
fun CcButton(
    component: ComponentDefinition,
    dataModel: DataModel,
    onAction: (Action) -> Unit,
    modifier: Modifier = Modifier
) {
    val label = component["label"]?.jsonPrimitive?.content ?: ""
    val variant = component["variant"]?.jsonPrimitive?.content ?: "primary"
    val size = component["size"]?.jsonPrimitive?.content ?: "medium"
    val disabled = component["disabled"]?.jsonPrimitive?.booleanOrNull ?: false
    val fullWidth = component["fullWidth"]?.jsonPrimitive?.booleanOrNull ?: false
    val icon = component["icon"]?.jsonPrimitive?.content
    val action = component["action"]?.let { Json.decodeFromJsonElement<Action>(it) }

    val buttonModifier = if (fullWidth) {
        modifier.fillMaxWidth()
    } else {
        modifier
    }

    val contentPadding = when (size) {
        "small" -> PaddingValues(horizontal = 12.dp, vertical = 4.dp)
        "large" -> PaddingValues(horizontal = 24.dp, vertical = 12.dp)
        else -> PaddingValues(horizontal = 16.dp, vertical = 8.dp)
    }

    when (variant) {
        "primary" -> {
            Button(
                onClick = { action?.let { onAction(it) } },
                enabled = !disabled,
                contentPadding = contentPadding,
                modifier = buttonModifier
            ) {
                ButtonContent(icon, label)
            }
        }
        "secondary" -> {
            FilledTonalButton(
                onClick = { action?.let { onAction(it) } },
                enabled = !disabled,
                contentPadding = contentPadding,
                modifier = buttonModifier
            ) {
                ButtonContent(icon, label)
            }
        }
        "outline" -> {
            OutlinedButton(
                onClick = { action?.let { onAction(it) } },
                enabled = !disabled,
                contentPadding = contentPadding,
                modifier = buttonModifier
            ) {
                ButtonContent(icon, label)
            }
        }
        "ghost", "text" -> {
            TextButton(
                onClick = { action?.let { onAction(it) } },
                enabled = !disabled,
                contentPadding = contentPadding,
                modifier = buttonModifier
            ) {
                ButtonContent(icon, label)
            }
        }
        "danger", "destructive" -> {
            Button(
                onClick = { action?.let { onAction(it) } },
                enabled = !disabled,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error,
                    contentColor = MaterialTheme.colorScheme.onError
                ),
                contentPadding = contentPadding,
                modifier = buttonModifier
            ) {
                ButtonContent(icon, label)
            }
        }
        else -> {
            Button(
                onClick = { action?.let { onAction(it) } },
                enabled = !disabled,
                contentPadding = contentPadding,
                modifier = buttonModifier
            ) {
                ButtonContent(icon, label)
            }
        }
    }
}

@Composable
private fun ButtonContent(icon: String?, label: String) {
    if (icon != null) {
        Text(icon)
        Spacer(modifier = Modifier.width(8.dp))
    }
    Text(label)
}

/**
 * Button group component
 */
@Composable
fun CcButtonGroup(
    component: ComponentDefinition,
    dataModel: DataModel,
    onAction: (Action) -> Unit,
    modifier: Modifier = Modifier
) {
    val buttonsJson = component["buttons"]?.jsonArray
    val buttons = buttonsJson?.map { Json.decodeFromJsonElement<ButtonDefinition>(it) } ?: emptyList()
    val orientation = component["orientation"]?.jsonPrimitive?.content ?: "horizontal"

    if (orientation == "vertical") {
        Column(modifier = modifier) {
            buttons.forEachIndexed { index, button ->
                GroupButton(button, onAction, isFirst = index == 0, isLast = index == buttons.size - 1, vertical = true)
            }
        }
    } else {
        Row(modifier = modifier) {
            buttons.forEachIndexed { index, button ->
                GroupButton(button, onAction, isFirst = index == 0, isLast = index == buttons.size - 1, vertical = false)
            }
        }
    }
}

@Composable
private fun GroupButton(
    button: ButtonDefinition,
    onAction: (Action) -> Unit,
    isFirst: Boolean,
    isLast: Boolean,
    vertical: Boolean
) {
    val shape = if (vertical) {
        when {
            isFirst -> RoundedCornerShape(topStart = 8.dp, topEnd = 8.dp)
            isLast -> RoundedCornerShape(bottomStart = 8.dp, bottomEnd = 8.dp)
            else -> RoundedCornerShape(0.dp)
        }
    } else {
        when {
            isFirst -> RoundedCornerShape(topStart = 8.dp, bottomStart = 8.dp)
            isLast -> RoundedCornerShape(topEnd = 8.dp, bottomEnd = 8.dp)
            else -> RoundedCornerShape(0.dp)
        }
    }

    OutlinedButton(
        onClick = { button.action?.let { onAction(it) } },
        enabled = !button.disabled,
        shape = shape,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
        modifier = Modifier.defaultMinSize(minWidth = 1.dp, minHeight = 1.dp)
    ) {
        Text(button.label)
    }
}

/**
 * Chip component
 */
@Composable
fun CcChip(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    onAction: (Action) -> Unit,
    modifier: Modifier = Modifier
) {
    val label = component["label"]?.jsonPrimitive?.content ?: ""
    val variant = component["variant"]?.jsonPrimitive?.content ?: "default"
    val selectable = component["selectable"]?.jsonPrimitive?.booleanOrNull ?: false
    val deletable = component["deletable"]?.jsonPrimitive?.booleanOrNull ?: false
    val selectedPath = component["selectedPath"]?.jsonPrimitive?.content
    val selected = if (selectedPath != null) {
        JsonPointer.getBoolean(dataModel, selectedPath)
    } else {
        component["selected"]?.jsonPrimitive?.booleanOrNull ?: false
    }
    val icon = component["icon"]?.jsonPrimitive?.content
    val action = component["action"]?.let { Json.decodeFromJsonElement<Action>(it) }
    val onDelete = component["onDelete"]?.let { Json.decodeFromJsonElement<Action>(it) }

    val containerColor = when (variant) {
        "primary" -> MaterialTheme.colorScheme.primaryContainer
        "success" -> Color(0xFFDCFCE7)
        "warning" -> Color(0xFFFEF3C7)
        "error" -> Color(0xFFFEE2E2)
        else -> MaterialTheme.colorScheme.surfaceVariant
    }

    if (selectable) {
        FilterChip(
            selected = selected,
            onClick = {
                selectedPath?.let { onInputChange(it, !selected) }
                action?.let { onAction(it) }
            },
            label = { Text(label) },
            leadingIcon = icon?.let { { Text(it) } },
            modifier = modifier
        )
    } else if (deletable) {
        InputChip(
            selected = false,
            onClick = { action?.let { onAction(it) } },
            label = { Text(label) },
            leadingIcon = icon?.let { { Text(it) } },
            trailingIcon = {
                Surface(
                    onClick = { onDelete?.let { onAction(it) } }
                ) {
                    Text("×")
                }
            },
            modifier = modifier
        )
    } else {
        AssistChip(
            onClick = { action?.let { onAction(it) } },
            label = { Text(label) },
            leadingIcon = icon?.let { { Text(it) } },
            modifier = modifier
        )
    }
}
