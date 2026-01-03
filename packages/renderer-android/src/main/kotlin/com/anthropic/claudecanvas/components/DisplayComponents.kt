package com.anthropic.claudecanvas.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.anthropic.claudecanvas.*
import com.anthropic.claudecanvas.utils.JsonPointer
import kotlinx.serialization.json.*

/**
 * Text display component
 */
@Composable
fun CcText(
    component: ComponentDefinition,
    dataModel: DataModel,
    modifier: Modifier = Modifier
) {
    val contentPath = component["contentPath"]?.jsonPrimitive?.content
    val content = if (contentPath != null) {
        JsonPointer.getString(dataModel, contentPath) ?: ""
    } else {
        component["content"]?.jsonPrimitive?.content ?: ""
    }
    val variant = component["variant"]?.jsonPrimitive?.content ?: "body"
    val align = component["align"]?.jsonPrimitive?.content ?: "left"
    val color = component["color"]?.jsonPrimitive?.content
    val bold = component["bold"]?.jsonPrimitive?.booleanOrNull ?: false

    val textStyle = when (variant) {
        "heading1", "h1" -> MaterialTheme.typography.headlineLarge
        "heading2", "h2" -> MaterialTheme.typography.headlineMedium
        "heading3", "h3" -> MaterialTheme.typography.headlineSmall
        "heading4", "h4" -> MaterialTheme.typography.titleLarge
        "heading5", "h5" -> MaterialTheme.typography.titleMedium
        "heading6", "h6" -> MaterialTheme.typography.titleSmall
        "subtitle" -> MaterialTheme.typography.titleMedium
        "caption" -> MaterialTheme.typography.bodySmall
        "code" -> MaterialTheme.typography.bodyMedium.copy(fontFamily = FontFamily.Monospace)
        "label" -> MaterialTheme.typography.labelMedium
        else -> MaterialTheme.typography.bodyMedium
    }

    val textAlign = when (align) {
        "center" -> TextAlign.Center
        "right", "end" -> TextAlign.End
        else -> TextAlign.Start
    }

    val textColor = if (color != null) {
        try { Color(android.graphics.Color.parseColor(color)) }
        catch (e: Exception) { Color.Unspecified }
    } else {
        Color.Unspecified
    }

    Text(
        text = content,
        style = textStyle.copy(
            fontWeight = if (bold) FontWeight.Bold else textStyle.fontWeight,
            color = textColor.takeIf { it != Color.Unspecified } ?: textStyle.color
        ),
        textAlign = textAlign,
        modifier = modifier.fillMaxWidth()
    )
}

/**
 * Image display component
 */
@Composable
fun CcImage(
    component: ComponentDefinition,
    dataModel: DataModel,
    modifier: Modifier = Modifier
) {
    val srcPath = component["srcPath"]?.jsonPrimitive?.content
    val src = if (srcPath != null) {
        JsonPointer.getString(dataModel, srcPath) ?: ""
    } else {
        component["src"]?.jsonPrimitive?.content ?: ""
    }
    val alt = component["alt"]?.jsonPrimitive?.content ?: ""
    val width = component["width"]?.jsonPrimitive?.intOrNull
    val height = component["height"]?.jsonPrimitive?.intOrNull
    val fit = component["fit"]?.jsonPrimitive?.content ?: "contain"
    val rounded = component["rounded"]?.jsonPrimitive?.booleanOrNull ?: false

    val contentScale = when (fit) {
        "cover" -> ContentScale.Crop
        "fill" -> ContentScale.FillBounds
        "none" -> ContentScale.None
        else -> ContentScale.Fit
    }

    val shape = if (rounded) RoundedCornerShape(8.dp) else RoundedCornerShape(0.dp)

    AsyncImage(
        model = src,
        contentDescription = alt,
        contentScale = contentScale,
        modifier = modifier
            .then(if (width != null) Modifier.width(width.dp) else Modifier)
            .then(if (height != null) Modifier.height(height.dp) else Modifier)
            .clip(shape)
    )
}

/**
 * Icon display component (using emoji/unicode)
 */
@Composable
fun CcIcon(
    component: ComponentDefinition,
    modifier: Modifier = Modifier
) {
    val icon = component["icon"]?.jsonPrimitive?.content ?: ""
    val size = component["size"]?.jsonPrimitive?.content ?: "medium"
    val color = component["color"]?.jsonPrimitive?.content

    val fontSize = when (size) {
        "small" -> 16.sp
        "large" -> 32.sp
        else -> 24.sp
    }

    val textColor = if (color != null) {
        try { Color(android.graphics.Color.parseColor(color)) }
        catch (e: Exception) { Color.Unspecified }
    } else {
        Color.Unspecified
    }

    Text(
        text = icon,
        fontSize = fontSize,
        color = textColor,
        modifier = modifier
    )
}

/**
 * Badge component
 */
@Composable
fun CcBadge(
    component: ComponentDefinition,
    dataModel: DataModel,
    modifier: Modifier = Modifier
) {
    val contentPath = component["contentPath"]?.jsonPrimitive?.content
    val content = if (contentPath != null) {
        JsonPointer.getString(dataModel, contentPath) ?: ""
    } else {
        component["content"]?.jsonPrimitive?.content ?: ""
    }
    val variant = component["variant"]?.jsonPrimitive?.content ?: "default"

    val (backgroundColor, textColor) = when (variant) {
        "primary" -> Pair(MaterialTheme.colorScheme.primary, MaterialTheme.colorScheme.onPrimary)
        "success" -> Pair(Color(0xFF16A34A), Color.White)
        "warning" -> Pair(Color(0xFFCA8A04), Color.White)
        "error" -> Pair(Color(0xFFDC2626), Color.White)
        "info" -> Pair(Color(0xFF2563EB), Color.White)
        else -> Pair(MaterialTheme.colorScheme.surfaceVariant, MaterialTheme.colorScheme.onSurfaceVariant)
    }

    Surface(
        color = backgroundColor,
        shape = RoundedCornerShape(9999.dp),
        modifier = modifier
    ) {
        Text(
            text = content,
            color = textColor,
            fontSize = 12.sp,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
        )
    }
}

/**
 * Avatar component
 */
@Composable
fun CcAvatar(
    component: ComponentDefinition,
    dataModel: DataModel,
    modifier: Modifier = Modifier
) {
    val srcPath = component["srcPath"]?.jsonPrimitive?.content
    val src = if (srcPath != null) {
        JsonPointer.getString(dataModel, srcPath)
    } else {
        component["src"]?.jsonPrimitive?.content
    }
    val name = component["name"]?.jsonPrimitive?.content ?: ""
    val size = component["size"]?.jsonPrimitive?.content ?: "medium"

    val sizeDp = when (size) {
        "small" -> 32.dp
        "large" -> 64.dp
        else -> 48.dp
    }

    val initials = name.split(" ")
        .take(2)
        .mapNotNull { it.firstOrNull()?.uppercaseChar() }
        .joinToString("")

    Box(
        modifier = modifier
            .size(sizeDp)
            .clip(CircleShape)
            .background(MaterialTheme.colorScheme.primaryContainer),
        contentAlignment = Alignment.Center
    ) {
        if (src != null) {
            AsyncImage(
                model = src,
                contentDescription = name,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        } else {
            Text(
                text = initials,
                color = MaterialTheme.colorScheme.onPrimaryContainer,
                style = MaterialTheme.typography.titleMedium
            )
        }
    }
}

/**
 * Code block component
 */
@Composable
fun CcCodeBlock(
    component: ComponentDefinition,
    dataModel: DataModel,
    modifier: Modifier = Modifier
) {
    val codePath = component["codePath"]?.jsonPrimitive?.content
    val code = if (codePath != null) {
        JsonPointer.getString(dataModel, codePath) ?: ""
    } else {
        component["code"]?.jsonPrimitive?.content ?: ""
    }
    val language = component["language"]?.jsonPrimitive?.content
    val filename = component["filename"]?.jsonPrimitive?.content
    val showCopyButton = component["showCopyButton"]?.jsonPrimitive?.booleanOrNull ?: true

    val clipboardManager = LocalClipboardManager.current
    var copied by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(Color(0xFF1E293B))
    ) {
        // Header
        if (language != null || filename != null || showCopyButton) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF0F172A))
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    language?.let {
                        Surface(
                            color = Color(0xFF334155),
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(
                                text = it,
                                color = Color(0xFF94A3B8),
                                fontSize = 12.sp,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                    filename?.let {
                        Text(
                            text = it,
                            color = Color(0xFF94A3B8),
                            fontSize = 12.sp
                        )
                    }
                }
                if (showCopyButton) {
                    Text(
                        text = if (copied) "✓" else "📋",
                        modifier = Modifier.clickable {
                            clipboardManager.setText(AnnotatedString(code))
                            copied = true
                        }
                    )
                }
            }
        }

        // Code
        Text(
            text = code,
            fontFamily = FontFamily.Monospace,
            fontSize = 14.sp,
            color = Color(0xFFE2E8F0),
            modifier = Modifier
                .horizontalScroll(rememberScrollState())
                .padding(12.dp)
        )
    }

    LaunchedEffect(copied) {
        if (copied) {
            kotlinx.coroutines.delay(2000)
            copied = false
        }
    }
}

/**
 * Markdown component (simplified rendering)
 */
@Composable
fun CcMarkdown(
    component: ComponentDefinition,
    dataModel: DataModel,
    modifier: Modifier = Modifier
) {
    val contentPath = component["contentPath"]?.jsonPrimitive?.content
    val content = if (contentPath != null) {
        JsonPointer.getString(dataModel, contentPath) ?: ""
    } else {
        component["content"]?.jsonPrimitive?.content ?: ""
    }

    // Simple markdown rendering - for production use a markdown library
    Text(
        text = content,
        style = MaterialTheme.typography.bodyMedium,
        modifier = modifier
    )
}

/**
 * Link component
 */
@Composable
fun CcLink(
    component: ComponentDefinition,
    dataModel: DataModel,
    onAction: (Action) -> Unit,
    modifier: Modifier = Modifier
) {
    val hrefPath = component["hrefPath"]?.jsonPrimitive?.content
    val href = if (hrefPath != null) {
        JsonPointer.getString(dataModel, hrefPath) ?: "#"
    } else {
        component["href"]?.jsonPrimitive?.content ?: "#"
    }
    val label = component["label"]?.jsonPrimitive?.content ?: ""
    val action = component["action"]?.let { Json.decodeFromJsonElement<Action>(it) }

    Text(
        text = label,
        color = MaterialTheme.colorScheme.primary,
        style = MaterialTheme.typography.bodyMedium,
        modifier = modifier.clickable {
            if (action != null) {
                onAction(action)
            }
            // For actual URL navigation, use LocalUriHandler
        }
    )
}
