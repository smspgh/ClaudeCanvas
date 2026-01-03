package com.anthropic.claudecanvas.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import com.anthropic.claudecanvas.*
import com.anthropic.claudecanvas.utils.JsonPointer
import kotlinx.serialization.json.*

/**
 * Text field component
 */
@Composable
fun CcTextField(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    modifier: Modifier = Modifier
) {
    val valuePath = component["valuePath"]?.jsonPrimitive?.content
    val value = if (valuePath != null) {
        JsonPointer.getString(dataModel, valuePath) ?: ""
    } else {
        component["value"]?.jsonPrimitive?.content ?: ""
    }
    val label = component["label"]?.jsonPrimitive?.content
    val placeholder = component["placeholder"]?.jsonPrimitive?.content ?: ""
    val helperText = component["helperText"]?.jsonPrimitive?.content
    val disabled = component["disabled"]?.jsonPrimitive?.booleanOrNull ?: false
    val required = component["required"]?.jsonPrimitive?.booleanOrNull ?: false
    val type = component["type"]?.jsonPrimitive?.content ?: "text"

    val keyboardType = when (type) {
        "email" -> KeyboardType.Email
        "number" -> KeyboardType.Number
        "phone", "tel" -> KeyboardType.Phone
        "url" -> KeyboardType.Uri
        else -> KeyboardType.Text
    }

    val visualTransformation = if (type == "password") {
        PasswordVisualTransformation()
    } else {
        VisualTransformation.None
    }

    Column(modifier = modifier.fillMaxWidth()) {
        OutlinedTextField(
            value = value,
            onValueChange = { newValue ->
                valuePath?.let { onInputChange(it, newValue) }
            },
            label = if (label != null) {
                { Text(if (required) "$label *" else label) }
            } else null,
            placeholder = { Text(placeholder) },
            enabled = !disabled,
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
            visualTransformation = visualTransformation,
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )
        helperText?.let {
            Text(
                text = it,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(start = 16.dp, top = 4.dp)
            )
        }
    }
}

/**
 * Text area component
 */
@Composable
fun CcTextArea(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    modifier: Modifier = Modifier
) {
    val valuePath = component["valuePath"]?.jsonPrimitive?.content
    val value = if (valuePath != null) {
        JsonPointer.getString(dataModel, valuePath) ?: ""
    } else {
        component["value"]?.jsonPrimitive?.content ?: ""
    }
    val label = component["label"]?.jsonPrimitive?.content
    val placeholder = component["placeholder"]?.jsonPrimitive?.content ?: ""
    val helperText = component["helperText"]?.jsonPrimitive?.content
    val disabled = component["disabled"]?.jsonPrimitive?.booleanOrNull ?: false
    val required = component["required"]?.jsonPrimitive?.booleanOrNull ?: false
    val rows = component["rows"]?.jsonPrimitive?.intOrNull ?: 4

    Column(modifier = modifier.fillMaxWidth()) {
        OutlinedTextField(
            value = value,
            onValueChange = { newValue ->
                valuePath?.let { onInputChange(it, newValue) }
            },
            label = if (label != null) {
                { Text(if (required) "$label *" else label) }
            } else null,
            placeholder = { Text(placeholder) },
            enabled = !disabled,
            minLines = rows,
            maxLines = rows * 2,
            modifier = Modifier.fillMaxWidth()
        )
        helperText?.let {
            Text(
                text = it,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(start = 16.dp, top = 4.dp)
            )
        }
    }
}

/**
 * Select/Dropdown component
 */
@Composable
fun CcSelect(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    modifier: Modifier = Modifier
) {
    val valuePath = component["valuePath"]?.jsonPrimitive?.content
    val value = if (valuePath != null) {
        JsonPointer.getString(dataModel, valuePath) ?: ""
    } else {
        component["value"]?.jsonPrimitive?.content ?: ""
    }
    val label = component["label"]?.jsonPrimitive?.content
    val placeholder = component["placeholder"]?.jsonPrimitive?.content ?: "Select..."
    val disabled = component["disabled"]?.jsonPrimitive?.booleanOrNull ?: false
    val required = component["required"]?.jsonPrimitive?.booleanOrNull ?: false
    val optionsJson = component["options"]?.jsonArray
    val options = optionsJson?.map { Json.decodeFromJsonElement<SelectOption>(it) } ?: emptyList()

    var expanded by remember { mutableStateOf(false) }
    val selectedOption = options.find { it.value == value }

    Column(modifier = modifier.fillMaxWidth()) {
        if (label != null) {
            Text(
                text = if (required) "$label *" else label,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(bottom = 4.dp)
            )
        }

        ExposedDropdownMenuBox(
            expanded = expanded,
            onExpandedChange = { if (!disabled) expanded = !expanded }
        ) {
            OutlinedTextField(
                value = selectedOption?.label ?: "",
                onValueChange = {},
                readOnly = true,
                placeholder = { Text(placeholder) },
                enabled = !disabled,
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                modifier = Modifier
                    .fillMaxWidth()
                    .menuAnchor()
            )

            ExposedDropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false }
            ) {
                options.forEach { option ->
                    DropdownMenuItem(
                        text = { Text(option.label) },
                        onClick = {
                            valuePath?.let { onInputChange(it, option.value) }
                            expanded = false
                        },
                        enabled = !option.disabled
                    )
                }
            }
        }
    }
}

/**
 * Checkbox component
 */
@Composable
fun CcCheckbox(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    modifier: Modifier = Modifier
) {
    val valuePath = component["valuePath"]?.jsonPrimitive?.content
    val checked = if (valuePath != null) {
        JsonPointer.getBoolean(dataModel, valuePath)
    } else {
        component["checked"]?.jsonPrimitive?.booleanOrNull ?: false
    }
    val label = component["label"]?.jsonPrimitive?.content ?: ""
    val disabled = component["disabled"]?.jsonPrimitive?.booleanOrNull ?: false

    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Checkbox(
            checked = checked,
            onCheckedChange = { newValue ->
                valuePath?.let { onInputChange(it, newValue) }
            },
            enabled = !disabled
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium
        )
    }
}

/**
 * Radio group component
 */
@Composable
fun CcRadioGroup(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    modifier: Modifier = Modifier
) {
    val valuePath = component["valuePath"]?.jsonPrimitive?.content
    val value = if (valuePath != null) {
        JsonPointer.getString(dataModel, valuePath) ?: ""
    } else {
        component["value"]?.jsonPrimitive?.content ?: ""
    }
    val label = component["label"]?.jsonPrimitive?.content
    val disabled = component["disabled"]?.jsonPrimitive?.booleanOrNull ?: false
    val orientation = component["orientation"]?.jsonPrimitive?.content ?: "vertical"
    val optionsJson = component["options"]?.jsonArray
    val options = optionsJson?.map { Json.decodeFromJsonElement<SelectOption>(it) } ?: emptyList()

    Column(modifier = modifier.fillMaxWidth()) {
        label?.let {
            Text(
                text = it,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(bottom = 8.dp)
            )
        }

        if (orientation == "horizontal") {
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                options.forEach { option ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        RadioButton(
                            selected = value == option.value,
                            onClick = { valuePath?.let { onInputChange(it, option.value) } },
                            enabled = !disabled && !option.disabled
                        )
                        Text(text = option.label)
                    }
                }
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                options.forEach { option ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        RadioButton(
                            selected = value == option.value,
                            onClick = { valuePath?.let { onInputChange(it, option.value) } },
                            enabled = !disabled && !option.disabled
                        )
                        Text(text = option.label)
                    }
                }
            }
        }
    }
}

/**
 * Switch component
 */
@Composable
fun CcSwitch(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    modifier: Modifier = Modifier
) {
    val valuePath = component["valuePath"]?.jsonPrimitive?.content
    val checked = if (valuePath != null) {
        JsonPointer.getBoolean(dataModel, valuePath)
    } else {
        component["checked"]?.jsonPrimitive?.booleanOrNull ?: false
    }
    val label = component["label"]?.jsonPrimitive?.content
    val disabled = component["disabled"]?.jsonPrimitive?.booleanOrNull ?: false

    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        label?.let {
            Text(
                text = it,
                style = MaterialTheme.typography.bodyMedium
            )
        }
        Switch(
            checked = checked,
            onCheckedChange = { newValue ->
                valuePath?.let { onInputChange(it, newValue) }
            },
            enabled = !disabled
        )
    }
}

/**
 * Slider component
 */
@Composable
fun CcSlider(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    modifier: Modifier = Modifier
) {
    val valuePath = component["valuePath"]?.jsonPrimitive?.content
    val value = if (valuePath != null) {
        JsonPointer.getNumber(dataModel, valuePath)?.toFloat() ?: 0f
    } else {
        component["value"]?.jsonPrimitive?.floatOrNull ?: 0f
    }
    val label = component["label"]?.jsonPrimitive?.content
    val min = component["min"]?.jsonPrimitive?.floatOrNull ?: 0f
    val max = component["max"]?.jsonPrimitive?.floatOrNull ?: 100f
    val step = component["step"]?.jsonPrimitive?.floatOrNull
    val showValue = component["showValue"]?.jsonPrimitive?.booleanOrNull ?: false
    val disabled = component["disabled"]?.jsonPrimitive?.booleanOrNull ?: false

    Column(modifier = modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            label?.let {
                Text(text = it, style = MaterialTheme.typography.bodyMedium)
            }
            if (showValue) {
                Text(text = value.toInt().toString(), style = MaterialTheme.typography.bodyMedium)
            }
        }

        Slider(
            value = value,
            onValueChange = { newValue ->
                valuePath?.let { onInputChange(it, newValue) }
            },
            valueRange = min..max,
            steps = if (step != null) ((max - min) / step).toInt() - 1 else 0,
            enabled = !disabled
        )
    }
}

/**
 * Date picker component
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CcDatePicker(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    modifier: Modifier = Modifier
) {
    val valuePath = component["valuePath"]?.jsonPrimitive?.content
    val value = if (valuePath != null) {
        JsonPointer.getString(dataModel, valuePath) ?: ""
    } else {
        component["value"]?.jsonPrimitive?.content ?: ""
    }
    val label = component["label"]?.jsonPrimitive?.content
    val disabled = component["disabled"]?.jsonPrimitive?.booleanOrNull ?: false

    var showPicker by remember { mutableStateOf(false) }

    Column(modifier = modifier.fillMaxWidth()) {
        OutlinedTextField(
            value = value,
            onValueChange = {},
            label = label?.let { { Text(it) } },
            readOnly = true,
            enabled = !disabled,
            trailingIcon = { Text("📅") },
            modifier = Modifier
                .fillMaxWidth()
                .clickable { if (!disabled) showPicker = true }
        )

        if (showPicker) {
            val datePickerState = rememberDatePickerState()
            DatePickerDialog(
                onDismissRequest = { showPicker = false },
                confirmButton = {
                    TextButton(onClick = {
                        datePickerState.selectedDateMillis?.let { millis ->
                            val date = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
                                .format(java.util.Date(millis))
                            valuePath?.let { onInputChange(it, date) }
                        }
                        showPicker = false
                    }) {
                        Text("OK")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showPicker = false }) {
                        Text("Cancel")
                    }
                }
            ) {
                DatePicker(state = datePickerState)
            }
        }
    }
}

// Helper for clickable modifier
private fun Modifier.clickable(onClick: () -> Unit): Modifier {
    return this.then(
        Modifier.clickable(onClick = onClick)
    )
}

/**
 * File upload component (simplified - shows upload button)
 */
@Composable
fun CcFileUpload(
    component: ComponentDefinition,
    dataModel: DataModel,
    onAction: (Action) -> Unit,
    modifier: Modifier = Modifier
) {
    val label = component["label"]?.jsonPrimitive?.content ?: "Upload File"
    val accept = component["accept"]?.jsonPrimitive?.content
    val multiple = component["multiple"]?.jsonPrimitive?.booleanOrNull ?: false
    val disabled = component["disabled"]?.jsonPrimitive?.booleanOrNull ?: false
    val dropzoneText = component["dropzoneText"]?.jsonPrimitive?.content ?: "Drag and drop files here"

    // File upload in Android requires ActivityResultLauncher
    // This is a simplified placeholder
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(8.dp),
            color = MaterialTheme.colorScheme.surfaceVariant
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("📁", style = MaterialTheme.typography.headlineMedium)
                Spacer(modifier = Modifier.height(8.dp))
                Text(dropzoneText, style = MaterialTheme.typography.bodyMedium)
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    "Tap to browse",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
