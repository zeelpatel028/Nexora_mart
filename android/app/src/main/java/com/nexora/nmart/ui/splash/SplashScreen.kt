package com.nexora.nmart.ui.splash

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nexora.nmart.R
import com.nexora.nmart.ui.theme.NexoraDarkNavy
import com.nexora.nmart.ui.theme.NexoraOrange
import kotlinx.coroutines.delay

/**
 * Nexora Mart Loading / Splash Screen
 * Exactly matches image 2 (same to same):
 * - Clean light warm background (#FFF9F3)
 * - Top-left organic glossy orange-peach wave curves
 * - Bottom-right organic glowing orange wave curves
 * - Centered 3D "M" logo with vibrant orange/gold gradient
 * - Bold uppercase wordmark: "NEXORA" (Dark Navy) + "MART" (Vibrant Orange)
 * - Rotating circular gradient loading spinner (peach to vibrant orange)
 * - Centered status text: "Starting App..." in Dark Navy
 */
@Composable
fun SplashScreen(
    onSplashComplete: () -> Unit,
    modifier: Modifier = Modifier
) {
    // Entrance animations
    val contentAlpha = remember { Animatable(0f) }
    val contentScale = remember { Animatable(0.92f) }

    LaunchedEffect(Unit) {
        contentAlpha.animateTo(
            targetValue = 1f,
            animationSpec = tween(durationMillis = 600, easing = FastOutSlowInEasing)
        )
    }

    LaunchedEffect(Unit) {
        contentScale.animateTo(
            targetValue = 1f,
            animationSpec = tween(durationMillis = 600, easing = FastOutSlowInEasing)
        )
    }

    // Auto navigate after loading completes
    LaunchedEffect(Unit) {
        delay(2200)
        onSplashComplete()
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) {
                onSplashComplete()
            }
    ) {
        // 1. Organic Wave Decorations (Top-left & Bottom-right matching img 2)
        LoadingBackgroundDecorations(
            modifier = Modifier.fillMaxSize()
        )

        // 2. Centered Content: 3D Logo + NEXORA MART + Loading Spinner + "Starting App..."
        Column(
            modifier = Modifier
                .align(Alignment.Center)
                .padding(horizontal = 24.dp)
                .alpha(contentAlpha.value)
                .scale(contentScale.value),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // 3D Gradient M Logo
            Image(
                painter = painterResource(id = R.drawable.logo),
                contentDescription = "Nexora Mart Logo",
                modifier = Modifier.size(112.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Wordmark: NEXORA (Dark Navy) + MART (Orange)
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "NEXORA",
                    style = TextStyle(
                        fontSize = 26.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = NexoraDarkNavy,
                        letterSpacing = 1.sp
                    )
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "MART",
                    style = TextStyle(
                        fontSize = 26.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = NexoraOrange,
                        letterSpacing = 1.sp
                    )
                )
            }

            Spacer(modifier = Modifier.height(48.dp))

            // Rotating Circular Gradient Loading Spinner (Image 2 style)
            NexoraLoadingSpinner(
                sizeDp = 46.dp
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Loading Status Text
            Text(
                text = "Starting App...",
                style = TextStyle(
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = NexoraDarkNavy,
                    letterSpacing = 0.2.sp
                )
            )
        }
    }
}

/**
 * Animated Circular Gradient Loading Spinner matching Image 2
 * Fades smoothly from translucent peach-orange into vibrant solid orange with rounded caps.
 */
@Composable
fun NexoraLoadingSpinner(
    modifier: Modifier = Modifier,
    sizeDp: Dp = 46.dp
) {
    val infiniteTransition = rememberInfiniteTransition(label = "spinner_rotation")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation"
    )

    Canvas(
        modifier = modifier
            .size(sizeDp)
            .rotate(rotation)
    ) {
        val strokeWidth = 4.5.dp.toPx()
        val sweepBrush = Brush.sweepGradient(
            0.0f to Color(0x00FF6A1A),
            0.25f to Color(0x33FF6A1A),
            0.65f to Color(0x99FF6A1A),
            1.0f to Color(0xFFFF6A1A)
        )

        drawArc(
            brush = sweepBrush,
            startAngle = 0f,
            sweepAngle = 280f,
            useCenter = false,
            topLeft = Offset(strokeWidth / 2, strokeWidth / 2),
            size = Size(size.width - strokeWidth, size.height - strokeWidth),
            style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
        )
    }
}

/**
 * Custom Canvas drawing the exact organic wave curves from Image 2
 */
@Composable
private fun LoadingBackgroundDecorations(
    modifier: Modifier = Modifier
) {
    Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height

        // 1. Base light warm cream background
        drawRect(Color(0xFFFFF9F3))

        // ========================================================
        // 2. TOP-LEFT ORGANIC WAVES
        // ========================================================

        // Under-layer: Soft light peach wave
        val topLeftPeach = Path().apply {
            moveTo(0f, 0f)
            lineTo(w * 0.44f, 0f)
            cubicTo(
                w * 0.38f, h * 0.08f,
                w * 0.20f, h * 0.17f,
                0f, h * 0.23f
            )
            close()
        }
        drawPath(
            path = topLeftPeach,
            brush = Brush.linearGradient(
                colors = listOf(
                    Color(0xFFFFD5A5),
                    Color(0xFFFFEAD4)
                ),
                start = Offset(0f, 0f),
                end = Offset(w * 0.35f, h * 0.18f)
            )
        )

        // Top-layer: Vibrant glossy orange wave
        val topLeftOrange = Path().apply {
            moveTo(0f, 0f)
            lineTo(w * 0.30f, 0f)
            cubicTo(
                w * 0.24f, h * 0.06f,
                w * 0.14f, h * 0.13f,
                0f, h * 0.18f
            )
            close()
        }
        drawPath(
            path = topLeftOrange,
            brush = Brush.linearGradient(
                colors = listOf(
                    Color(0xFFFF6214),
                    Color(0xFFFF852E),
                    Color(0xFFFFA652)
                ),
                start = Offset(0f, 0f),
                end = Offset(w * 0.25f, h * 0.14f)
            )
        )

        // ========================================================
        // 3. BOTTOM-RIGHT ORGANIC WAVES
        // ========================================================

        // Under-layer: Soft golden peach wave rising from bottom right
        val bottomPeach = Path().apply {
            moveTo(0f, h * 0.90f)
            cubicTo(
                w * 0.25f, h * 0.86f,
                w * 0.60f, h * 0.94f,
                w, h * 0.81f
            )
            lineTo(w, h)
            lineTo(0f, h)
            close()
        }
        drawPath(
            path = bottomPeach,
            brush = Brush.linearGradient(
                colors = listOf(
                    Color(0xFFFFE2BF),
                    Color(0xFFFFD09E),
                    Color(0xFFFFC085)
                ),
                start = Offset(0f, h * 0.90f),
                end = Offset(w, h * 0.81f)
            )
        )

        // Top-layer: Rich radiant orange sweeping wave
        val bottomOrange = Path().apply {
            moveTo(0f, h * 0.94f)
            cubicTo(
                w * 0.30f, h * 0.92f,
                w * 0.65f, h * 0.98f,
                w, h * 0.86f
            )
            lineTo(w, h)
            lineTo(0f, h)
            close()
        }
        drawPath(
            path = bottomOrange,
            brush = Brush.linearGradient(
                colors = listOf(
                    Color(0xFFFF5F12),
                    Color(0xFFFF7E26),
                    Color(0xFFFFA84E)
                ),
                start = Offset(0f, h),
                end = Offset(w, h * 0.86f)
            )
        )
    }
}
