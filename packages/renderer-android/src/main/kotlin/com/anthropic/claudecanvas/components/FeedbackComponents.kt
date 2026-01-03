package com.anthropic.claudecanvas.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import com.anthropic.claudecanvas.*
import com.anthropic.claudecanvas.utils.JsonPointer
import kotlinx.coroutines.delay
import kotlinx.serialization.json.*

/**
 * Progress indicator component
 */
@Composable
fun CcProgress(
    component: ComponentDefinition,
    dataModel: DataModel,
    modifier: Modifier = Modifier
) {
    val valuePath = component["valuePath"]?.jsonPrimitive?.content
    val value = if (valuePath != null) {
        JsonPointer.getNumber(dataModel, valuePath)?.toFloat() ?: 0f
    } else {
        component["value"]?.jsonPrimitive?.floatOrNull ?: 0f
    }
    val variant = component["variant"]?.jsonPrimitive?.content ?: "linear"
    val size = component["size"]?.jsonPrimitive?.content ?: "medium"
    val label = component["label"]?.jsonPrimitive?.content
    val showLabel = component["showLabel"]?.jsonPrimitive?.booleanOrNull ?: false
    val color = component["color"]?.jsonPrimitive?.content
    val trackColor = component["trackColor"]?.jsonPrimitive?.content

    val progressColor = if (color != null) {
        try { Color(android.graphics.Color.parseColor(color)) }
        catch (e: Exception) { MaterialTheme.colorScheme.primary }
    } else {
        MaterialTheme.colorScheme.primary
    }

    val progressTrackColor = if (trackColor != null) {
        try { Color(android.graphics.Color.parseColor(trackColor)) }
        catch (e: Exception) { MaterialTheme.colorScheme.surfaceVariant }
    } else {
        MaterialTheme.colorScheme.surfaceVariant
    }

    val progress = (value / 100f).coerceIn(0f, 1f)

    Column(modifier = modifier.fillMaxWidth()) {
        if (variant == "circular") {
            val sizeDp = when (size) {
                "small" -> 32.dp
                "large" -> 80.dp
                else -> 48.dp
            }

            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier.size(sizeDp)
            ) {
                CircularProgressIndicator(
                    progress = { progress },
                    modifier = Modifier.fillMaxSize(),
                    color = progressColor,
                    trackColor = progressTrackColor,
                    strokeWidth = when (size) {
                        "small" -> 3.dp
                        "large" -> 6.dp
                        else -> 4.dp
                    }
                )
                if (showLabel) {
                    Text(
                        text = "${value.toInt()}%",
                        style = MaterialTheme.typography.labelSmall
                    )
                }
            }
        } else {
            // Linear progress
            if (label != null || showLabel) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    label?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
                    if (showLabel) {
                        Text("${value.toInt()}%", style = MaterialTheme.typography.bodySmall)
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
            }

            val height = when (size) {
                "small" -> 4.dp
                "large" -> 12.dp
                else -> 8.dp
            }

            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(height)
                    .clip(RoundedCornerShape(9999.dp)),
                color = progressColor,
                trackColor = progressTrackColor
            )
        }
    }
}

/**
 * Skeleton loading component
 */
@Composable
fun CcSkeleton(
    component: ComponentDefinition,
    modifier: Modifier = Modifier
) {
    val variant = component["variant"]?.jsonPrimitive?.content ?: "text"
    val width = component["width"]?.jsonPrimitive?.intOrNull
    val height = component["height"]?.jsonPrimitive?.intOrNull
    val lines = component["lines"]?.jsonPrimitive?.intOrNull ?: 1
    val animation = component["animation"]?.jsonPrimitive?.content ?: "pulse"

    val infiniteTransition = rememberInfiniteTransition(label = "skeleton")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 0.5f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alpha"
    )

    val skeletonModifier = if (animation == "pulse") {
        Modifier.graphicsLayer { this.alpha = alpha }
    } else {
        Modifier
    }

    when (variant) {
        "circular" -> {
            val size = (height ?: 40).dp
            Box(
                modifier = modifier
                    .size(size)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .then(skeletonModifier)
            )
        }
        "rectangular" -> {
            Box(
                modifier = modifier
                    .then(if (width != null) Modifier.width(width.dp) else Modifier.fillMaxWidth())
                    .height((height ?: 100).dp)
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .then(skeletonModifier)
            )
        }
        else -> {
            // Text variant
            Column(
                modifier = modifier,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                repeat(lines) { index ->
                    val lineWidth = if (index == lines - 1) 0.7f else 1f
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(lineWidth)
                            .height((height ?: 16).dp)
                            .clip(RoundedCornerShape(4.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                            .then(skeletonModifier)
                    )
                }
            }
        }
    }
}

/**
 * Alert component
 */
@Composable
fun CcAlert(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    modifier: Modifier = Modifier
) {
    val openPath = component["openPath"]?.jsonPrimitive?.content
    val isOpen = if (openPath != null) {
        JsonPointer.getBoolean(dataModel, openPath)
    } else {
        true
    }
    val messagePath = component["messagePath"]?.jsonPrimitive?.content
    val message = if (messagePath != null) {
        JsonPointer.getString(dataModel, messagePath) ?: ""
    } else {
        component["message"]?.jsonPrimitive?.content ?: ""
    }
    val title = component["title"]?.jsonPrimitive?.content
    val variant = component["variant"]?.jsonPrimitive?.content ?: "info"
    val dismissible = component["dismissible"]?.jsonPrimitive?.booleanOrNull ?: false
    val showIcon = component["showIcon"]?.jsonPrimitive?.booleanOrNull ?: true

    var dismissed by remember { mutableStateOf(false) }

    if (!isOpen || dismissed) return

    val (backgroundColor, contentColor, icon) = when (variant) {
        "success" -> Triple(Color(0xFFDCFCE7), Color(0xFF166534), "✓")
        "warning" -> Triple(Color(0xFFFEF3C7), Color(0xFF92400E), "⚠")
        "error" -> Triple(Color(0xFFFEE2E2), Color(0xFFB91C1C), "✕")
        else -> Triple(Color(0xFFDBEAFE), Color(0xFF1E40AF), "ℹ")
    }

    Surface(
        color = backgroundColor,
        shape = RoundedCornerShape(8.dp),
        modifier = modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (showIcon) {
                Text(icon, color = contentColor)
            }

            Column(modifier = Modifier.weight(1f)) {
                title?.let {
                    Text(
                        text = it,
                        style = MaterialTheme.typography.titleSmall,
                        color = contentColor
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                }
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = contentColor
                )
            }

            if (dismissible) {
                IconButton(
                    onClick = {
                        dismissed = true
                        openPath?.let { onInputChange(it, false) }
                    },
                    modifier = Modifier.size(24.dp)
                ) {
                    Text("×", color = contentColor)
                }
            }
        }
    }
}

/**
 * Toast notification component
 */
@Composable
fun CcToast(
    component: ComponentDefinition,
    dataModel: DataModel,
    onInputChange: (String, Any?) -> Unit,
    onAction: (Action) -> Unit
) {
    val openPath = component["openPath"]?.jsonPrimitive?.content
    val isOpen = if (openPath != null) {
        JsonPointer.getBoolean(dataModel, openPath)
    } else {
        true
    }
    val messagePath = component["messagePath"]?.jsonPrimitive?.content
    val message = if (messagePath != null) {
        JsonPointer.getString(dataModel, messagePath) ?: ""
    } else {
        component["message"]?.jsonPrimitive?.content ?: ""
    }
    val variant = component["variant"]?.jsonPrimitive?.content ?: "info"
    val duration = component["duration"]?.jsonPrimitive?.intOrNull ?: 5000
    val dismissible = component["dismissible"]?.jsonPrimitive?.booleanOrNull ?: true
    val actionLabel = component["actionLabel"]?.jsonPrimitive?.content
    val action = component["action"]?.let { Json.decodeFromJsonElement<Action>(it) }

    var dismissed by remember { mutableStateOf(false) }

    // Auto-dismiss after duration
    LaunchedEffect(isOpen) {
        if (isOpen && duration > 0) {
            delay(duration.toLong())
            dismissed = true
            openPath?.let { onInputChange(it, false) }
        }
    }

    if (!isOpen || dismissed) return

    val (backgroundColor, contentColor, icon) = when (variant) {
        "success" -> Triple(Color(0xFFDCFCE7), Color(0xFF166534), "✓")
        "warning" -> Triple(Color(0xFFFEF3C7), Color(0xFF92400E), "⚠")
        "error" -> Triple(Color(0xFFFEE2E2), Color(0xFFB91C1C), "✕")
        else -> Triple(Color(0xFFDBEAFE), Color(0xFF1E40AF), "ℹ")
    }

    Surface(
        color = backgroundColor,
        shape = RoundedCornerShape(8.dp),
        shadowElevation = 4.dp,
        modifier = Modifier.padding(8.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(icon, color = contentColor)

            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = contentColor,
                modifier = Modifier.weight(1f)
            )

            actionLabel?.let {
                TextButton(
                    onClick = { action?.let { onAction(it) } }
                ) {
                    Text(it, color = contentColor)
                }
            }

            if (dismissible) {
                IconButton(
                    onClick = {
                        dismissed = true
                        openPath?.let { onInputChange(it, false) }
                    },
                    modifier = Modifier.size(24.dp)
                ) {
                    Text("×", color = contentColor)
                }
            }
        }
    }
}
