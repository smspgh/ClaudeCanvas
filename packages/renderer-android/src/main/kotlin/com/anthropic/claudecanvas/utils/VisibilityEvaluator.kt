package com.anthropic.claudecanvas.utils

import com.anthropic.claudecanvas.DataModel
import com.anthropic.claudecanvas.VisibleIf
import kotlinx.serialization.json.*

/**
 * Evaluates visibility conditions for components
 */
object VisibilityEvaluator {

    /**
     * Evaluate a visibility condition against a data model
     */
    fun evaluate(condition: VisibleIf?, dataModel: DataModel): Boolean {
        if (condition == null) return true

        // Handle compound conditions
        condition.and?.let { conditions ->
            return conditions.all { evaluate(it, dataModel) }
        }

        condition.or?.let { conditions ->
            return conditions.any { evaluate(it, dataModel) }
        }

        // Get the value at the path
        val value = JsonPointer.get(dataModel, condition.path)

        // Apply expression if present
        val evaluatedValue = if (condition.expr != null) {
            evaluateExpression(condition.expr, value)
        } else {
            value
        }

        // Handle operator-based comparison
        condition.operator?.let { op ->
            return evaluateOperator(op, evaluatedValue, condition.value)
        }

        // Handle shortcut comparisons
        condition.eq?.let { return compareEqual(evaluatedValue, it) }
        condition.neq?.let { return !compareEqual(evaluatedValue, it) }
        condition.gt?.let { return compareGreater(evaluatedValue, it) }
        condition.gte?.let { return compareGreater(evaluatedValue, it) || compareEqualNumeric(evaluatedValue, it) }
        condition.lt?.let { return compareLess(evaluatedValue, it) }
        condition.lte?.let { return compareLess(evaluatedValue, it) || compareEqualNumeric(evaluatedValue, it) }

        // Default: truthy check
        return isTruthy(evaluatedValue)
    }

    /**
     * Evaluate an expression on a value
     */
    private fun evaluateExpression(expr: String, value: JsonElement?): JsonElement? {
        return when (expr) {
            "count" -> {
                val count = when (value) {
                    is JsonArray -> value.size
                    is JsonObject -> value.size
                    is JsonPrimitive -> if (value.isString) value.content.length else 0
                    else -> 0
                }
                JsonPrimitive(count)
            }
            "sum" -> {
                if (value is JsonArray) {
                    val sum = value.mapNotNull {
                        (it as? JsonPrimitive)?.doubleOrNull
                    }.sum()
                    JsonPrimitive(sum)
                } else {
                    JsonPrimitive(0)
                }
            }
            "any" -> {
                val result = when (value) {
                    is JsonArray -> value.any { isTruthy(it) }
                    else -> isTruthy(value)
                }
                JsonPrimitive(result)
            }
            "all" -> {
                val result = when (value) {
                    is JsonArray -> value.all { isTruthy(it) }
                    else -> isTruthy(value)
                }
                JsonPrimitive(result)
            }
            "none" -> {
                val result = when (value) {
                    is JsonArray -> value.none { isTruthy(it) }
                    else -> !isTruthy(value)
                }
                JsonPrimitive(result)
            }
            else -> value
        }
    }

    /**
     * Evaluate an operator-based comparison
     */
    private fun evaluateOperator(operator: String, left: JsonElement?, right: JsonElement?): Boolean {
        return when (operator) {
            "eq" -> compareEqual(left, right)
            "neq" -> !compareEqual(left, right)
            "gt" -> {
                val rightNum = (right as? JsonPrimitive)?.doubleOrNull ?: return false
                compareGreater(left, rightNum)
            }
            "gte" -> {
                val rightNum = (right as? JsonPrimitive)?.doubleOrNull ?: return false
                compareGreater(left, rightNum) || compareEqualNumeric(left, rightNum)
            }
            "lt" -> {
                val rightNum = (right as? JsonPrimitive)?.doubleOrNull ?: return false
                compareLess(left, rightNum)
            }
            "lte" -> {
                val rightNum = (right as? JsonPrimitive)?.doubleOrNull ?: return false
                compareLess(left, rightNum) || compareEqualNumeric(left, rightNum)
            }
            "contains" -> {
                val rightStr = (right as? JsonPrimitive)?.content ?: return false
                when (left) {
                    is JsonPrimitive -> left.content.contains(rightStr)
                    is JsonArray -> left.any {
                        (it as? JsonPrimitive)?.content == rightStr
                    }
                    else -> false
                }
            }
            "startsWith" -> {
                val leftStr = (left as? JsonPrimitive)?.content ?: return false
                val rightStr = (right as? JsonPrimitive)?.content ?: return false
                leftStr.startsWith(rightStr)
            }
            "endsWith" -> {
                val leftStr = (left as? JsonPrimitive)?.content ?: return false
                val rightStr = (right as? JsonPrimitive)?.content ?: return false
                leftStr.endsWith(rightStr)
            }
            "empty" -> isEmpty(left)
            "notEmpty" -> !isEmpty(left)
            else -> isTruthy(left)
        }
    }

    /**
     * Check if a value is empty
     */
    private fun isEmpty(value: JsonElement?): Boolean {
        return when (value) {
            null, JsonNull -> true
            is JsonPrimitive -> value.content.isEmpty()
            is JsonArray -> value.isEmpty()
            is JsonObject -> value.isEmpty()
        }
    }

    /**
     * Check if a value is truthy
     */
    private fun isTruthy(value: JsonElement?): Boolean {
        return when (value) {
            null, JsonNull -> false
            is JsonPrimitive -> {
                when {
                    value.booleanOrNull != null -> value.boolean
                    value.isString -> value.content.isNotEmpty()
                    value.doubleOrNull != null -> value.double != 0.0
                    else -> true
                }
            }
            is JsonArray -> value.isNotEmpty()
            is JsonObject -> value.isNotEmpty()
        }
    }

    /**
     * Compare two values for equality
     */
    private fun compareEqual(left: JsonElement?, right: JsonElement?): Boolean {
        if (left == null && right == null) return true
        if (left == null || right == null) return false

        return when {
            left is JsonPrimitive && right is JsonPrimitive -> {
                left.content == right.content
            }
            left is JsonArray && right is JsonArray -> {
                left.size == right.size && left.zip(right).all { (l, r) -> compareEqual(l, r) }
            }
            left is JsonObject && right is JsonObject -> {
                left.keys == right.keys && left.keys.all { compareEqual(left[it], right[it]) }
            }
            else -> left == right
        }
    }

    /**
     * Compare if left is greater than right (numeric)
     */
    private fun compareGreater(left: JsonElement?, right: Double): Boolean {
        val leftNum = (left as? JsonPrimitive)?.doubleOrNull ?: return false
        return leftNum > right
    }

    /**
     * Compare if left is less than right (numeric)
     */
    private fun compareLess(left: JsonElement?, right: Double): Boolean {
        val leftNum = (left as? JsonPrimitive)?.doubleOrNull ?: return false
        return leftNum < right
    }

    /**
     * Compare if left equals right (numeric)
     */
    private fun compareEqualNumeric(left: JsonElement?, right: Double): Boolean {
        val leftNum = (left as? JsonPrimitive)?.doubleOrNull ?: return false
        return leftNum == right
    }
}
