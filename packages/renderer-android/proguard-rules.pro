# ClaudeCanvas Android Renderer ProGuard Rules

# Keep all ClaudeCanvas classes
-keep class com.anthropic.claudecanvas.** { *; }
-keepclassmembers class com.anthropic.claudecanvas.** { *; }

# Keep Kotlin serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt

-keepclassmembers class kotlinx.serialization.json.** {
    *** Companion;
}
-keepclasseswithmembers class kotlinx.serialization.json.** {
    kotlinx.serialization.KSerializer serializer(...);
}

# Keep data classes for serialization
-keepclassmembers @kotlinx.serialization.Serializable class com.anthropic.claudecanvas.** {
    static com.anthropic.claudecanvas.$$serializer* INSTANCE;
    kotlinx.serialization.KSerializer serializer(...);
}

# Compose
-dontwarn androidx.compose.**

# Coil
-dontwarn coil.**
