package com.anthropic.claudecanvas.utils

import kotlinx.serialization.json.*

/**
 * JSON Pointer utilities for RFC 6901 compliant data binding
 */
object JsonPointer {

    /**
     * Get a value from a JSON object using a JSON Pointer path
     *
     * @param data The root JSON object
     * @param path The JSON Pointer path (e.g., "/user/name")
     * @return The value at the path, or null if not found
     */
    fun get(data: Map<String, JsonElement>?, path: String): JsonElement? {
        if (data == null) return null
        if (path.isEmpty() || path == "/") return JsonObject(data)

        val parts = parsePath(path)
        var current: JsonElement = JsonObject(data)

        for (part in parts) {
            current = when (current) {
                is JsonObject -> current[part] ?: return null
                is JsonArray -> {
                    val index = part.toIntOrNull() ?: return null
                    if (index < 0 || index >= current.size) return null
                    current[index]
                }
                else -> return null
            }
        }

        return current
    }

    /**
     * Set a value in a JSON object using a JSON Pointer path
     * Returns a new map with the value set (immutable operation)
     *
     * @param data The root JSON object
     * @param path The JSON Pointer path
     * @param value The value to set
     * @return A new map with the value set
     */
    fun set(data: Map<String, JsonElement>, path: String, value: JsonElement): Map<String, JsonElement> {
        if (path.isEmpty() || path == "/") {
            return if (value is JsonObject) value.toMap() else data
        }

        val parts = parsePath(path)
        return setRecursive(data, parts, 0, value)
    }

    /**
     * Convert any value to JsonElement
     */
    fun toJsonElement(value: Any?): JsonElement {
        return when (value) {
            null -> JsonNull
            is JsonElement -> value
            is String -> JsonPrimitive(value)
            is Number -> JsonPrimitive(value)
            is Boolean -> JsonPrimitive(value)
            is List<*> -> JsonArray(value.map { toJsonElement(it) })
            is Map<*, *> -> JsonObject(value.mapKeys { it.key.toString() }.mapValues { toJsonElement(it.value) })
            else -> JsonPrimitive(value.toString())
        }
    }

    /**
     * Convert JsonElement to a Kotlin type
     */
    fun fromJsonElement(element: JsonElement?): Any? {
        return when (element) {
            null, JsonNull -> null
            is JsonPrimitive -> {
                when {
                    element.isString -> element.content
                    element.booleanOrNull != null -> element.boolean
                    element.intOrNull != null -> element.int
                    element.longOrNull != null -> element.long
                    element.doubleOrNull != null -> element.double
                    else -> element.content
                }
            }
            is JsonArray -> element.map { fromJsonElement(it) }
            is JsonObject -> element.mapValues { fromJsonElement(it.value) }
        }
    }

    /**
     * Get a string value from a path
     */
    fun getString(data: Map<String, JsonElement>?, path: String): String? {
        val element = get(data, path) ?: return null
        return if (element is JsonPrimitive) element.content else element.toString()
    }

    /**
     * Get a boolean value from a path
     */
    fun getBoolean(data: Map<String, JsonElement>?, path: String): Boolean {
        val element = get(data, path) ?: return false
        return when (element) {
            is JsonPrimitive -> element.booleanOrNull ?: (element.content.isNotEmpty())
            is JsonArray -> element.isNotEmpty()
            is JsonObject -> element.isNotEmpty()
            else -> false
        }
    }

    /**
     * Get a number value from a path
     */
    fun getNumber(data: Map<String, JsonElement>?, path: String): Double? {
        val element = get(data, path) ?: return null
        return if (element is JsonPrimitive) element.doubleOrNull else null
    }

    /**
     * Get an int value from a path
     */
    fun getInt(data: Map<String, JsonElement>?, path: String): Int? {
        val element = get(data, path) ?: return null
        return if (element is JsonPrimitive) element.intOrNull else null
    }

    /**
     * Get a list value from a path
     */
    fun getList(data: Map<String, JsonElement>?, path: String): List<JsonElement>? {
        val element = get(data, path) ?: return null
        return if (element is JsonArray) element.toList() else null
    }

    /**
     * Parse a JSON Pointer path into parts
     */
    private fun parsePath(path: String): List<String> {
        if (path.isEmpty()) return emptyList()

        val normalized = if (path.startsWith("/")) path.substring(1) else path
        if (normalized.isEmpty()) return emptyList()

        return normalized.split("/").map { part ->
            part.replace("~1", "/").replace("~0", "~")
        }
    }

    /**
     * Recursively set a value in a nested structure
     */
    private fun setRecursive(
        data: Map<String, JsonElement>,
        parts: List<String>,
        index: Int,
        value: JsonElement
    ): Map<String, JsonElement> {
        if (index >= parts.size) return data

        val key = parts[index]
        val mutable = data.toMutableMap()

        if (index == parts.size - 1) {
            // Last part - set the value
            mutable[key] = value
        } else {
            // Intermediate part - recurse
            val existing = data[key]
            val nested = when (existing) {
                is JsonObject -> existing.toMap()
                else -> emptyMap()
            }
            mutable[key] = JsonObject(setRecursive(nested, parts, index + 1, value))
        }

        return mutable
    }
}

/**
 * Extension function to easily get values from DataModel
 */
fun Map<String, JsonElement>.getByPath(path: String): JsonElement? = JsonPointer.get(this, path)

/**
 * Extension function to easily set values in DataModel
 */
fun Map<String, JsonElement>.setByPath(path: String, value: Any?): Map<String, JsonElement> {
    return JsonPointer.set(this, path, JsonPointer.toJsonElement(value))
}
