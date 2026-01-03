package com.anthropic.claudecanvas

import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.anthropic.claudecanvas.components.*
import com.anthropic.claudecanvas.utils.JsonPointer
import com.anthropic.claudecanvas.utils.VisibilityEvaluator
import com.anthropic.claudecanvas.utils.setByPath
import kotlinx.serialization.json.JsonElement

/**
 * Main entry point for rendering ClaudeCanvas surfaces in Jetpack Compose
 *
 * @param surface The surface definition to render
 * @param dataModel The current data model state
 * @param onDataModelChange Callback when data model changes
 * @param onAction Callback when an action is emitted
 * @param modifier Modifier for the surface container
 */
@Composable
fun CcSurface(
    surface: Surface,
    dataModel: DataModel = emptyMap(),
    onDataModelChange: (DataModel) -> Unit = {},
    onAction: (UserActionMessage) -> Unit = {},
    modifier: Modifier = Modifier
) {
    val currentDataModel = remember(dataModel) { mutableStateOf(dataModel) }

    // Update state when external dataModel changes
    LaunchedEffect(dataModel) {
        currentDataModel.value = dataModel
    }

    val handleInputChange: (String, Any?) -> Unit = { path, value ->
        val newModel = currentDataModel.value.setByPath(path, value)
        currentDataModel.value = newModel
        onDataModelChange(newModel)
    }

    val handleAction: (Action) -> Unit = { action ->
        // Handle updateData action locally
        if ((action.type == "updateData" || action.type == "update") && action.path != null) {
            val value = JsonPointer.fromJsonElement(action.value)
            handleInputChange(action.path, value)
        } else {
            // Emit to parent
            onAction(
                UserActionMessage(
                    surfaceId = surface.id,
                    action = action,
                    dataModel = currentDataModel.value
                )
            )
        }
    }

    Column(modifier = modifier.fillMaxWidth()) {
        // Render title if present
        surface.title?.let { title ->
            Text(
                text = title,
                style = MaterialTheme.typography.headlineMedium,
                modifier = Modifier.padding(bottom = 16.dp)
            )
        }

        // Render components
        surface.components.forEach { component ->
            if (VisibilityEvaluator.evaluate(component.visibleIf, currentDataModel.value)) {
                CcComponent(
                    component = component,
                    dataModel = currentDataModel.value,
                    onInputChange = handleInputChange,
                    onAction = handleAction
                )
            }
        }
    }
}

/**
 * Renders a single component based on its type
 */
@Composable
fun CcComponent(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    onAction: (Action) -> Unit,
    modifier: Modifier = Modifier
) {
    when (component.component) {
        // Layout Components
        "Row" -> CcRow(component, dataModel, onInputChange, onAction, modifier)
        "Column" -> CcColumn(component, dataModel, onInputChange, onAction, modifier)
        "Card" -> CcCard(component, dataModel, onInputChange, onAction, modifier)
        "Divider" -> CcDivider(component, modifier)
        "Modal" -> CcModal(component, dataModel, onInputChange, onAction)
        "Tabs" -> CcTabs(component, dataModel, onInputChange, onAction, modifier)
        "Accordion" -> CcAccordion(component, dataModel, onInputChange, onAction, modifier)

        // Display Components
        "Text" -> CcText(component, dataModel, modifier)
        "Image" -> CcImage(component, dataModel, modifier)
        "Icon" -> CcIcon(component, modifier)
        "Badge" -> CcBadge(component, dataModel, modifier)
        "Avatar" -> CcAvatar(component, dataModel, modifier)
        "CodeBlock" -> CcCodeBlock(component, dataModel, modifier)
        "Markdown" -> CcMarkdown(component, dataModel, modifier)
        "Link" -> CcLink(component, dataModel, onAction, modifier)

        // Form/Input Components
        "TextField" -> CcTextField(component, dataModel, onInputChange, modifier)
        "TextArea" -> CcTextArea(component, dataModel, onInputChange, modifier)
        "Select" -> CcSelect(component, dataModel, onInputChange, modifier)
        "Checkbox" -> CcCheckbox(component, dataModel, onInputChange, modifier)
        "RadioGroup" -> CcRadioGroup(component, dataModel, onInputChange, modifier)
        "Switch" -> CcSwitch(component, dataModel, onInputChange, modifier)
        "Slider" -> CcSlider(component, dataModel, onInputChange, modifier)
        "DatePicker" -> CcDatePicker(component, dataModel, onInputChange, modifier)
        "FileUpload" -> CcFileUpload(component, dataModel, onAction, modifier)

        // Interactive Components
        "Button" -> CcButton(component, dataModel, onAction, modifier)
        "ButtonGroup" -> CcButtonGroup(component, dataModel, onAction, modifier)
        "Chip" -> CcChip(component, dataModel, onInputChange, onAction, modifier)

        // Media Components
        "Video" -> CcVideo(component, dataModel, modifier)
        "Audio" -> CcAudio(component, dataModel, modifier)

        // Data Visualization Components
        "Chart" -> CcChart(component, dataModel, modifier)
        "DataTable" -> CcDataTable(component, dataModel, onInputChange, modifier)
        "List" -> CcList(component, dataModel, onInputChange, onAction, modifier)

        // Feedback Components
        "Progress" -> CcProgress(component, dataModel, modifier)
        "Skeleton" -> CcSkeleton(component, modifier)
        "Alert" -> CcAlert(component, dataModel, onInputChange, modifier)
        "Toast" -> CcToast(component, dataModel, onInputChange, onAction)

        // Unknown component
        else -> {
            Text(
                text = "Unknown component: ${component.component}",
                color = MaterialTheme.colorScheme.error,
                modifier = modifier.padding(8.dp)
            )
        }
    }
}
