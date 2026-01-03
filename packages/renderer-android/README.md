# @anthropic/claude-canvas-renderer-android

Android (Kotlin/Jetpack Compose) renderer for ClaudeCanvas declarative UI surfaces. This package provides all 31 ClaudeCanvas components as Compose composables, enabling seamless integration of AI-generated UIs into Android applications.

## Features

- **31 Components**: Complete implementation of all ClaudeCanvas components
- **Jetpack Compose**: Native Android UI with Material 3 design
- **Kotlin-First**: Written entirely in Kotlin with full type safety
- **JSON Pointer Support**: RFC 6901 compliant data binding paths
- **Conditional Visibility**: Show/hide components based on data model conditions
- **Reactive State**: Automatic recomposition when data model changes
- **Material 3**: Modern Android design system support

## Requirements

- Android SDK 24+ (Android 7.0+)
- Kotlin 1.9+
- Jetpack Compose 1.5+

## Installation

### Gradle (Kotlin DSL)

```kotlin
dependencies {
    implementation("com.anthropic:claude-canvas-renderer:1.0.0")
}
```

### Gradle (Groovy)

```groovy
dependencies {
    implementation 'com.anthropic:claude-canvas-renderer:1.0.0'
}
```

## Quick Start

```kotlin
import com.anthropic.claudecanvas.*
import androidx.compose.runtime.*

@Composable
fun MyScreen() {
    var dataModel by remember { mutableStateOf(emptyMap<String, JsonElement>()) }

    val surface = Surface(
        version = "1.0",
        title = "Welcome",
        components = listOf(
            ComponentDefinition(
                component = "Text",
                properties = buildJsonObject {
                    put("content", "Hello from ClaudeCanvas!")
                    put("variant", "heading1")
                }
            ),
            ComponentDefinition(
                component = "Button",
                properties = buildJsonObject {
                    put("label", "Click Me")
                    put("action", buildJsonObject {
                        put("type", "click")
                    })
                }
            )
        )
    )

    CcSurface(
        surface = surface,
        dataModel = dataModel,
        onDataModelChange = { dataModel = it },
        onAction = { message ->
            println("Action received: ${message.action.type}")
        }
    )
}
```

## Components

### Layout Components (7)

| Component | Description |
|-----------|-------------|
| `CcRow` | Horizontal arrangement with gap and alignment |
| `CcColumn` | Vertical arrangement with gap and alignment |
| `CcCard` | Container with elevation and optional header |
| `CcDivider` | Visual separator (horizontal/vertical) |
| `CcModal` | Dialog overlay with dismiss handling |
| `CcTabs` | Tabbed content with Material 3 tabs |
| `CcAccordion` | Expandable sections with animation |

### Display Components (8)

| Component | Description |
|-----------|-------------|
| `CcText` | Text display with typography variants |
| `CcImage` | Async image loading with Coil |
| `CcIcon` | Emoji/unicode icon display |
| `CcBadge` | Status indicator chip |
| `CcAvatar` | User avatar with image or initials |
| `CcCodeBlock` | Monospace code display with copy |
| `CcMarkdown` | Markdown content (basic support) |
| `CcLink` | Clickable link text |

### Form/Input Components (9)

| Component | Description |
|-----------|-------------|
| `CcTextField` | Single-line text input |
| `CcTextArea` | Multi-line text input |
| `CcSelect` | Dropdown with ExposedDropdownMenu |
| `CcCheckbox` | Material 3 checkbox |
| `CcRadioGroup` | Single selection radio buttons |
| `CcSwitch` | Toggle switch |
| `CcSlider` | Numeric range slider |
| `CcDatePicker` | Material 3 date picker dialog |
| `CcFileUpload` | File selection (placeholder) |

### Interactive Components (3)

| Component | Description |
|-----------|-------------|
| `CcButton` | Material 3 buttons with variants |
| `CcButtonGroup` | Grouped buttons |
| `CcChip` | Selectable/deletable chips |

### Media Components (2)

| Component | Description |
|-----------|-------------|
| `CcVideo` | Video player (ExoPlayer integration) |
| `CcAudio` | Audio player (ExoPlayer integration) |

### Data Visualization Components (3)

| Component | Description |
|-----------|-------------|
| `CcChart` | Chart placeholder (Vico integration) |
| `CcDataTable` | Sortable data table |
| `CcList` | Templated list with empty state |

### Feedback Components (4)

| Component | Description |
|-----------|-------------|
| `CcProgress` | Linear/circular progress indicator |
| `CcSkeleton` | Animated loading placeholder |
| `CcAlert` | Dismissible alert message |
| `CcToast` | Auto-dismiss notification |

## Data Binding

ClaudeCanvas uses JSON Pointer (RFC 6901) for data binding:

```kotlin
val surface = Surface(
    components = listOf(
        ComponentDefinition(
            component = "TextField",
            properties = buildJsonObject {
                put("label", "Username")
                put("valuePath", "/user/name")
                put("placeholder", "Enter username")
            }
        ),
        ComponentDefinition(
            component = "Text",
            properties = buildJsonObject {
                put("contentPath", "/user/name")
            }
        )
    )
)

val dataModel = buildMap {
    put("user", buildJsonObject {
        put("name", JsonPrimitive("John Doe"))
    })
}
```

## Conditional Visibility

Show or hide components based on data model values:

```kotlin
ComponentDefinition(
    component = "Text",
    visibleIf = VisibleIf(
        path = "/user/isPremium",
        eq = JsonPrimitive(true)
    ),
    properties = buildJsonObject {
        put("content", "Premium feature")
    }
)
```

### Supported Operators

- `eq` - Equal
- `neq` - Not equal
- `gt` - Greater than
- `gte` - Greater than or equal
- `lt` - Less than
- `lte` - Less than or equal
- `contains` - String/array contains
- `startsWith` - String starts with
- `endsWith` - String ends with
- `empty` - Value is empty
- `notEmpty` - Value is not empty

### Compound Conditions

```kotlin
VisibleIf(
    and = listOf(
        VisibleIf(path = "/form/isValid", eq = JsonPrimitive(true)),
        VisibleIf(path = "/form/isSubmitting", eq = JsonPrimitive(false))
    )
)
```

## Actions

Handle component actions:

```kotlin
CcSurface(
    surface = surface,
    dataModel = dataModel,
    onAction = { message ->
        when (message.action.type) {
            "submit" -> submitForm(message.action.payload)
            "navigate" -> navigateTo(message.action.payload)
            else -> println("Unknown action: ${message.action.type}")
        }
    }
)
```

## Theming

The renderer uses Material 3 theming. Wrap in `MaterialTheme` for custom colors:

```kotlin
MaterialTheme(
    colorScheme = darkColorScheme()
) {
    CcSurface(surface = surface, ...)
}
```

## JSON Parsing

Use kotlinx.serialization for parsing surface definitions:

```kotlin
val json = Json {
    ignoreUnknownKeys = true
    isLenient = true
}

val surface = json.decodeFromString<Surface>(jsonString)
```

## Dependencies

This package includes:
- **Coil**: Async image loading
- **kotlinx-serialization**: JSON parsing
- **Vico**: Charts (optional)
- **ExoPlayer**: Media playback (optional)

## ProGuard Rules

If using R8/ProGuard, add these rules:

```proguard
-keep class com.anthropic.claudecanvas.** { *; }
-keepclassmembers class com.anthropic.claudecanvas.** { *; }
```

## License

MIT

## Related Packages

- `@anthropic/claude-canvas` - Core specification and types
- `@anthropic/claude-canvas-renderer-lit` - Lit/Web Components renderer
- `@anthropic/claude-canvas-renderer-react` - React renderer
- `@anthropic/claude-canvas-renderer-angular` - Angular renderer
- `@anthropic/claude-canvas-renderer-flutter` - Flutter renderer
