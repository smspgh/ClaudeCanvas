package com.anthropic.claudecanvas

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject

/**
 * Core types for ClaudeCanvas Android renderer
 */

/**
 * Represents a ClaudeCanvas surface definition
 */
@Serializable
data class Surface(
    val version: String = "1.0",
    val id: String? = null,
    val title: String? = null,
    val components: List<ComponentDefinition> = emptyList(),
    val dataModel: DataModel? = null
)

/**
 * Type alias for the data model - a map of string keys to any JSON values
 */
typealias DataModel = Map<String, JsonElement>

/**
 * Mutable version of data model for internal use
 */
typealias MutableDataModel = MutableMap<String, JsonElement>

/**
 * Component definition with all possible properties
 */
@Serializable
data class ComponentDefinition(
    val component: String,
    val id: String? = null,

    // Common properties
    val visibleIf: VisibleIf? = null,
    val style: Map<String, JsonElement>? = null,

    // All other properties stored as generic JSON
    val properties: JsonObject? = null
) {
    /**
     * Get a property value by key
     */
    operator fun get(key: String): JsonElement? = properties?.get(key)
}

/**
 * Visibility condition
 */
@Serializable
data class VisibleIf(
    val path: String,
    val operator: String? = null,
    val value: JsonElement? = null,
    val expr: String? = null,

    // Comparison shortcuts
    val eq: JsonElement? = null,
    val neq: JsonElement? = null,
    val gt: Double? = null,
    val gte: Double? = null,
    val lt: Double? = null,
    val lte: Double? = null,

    // Compound conditions
    val and: List<VisibleIf>? = null,
    val or: List<VisibleIf>? = null
)

/**
 * Action emitted by components
 */
@Serializable
data class Action(
    val type: String,
    val payload: JsonObject? = null,
    val path: String? = null,
    val value: JsonElement? = null
)

/**
 * User action message sent to parent
 */
@Serializable
data class UserActionMessage(
    val type: String = "userAction",
    val surfaceId: String?,
    val action: Action,
    val dataModel: DataModel
)

/**
 * Input change event
 */
data class InputChange(
    val path: String,
    val value: Any?
)

/**
 * Select option
 */
@Serializable
data class SelectOption(
    val value: String,
    val label: String,
    val disabled: Boolean = false
)

/**
 * Tab definition
 */
@Serializable
data class TabDefinition(
    val id: String,
    val label: String,
    val icon: String? = null,
    val disabled: Boolean = false,
    val content: List<ComponentDefinition> = emptyList()
)

/**
 * Accordion section
 */
@Serializable
data class AccordionSection(
    val id: String,
    val title: String,
    val subtitle: String? = null,
    val icon: String? = null,
    val expanded: Boolean = false,
    val disabled: Boolean = false,
    val content: List<ComponentDefinition> = emptyList()
)

/**
 * Button definition for button groups
 */
@Serializable
data class ButtonDefinition(
    val label: String,
    val value: String? = null,
    val action: Action? = null,
    val variant: String = "secondary",
    val disabled: Boolean = false
)

/**
 * Table column definition
 */
@Serializable
data class TableColumn(
    val key: String,
    val label: String,
    val sortable: Boolean = false,
    val width: String? = null,
    val align: String = "left"
)

/**
 * Chart data point
 */
@Serializable
data class ChartDataPoint(
    val label: String,
    val value: Double,
    val color: String? = null
)

/**
 * Chart dataset
 */
@Serializable
data class ChartDataset(
    val label: String,
    val data: List<Double>,
    val color: String? = null,
    val backgroundColor: String? = null
)
