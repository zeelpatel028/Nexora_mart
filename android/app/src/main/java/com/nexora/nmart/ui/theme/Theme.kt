package com.nexora.nmart.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = PrimaryBlue,
    onPrimary = Color.White,
    primaryContainer = PrimaryContainer,
    onPrimaryContainer = OnPrimaryContainer,
    secondary = NavyDark,
    onSecondary = Color.White,
    secondaryContainer = Slate100,
    onSecondaryContainer = NavyDark,
    tertiary = EmeraldSuccess,
    onTertiary = Color.White,
    background = Slate50,
    onBackground = NavyDark,
    surface = Color.White,
    onSurface = NavyDark,
    surfaceVariant = Slate100,
    onSurfaceVariant = Slate600,
    outline = Slate200,
    outlineVariant = Slate100,
    error = RedError,
    onError = Color.White,
    errorContainer = RedErrorSubtle,
    onErrorContainer = RedError
)

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryLight,
    onPrimary = NavyDark,
    primaryContainer = Slate800,
    onPrimaryContainer = PrimaryContainer,
    secondary = Slate200,
    onSecondary = NavyDark,
    secondaryContainer = DarkSurfaceVariant,
    onSecondaryContainer = DarkTextPrimary,
    tertiary = EmeraldSuccess,
    onTertiary = Color.White,
    background = DarkBackground,
    onBackground = DarkTextPrimary,
    surface = DarkSurface,
    onSurface = DarkTextPrimary,
    surfaceVariant = DarkSurfaceVariant,
    onSurfaceVariant = DarkTextSecondary,
    outline = DarkBorder,
    outlineVariant = DarkBorder,
    error = RedError,
    onError = Color.White,
    errorContainer = DarkSurfaceVariant,
    onErrorContainer = RedError
)

@Composable
fun NMARTTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
