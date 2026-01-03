package com.anthropic.claudecanvas.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.anthropic.claudecanvas.*
import com.anthropic.claudecanvas.utils.JsonPointer
import kotlinx.serialization.json.*

/**
 * Video player component
 * Note: Full ExoPlayer integration requires additional setup
 */
@Composable
fun CcVideo(
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
    val title = component["title"]?.jsonPrimitive?.content
    val poster = component["poster"]?.jsonPrimitive?.content
    val autoplay = component["autoplay"]?.jsonPrimitive?.booleanOrNull ?: false
    val controls = component["controls"]?.jsonPrimitive?.booleanOrNull ?: true
    val width = component["width"]?.jsonPrimitive?.intOrNull
    val height = component["height"]?.jsonPrimitive?.intOrNull ?: 200

    Column(modifier = modifier.fillMaxWidth()) {
        title?.let {
            Text(
                text = it,
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(bottom = 8.dp)
            )
        }

        // Placeholder for video - full implementation requires ExoPlayer
        Surface(
            color = MaterialTheme.colorScheme.surfaceVariant,
            modifier = Modifier
                .fillMaxWidth()
                .height(height.dp)
        ) {
            Box(
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🎬", style = MaterialTheme.typography.headlineLarge)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Video: $src", style = MaterialTheme.typography.bodySmall)
                    if (!controls) {
                        Text("(controls disabled)", style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
    }
}

/**
 * Audio player component
 * Note: Full ExoPlayer integration requires additional setup
 */
@Composable
fun CcAudio(
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
    val title = component["title"]?.jsonPrimitive?.content
    val autoplay = component["autoplay"]?.jsonPrimitive?.booleanOrNull ?: false
    val controls = component["controls"]?.jsonPrimitive?.booleanOrNull ?: true
    val loop = component["loop"]?.jsonPrimitive?.booleanOrNull ?: false

    Column(modifier = modifier.fillMaxWidth()) {
        title?.let {
            Text(
                text = it,
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(bottom = 8.dp)
            )
        }

        // Placeholder for audio - full implementation requires ExoPlayer
        Surface(
            color = MaterialTheme.colorScheme.surfaceVariant,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("🎵", style = MaterialTheme.typography.headlineSmall)
                Spacer(modifier = Modifier.width(16.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text("Audio Player", style = MaterialTheme.typography.bodyMedium)
                    Text(src, style = MaterialTheme.typography.bodySmall, maxLines = 1)
                }
                if (controls) {
                    IconButton(onClick = { /* Play/Pause */ }) {
                        Text("▶️")
                    }
                }
            }
        }
    }
}
