package com.nexora.nmart.ui.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

// NEXORA MART Official Design Tokens (Step 3)
val NexoraOrange = Color(0xFFFF6A1A)
val NexoraYellowOrange = Color(0xFFFFB82E)
val NexoraButtonGradientStart = Color(0xFFFF5F1F)
val NexoraButtonGradientEnd = Color(0xFFFFB62E)
val NexoraDarkNavy = Color(0xFF0B0B2B)
val NexoraGreyText = Color(0xFF6B6F80)
val NexoraPageBackground = Color(0xFFFFF6EC)
val NexoraCardBackground = Color(0xFFFFFAF5)
val NexoraInputBackground = Color(0xFFFFFFFF)
val NexoraInputBorder = Color(0xFFE8ECEF)
val NexoraErrorRed = Color(0xFFDC2626)

// Nexora Dark Mode Design Tokens (Matched 1:1 to Screenshot)
val NexoraDarkBackground = Color(0xFF111520)
val NexoraDarkCardBackground = Color(0xFF181E2B)
val NexoraDarkCardBorder = Color(0xFF262E3F)
val NexoraDarkInputBackground = Color(0xFF1B2232)
val NexoraDarkInputBorder = Color(0xFF283348)
val NexoraDarkTextPrimary = Color(0xFFFFFFFF)
val NexoraDarkTextSecondary = Color(0xFF8E9CAE)
val NexoraDarkDivider = Color(0xFF252D3E)

// Button Gradient Brush
val NexoraButtonBrush = Brush.horizontalGradient(
    colors = listOf(NexoraButtonGradientStart, NexoraButtonGradientEnd)
)

// Legacy Palette Support for other screens
val PrimaryBlue = Color(0xFF2563EB)
val PrimaryDark = Color(0xFF1D4ED8)
val PrimaryLight = Color(0xFF3B82F6)
val PrimaryContainer = Color(0xFFDBEAFE)
val OnPrimaryContainer = Color(0xFF1E40AF)

val NavyDark = Color(0xFF0B0B2B)
val Slate800 = Color(0xFF1E293B)
val Slate700 = Color(0xFF334155)
val Slate600 = Color(0xFF475569)
val Slate500 = Color(0xFF64748B)
val Slate400 = Color(0xFF94A3B8)
val Slate200 = Color(0xFFE2E8F0)
val Slate100 = Color(0xFFF1F5F9)
val Slate50 = Color(0xFFF8FAFC)

val EmeraldSuccess = Color(0xFF10B981)
val EmeraldLight = Color(0xFFD1FAE5)
val AmberWarning = Color(0xFFF59E0B)
val RedError = Color(0xFFEF4444)
val RedErrorSubtle = Color(0xFFFEE2E2)

// Theme Overrides
val DarkBackground = Color(0xFF0B1120)
val DarkSurface = Color(0xFF0F172A)
val DarkSurfaceVariant = Color(0xFF1E293B)
val DarkBorder = Color(0xFF334155)
val DarkTextPrimary = Color(0xFFF8FAFC)
val DarkTextSecondary = Color(0xFF94A3B8)

val LightHeaderBackground = Color(0xFFFFF6EC)
val LightInputBackground = Color(0xFFFFFFFF)
val LightInputBorder = Color(0xFFE8ECEF)
val DarkHeaderBackground = Color(0xFF070B14)
val DarkInputBackground = Color(0xFF162035)
val DarkInputBorder = Color(0xFF243350)

val GradientPurple = Color(0xFF7C3AED)
val GradientMagenta = Color(0xFFC026D3)
val GradientPink = Color(0xFFD946EF)
val GradientOrange = Color(0xFFFF6A1A)
val GradientAmber = Color(0xFFFFB82E)
val GradientTeal = Color(0xFF06B6D4)
