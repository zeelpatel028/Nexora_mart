package com.nexora.nmart.ui.auth

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.outlined.DarkMode
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.LightMode
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nexora.nmart.R
import com.nexora.nmart.ui.theme.NexoraDarkBackground
import com.nexora.nmart.ui.theme.NexoraDarkCardBackground
import com.nexora.nmart.ui.theme.NexoraDarkCardBorder
import com.nexora.nmart.ui.theme.NexoraDarkDivider
import com.nexora.nmart.ui.theme.NexoraDarkInputBackground
import com.nexora.nmart.ui.theme.NexoraDarkInputBorder
import com.nexora.nmart.ui.theme.NexoraDarkNavy
import com.nexora.nmart.ui.theme.NexoraDarkTextPrimary
import com.nexora.nmart.ui.theme.NexoraDarkTextSecondary
import com.nexora.nmart.ui.theme.NexoraErrorRed
import com.nexora.nmart.ui.theme.NexoraGreyText
import com.nexora.nmart.ui.theme.NexoraInputBorder
import com.nexora.nmart.ui.theme.NexoraOrange

/**
 * WaveBackground Composable
 * Draws soft organic glossy wave background supporting Light and Dark modes:
 * - Light Mode: Base cream #FFF9F3 with warm orange/peach waves
 * - Dark Mode: Base obsidian #0C1017 with glowing amber/orange waves
 */
@Composable
fun WaveBackground(
    isDark: Boolean = isSystemInDarkTheme(),
    modifier: Modifier = Modifier
) {
    Canvas(modifier = modifier.fillMaxSize()) {
        val width = size.width
        val height = size.height

        // 1. Base Background
        drawRect(if (isDark) NexoraDarkBackground else Color(0xFFFFF9F3))

        // 2. Top-right corner: peach-to-orange blob
        val topRightPath = Path().apply {
            moveTo(width * 0.55f, 0f)
            cubicTo(
                width * 0.65f, height * 0.08f,
                width * 0.80f, height * 0.16f,
                width, height * 0.12f
            )
            lineTo(width, 0f)
            close()
        }
        drawPath(
            path = topRightPath,
            brush = Brush.linearGradient(
                colors = if (isDark) {
                    listOf(
                        Color(0xFFCC5500).copy(alpha = 0.45f),
                        Color(0xFFFF7A1A).copy(alpha = 0.35f),
                        Color(0xFFFF9E40).copy(alpha = 0.20f)
                    )
                } else {
                    listOf(
                        Color(0xFFFFB066).copy(alpha = 0.85f),
                        Color(0xFFFFC78A).copy(alpha = 0.80f),
                        Color(0xFFFFD9A8).copy(alpha = 0.65f)
                    )
                },
                start = Offset(width, 0f),
                end = Offset(width * 0.55f, height * 0.14f)
            )
        )

        // 3. Left side middle: curved wave bands
        val leftMidUpperPath = Path().apply {
            moveTo(0f, height * 0.12f)
            cubicTo(
                width * 0.25f, height * 0.14f,
                width * 0.55f, height * 0.22f,
                width, height * 0.20f
            )
            lineTo(width, height * 0.28f)
            cubicTo(
                width * 0.50f, height * 0.30f,
                width * 0.20f, height * 0.22f,
                0f, height * 0.22f
            )
            close()
        }
        drawPath(
            path = leftMidUpperPath,
            brush = Brush.linearGradient(
                colors = if (isDark) {
                    listOf(
                        Color(0xFFFF7A1A).copy(alpha = 0.18f),
                        Color(0x00FF7A1A)
                    )
                } else {
                    listOf(
                        Color(0xFFFFE8CF).copy(alpha = 0.50f),
                        Color(0xFFFFF0DF).copy(alpha = 0.35f)
                    )
                },
                start = Offset(0f, height * 0.12f),
                end = Offset(width, height * 0.28f)
            )
        )

        val leftMidBandPath = Path().apply {
            moveTo(0f, height * 0.18f)
            cubicTo(
                width * 0.30f, height * 0.20f,
                width * 0.65f, height * 0.30f,
                width, height * 0.26f
            )
            lineTo(width, height * 0.36f)
            cubicTo(
                width * 0.60f, height * 0.40f,
                width * 0.25f, height * 0.30f,
                0f, height * 0.32f
            )
            close()
        }
        drawPath(
            path = leftMidBandPath,
            brush = Brush.linearGradient(
                colors = if (isDark) {
                    listOf(
                        Color(0xFFFF9E40).copy(alpha = 0.22f),
                        Color(0x00FF9E40)
                    )
                } else {
                    listOf(
                        Color(0xFFFFDDB7).copy(alpha = 0.65f),
                        Color(0xFFFFE3C2).copy(alpha = 0.60f)
                    )
                },
                start = Offset(0f, height * 0.18f),
                end = Offset(width, height * 0.36f)
            )
        )

        // 4. Bottom-right: prominent glowing orange wave
        val bottomRightPath = Path().apply {
            moveTo(width, height * 0.72f)
            cubicTo(
                width * 0.82f, height * 0.78f,
                width * 0.65f, height * 0.88f,
                width * 0.70f, height
            )
            lineTo(width, height)
            close()
        }
        drawPath(
            path = bottomRightPath,
            brush = Brush.linearGradient(
                colors = if (isDark) {
                    listOf(
                        Color(0xFFFFA126).copy(alpha = 0.95f),
                        Color(0xFFFF6A1A).copy(alpha = 0.90f),
                        Color(0xFFD6530A).copy(alpha = 0.75f),
                        Color(0x00111520)
                    )
                } else {
                    listOf(
                        Color(0xFFFFB347).copy(alpha = 0.75f),
                        Color(0xFFFFC36B).copy(alpha = 0.65f),
                        Color(0xFFFFD08A).copy(alpha = 0.50f)
                    )
                },
                start = Offset(width, height),
                end = Offset(width * 0.65f, height * 0.72f)
            )
        )

        // 5. Bottom-left: subtle warm glow
        val bottomLeftPath = Path().apply {
            moveTo(0f, height * 0.78f)
            cubicTo(
                width * 0.20f, height * 0.80f,
                width * 0.40f, height * 0.90f,
                width * 0.60f, height
            )
            lineTo(0f, height)
            close()
        }
        drawPath(
            path = bottomLeftPath,
            brush = Brush.linearGradient(
                colors = if (isDark) {
                    listOf(
                        Color(0xFFFF7A1A).copy(alpha = 0.20f),
                        Color(0x00111520)
                    )
                } else {
                    listOf(
                        Color(0xFFFF8029).copy(alpha = 0.95f),
                        Color(0xFFFF8A3D).copy(alpha = 0.90f),
                        Color(0xFFFFA857).copy(alpha = 0.85f),
                        Color(0xFFFFC27A).copy(alpha = 0.75f)
                    )
                },
                start = Offset(0f, height * 0.78f),
                end = Offset(width * 0.60f, height)
            )
        )
    }
}

/**
 * Mobile Login Screen (Android Jetpack Compose)
 * Matched 1:1 to React Web & Requirements:
 * 1. Header: 92x92 dp logo (rounded 24 dp), 26sp title (medium weight, letter-spacing 1, "NEXORA" in navy & "MART" in orange), 12sp muted tagline.
 *    Logo + title + tagline as ONE group centered vertically & horizontally in flexible area above card.
 * 2. Floating Card: 24 dp radius, 16 dp inner padding, white in light mode (#181E2B in dark mode), 12 dp side margins, 22 dp bottom margin.
 * 3. Exact Spacing: 44 dp input fields (12 dp radius, 8 dp gap), 44 dp Log In button (fully rounded, 12 dp spacing above & below), 44 dp Google button.
 * 4. Responsive & Keyboard friendly: imePadding, moves card up when keyboard opens, shrinks/scrolls header without overlapping fields.
 * 5. Light/Dark theme toggle pill at the top-right corner.
 */
@Composable
fun LoginScreen(
    viewModel: AuthViewModel,
    onNavigateToSignup: () -> Unit,
    onLoginSuccess: () -> Unit,
    onForgotPasswordClick: () -> Unit = {},
    onGoogleSignInClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    // Dynamic Theme Toggle (defaults to system theme)
    val systemDark = isSystemInDarkTheme()
    var isDark by remember { mutableStateOf(systemDark) }

    // Theme Color Tokens
    val cardBackground = if (isDark) NexoraDarkCardBackground else Color.White
    val cardBorder = if (isDark) NexoraDarkCardBorder else Color(0xFFE2E8F0)
    val cardShadowColor = if (isDark) Color(0x60000000) else Color(0x22FF8C3C)
    val textPrimary = if (isDark) NexoraDarkTextPrimary else NexoraDarkNavy
    val textSecondary = if (isDark) NexoraDarkTextSecondary else NexoraGreyText
    val inputBackground = if (isDark) NexoraDarkInputBackground else Color.White
    val inputBorderColor = if (isDark) NexoraDarkInputBorder else NexoraInputBorder
    val dividerColor = if (isDark) NexoraDarkDivider else Color(0xFFE5DFD7)
    val googleBackground = if (isDark) NexoraDarkInputBackground else Color.White
    val googleTextColor = if (isDark) NexoraDarkTextPrimary else NexoraDarkNavy

    val uiState by viewModel.uiState.collectAsState()
    val email by viewModel.email.collectAsState()
    val password by viewModel.password.collectAsState()
    val passwordVisible by viewModel.passwordVisible.collectAsState()
    val rememberMe by viewModel.rememberMe.collectAsState()
    val emailError by viewModel.emailError.collectAsState()
    val passwordError by viewModel.passwordError.collectAsState()

    val focusManager = LocalFocusManager.current
    val scrollState = rememberScrollState()
    val passwordTransformation = remember { PasswordVisualTransformation() }

    LaunchedEffect(uiState) {
        if (uiState is AuthUiState.Success) {
            onLoginSuccess()
        }
    }

    BoxWithConstraints(
        modifier = modifier
            .fillMaxSize()
            .imePadding()
    ) {
        val screenHeight = maxHeight
        val isCompactOrKeyboard = screenHeight < 620.dp

        // 1. DYNAMIC WAVE BACKGROUND (Light / Dark)
        WaveBackground(isDark = isDark, modifier = Modifier.fillMaxSize())

        // 2. ROOT CONTAINER (Floating Card with 12dp side & 22dp bottom margins)
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(horizontal = 12.dp)
                .padding(bottom = 22.dp)
                .verticalScroll(scrollState),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = if (isCompactOrKeyboard) Arrangement.Top else Arrangement.Center
        ) {
            // ==========================================
            // TOP HEADER: Flexible area taking all remaining height
            // Centering logo + title + tagline as ONE group
            // ==========================================
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(
                        top = if (isCompactOrKeyboard) 8.dp else 20.dp,
                        bottom = if (isCompactOrKeyboard) 10.dp else 20.dp
                    ),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    // 1. Logo: 92x92 dp with 24 dp rounded corners
                    Image(
                        painter = painterResource(id = R.drawable.logo),
                        contentDescription = "Nexora Mart Logo",
                        modifier = Modifier
                            .size(92.dp)
                            .clip(RoundedCornerShape(24.dp))
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // 2. Title: 26sp, Medium Weight, letter-spacing 1
                    // "NEXORA" in dark navy (or white in dark mode) & "MART" in orange
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "NEXORA",
                            style = TextStyle(
                                fontSize = 26.sp,
                                fontWeight = FontWeight.Medium,
                                color = textPrimary,
                                letterSpacing = 1.sp
                            )
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "MART",
                            style = TextStyle(
                                fontSize = 26.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = NexoraOrange,
                                letterSpacing = 1.sp
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    // 3. Small tagline under title: 12sp, muted gray
                    Text(
                        text = "Smart Shopping, Delivered Fresh",
                        style = TextStyle(
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Normal,
                            color = textSecondary,
                            letterSpacing = 0.2.sp
                        )
                    )
                }
            }

            // ==========================================
            // LOGIN CARD: Floating White/Dark Card
            // Corner radius: 24 dp, Inner padding: 16 dp
            // ==========================================
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(
                        elevation = 12.dp,
                        shape = RoundedCornerShape(24.dp),
                        ambientColor = cardShadowColor,
                        spotColor = cardShadowColor,
                        clip = false
                    ),
                shape = RoundedCornerShape(24.dp),
                color = cardBackground,
                border = androidx.compose.foundation.BorderStroke(1.dp, cardBorder)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    // 1. Title: "Welcome Back"
                    Text(
                        text = "Welcome Back",
                        style = TextStyle(
                            fontSize = 22.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = textPrimary,
                            letterSpacing = (-0.3).sp
                        )
                    )

                    Spacer(modifier = Modifier.height(2.dp))

                    // 2. Subtitle: "Sign in to continue to Nmart"
                    Text(
                        text = "Sign in to continue to Nmart",
                        style = TextStyle(
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = textSecondary
                        )
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    // Global Error Banner (if API returns error)
                    if (uiState is AuthUiState.Error) {
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 8.dp),
                            shape = RoundedCornerShape(8.dp),
                            color = if (isDark) Color(0xFF3B1818) else Color(0xFFFEF2F2),
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (isDark) Color(0xFF7F1D1D) else Color(0xFFFEE2E2))
                        ) {
                            Text(
                                text = (uiState as AuthUiState.Error).message,
                                color = if (isDark) Color(0xFFFCA5A5) else NexoraErrorRed,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                            )
                        }
                    }

                    // 3. Email Input Field: 44 dp height, 12 dp radius
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp)
                            .background(inputBackground, RoundedCornerShape(12.dp))
                            .border(1.dp, inputBorderColor, RoundedCornerShape(12.dp))
                            .padding(horizontal = 14.dp),
                        contentAlignment = Alignment.CenterStart
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Email,
                                contentDescription = "Email",
                                tint = NexoraOrange,
                                modifier = Modifier.size(19.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            BasicTextField(
                                value = email,
                                onValueChange = { viewModel.onEmailChange(it) },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(
                                    keyboardType = KeyboardType.Email,
                                    imeAction = ImeAction.Next
                                ),
                                keyboardActions = KeyboardActions(
                                    onNext = { focusManager.moveFocus(FocusDirection.Down) }
                                ),
                                textStyle = TextStyle(
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = textPrimary
                                ),
                                cursorBrush = SolidColor(NexoraOrange),
                                modifier = Modifier.weight(1f),
                                decorationBox = { innerTextField ->
                                    Box(contentAlignment = Alignment.CenterStart) {
                                        if (email.isEmpty()) {
                                            Text(
                                                text = "Email address",
                                                style = TextStyle(
                                                    fontSize = 14.sp,
                                                    color = textSecondary,
                                                    fontWeight = FontWeight.Normal
                                                )
                                            )
                                        }
                                        innerTextField()
                                    }
                                }
                            )
                        }
                    }

                    // Validation message or 8dp gap between fields
                    if (emailError != null) {
                        Text(
                            text = emailError ?: "",
                            color = NexoraErrorRed,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(start = 4.dp, top = 2.dp, bottom = 2.dp)
                        )
                    } else {
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    // 4. Password Input Field: 44 dp height, 12 dp radius
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp)
                            .background(inputBackground, RoundedCornerShape(12.dp))
                            .border(1.dp, inputBorderColor, RoundedCornerShape(12.dp))
                            .padding(start = 14.dp, end = 6.dp),
                        contentAlignment = Alignment.CenterStart
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Lock,
                                contentDescription = "Password",
                                tint = NexoraOrange,
                                modifier = Modifier.size(19.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            BasicTextField(
                                value = password,
                                onValueChange = { viewModel.onPasswordChange(it) },
                                singleLine = true,
                                visualTransformation = if (passwordVisible) VisualTransformation.None else passwordTransformation,
                                keyboardOptions = KeyboardOptions(
                                    keyboardType = KeyboardType.Password,
                                    imeAction = ImeAction.Done
                                ),
                                keyboardActions = KeyboardActions(
                                    onDone = {
                                        focusManager.clearFocus()
                                        viewModel.login()
                                    }
                                ),
                                textStyle = TextStyle(
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = textPrimary
                                ),
                                cursorBrush = SolidColor(NexoraOrange),
                                modifier = Modifier.weight(1f),
                                decorationBox = { innerTextField ->
                                    Box(contentAlignment = Alignment.CenterStart) {
                                        if (password.isEmpty()) {
                                            Text(
                                                text = "Password",
                                                style = TextStyle(
                                                    fontSize = 14.sp,
                                                    color = textSecondary,
                                                    fontWeight = FontWeight.Normal
                                                )
                                            )
                                        }
                                        innerTextField()
                                    }
                                }
                            )
                            IconButton(
                                onClick = { viewModel.togglePasswordVisibility() },
                                modifier = Modifier.size(32.dp)
                            ) {
                                Icon(
                                    imageVector = if (passwordVisible) Icons.Outlined.VisibilityOff else Icons.Outlined.Visibility,
                                    contentDescription = if (passwordVisible) "Hide password" else "Show password",
                                    tint = if (passwordVisible) NexoraOrange else textSecondary,
                                    modifier = Modifier.size(19.dp)
                                )
                            }
                        }
                    }

                    if (passwordError != null) {
                        Text(
                            text = passwordError ?: "",
                            color = NexoraErrorRed,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(start = 4.dp, top = 2.dp, bottom = 2.dp)
                        )
                    } else {
                        Spacer(modifier = Modifier.height(6.dp))
                    }

                    // 5. Options Row: "Keep me signed in" & "Forgot Password?"
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null
                            ) {
                                viewModel.onRememberMeChange(!rememberMe)
                            }
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(18.dp)
                                    .background(
                                        color = if (rememberMe) NexoraOrange else inputBackground,
                                        shape = RoundedCornerShape(4.dp)
                                    )
                                    .border(
                                        width = 1.2.dp,
                                        color = if (rememberMe) NexoraOrange else inputBorderColor,
                                        shape = RoundedCornerShape(4.dp)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                if (rememberMe) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Checked",
                                        tint = Color.White,
                                        modifier = Modifier.size(12.dp)
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.width(7.dp))
                            Text(
                                text = "Keep me signed in",
                                style = TextStyle(
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Normal,
                                    color = textSecondary
                                )
                            )
                        }

                        Text(
                            text = "Forgot Password?",
                            style = TextStyle(
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = NexoraOrange
                            ),
                            modifier = Modifier.clickable {
                                onForgotPasswordClick()
                                if (email.isNotBlank()) {
                                    viewModel.forgotPassword(email)
                                }
                            }
                        )
                    }

                    // 12 dp spacing above Log In button
                    Spacer(modifier = Modifier.height(12.dp))

                    // 6. Log In Button: 44 dp height, fully rounded (22 dp radius)
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp)
                            .shadow(
                                elevation = 6.dp,
                                shape = RoundedCornerShape(22.dp),
                                ambientColor = NexoraOrange.copy(alpha = 0.45f),
                                spotColor = NexoraOrange.copy(alpha = 0.45f)
                            )
                            .clip(RoundedCornerShape(22.dp))
                            .background(
                                Brush.horizontalGradient(
                                    listOf(
                                        Color(0xFFFF5F1F),
                                        Color(0xFFFF7A1F),
                                        Color(0xFFFFB62E)
                                    )
                                )
                            )
                            .clickable(enabled = uiState !is AuthUiState.Loading) {
                                focusManager.clearFocus()
                                viewModel.login()
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        if (uiState is AuthUiState.Loading) {
                            CircularProgressIndicator(
                                color = Color.White,
                                modifier = Modifier.size(20.dp),
                                strokeWidth = 2.dp
                            )
                        } else {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Text(
                                    text = "Log In",
                                    style = TextStyle(
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Icon(
                                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                    contentDescription = "Submit",
                                    tint = Color.White,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }

                    // 12 dp spacing below Log In button
                    Spacer(modifier = Modifier.height(12.dp))

                    // 7. Divider: "Or continue with"
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        HorizontalDivider(
                            modifier = Modifier.weight(1f),
                            thickness = 0.8.dp,
                            color = dividerColor
                        )
                        Text(
                            text = "Or continue with",
                            style = TextStyle(
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Normal,
                                color = textSecondary
                            ),
                            modifier = Modifier.padding(horizontal = 10.dp)
                        )
                        HorizontalDivider(
                            modifier = Modifier.weight(1f),
                            thickness = 0.8.dp,
                            color = dividerColor
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // 8. Google Button: 44 dp height, 12 dp radius
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp)
                            .background(googleBackground, RoundedCornerShape(12.dp))
                            .border(1.dp, inputBorderColor, RoundedCornerShape(12.dp))
                            .clip(RoundedCornerShape(12.dp))
                            .clickable {
                                onGoogleSignInClick()
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Image(
                                painter = painterResource(id = R.drawable.ic_google),
                                contentDescription = "Google Logo",
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Continue with Google",
                                style = TextStyle(
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = googleTextColor
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // 9. Sign Up Text: "Don't have an account? Sign Up"
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Don't have an account? ",
                            style = TextStyle(
                                fontSize = 13.sp,
                                color = textSecondary,
                                fontWeight = FontWeight.Normal
                            )
                        )
                        Text(
                            text = "Sign Up",
                            style = TextStyle(
                                fontSize = 13.sp,
                                color = NexoraOrange,
                                fontWeight = FontWeight.SemiBold
                            ),
                            modifier = Modifier.clickable {
                                onNavigateToSignup()
                            }
                        )
                    }
                }
            }
        }

        // ==========================================
        // 5. LIGHT / DARK THEME TOGGLE AT TOP-RIGHT CORNER
        // ==========================================
        Box(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .padding(top = 10.dp, end = 12.dp),
            contentAlignment = Alignment.TopEnd
        ) {
            Surface(
                modifier = Modifier
                    .clip(RoundedCornerShape(9999.dp))
                    .clickable { isDark = !isDark },
                shape = RoundedCornerShape(9999.dp),
                color = if (isDark) Color(0xD9141924) else Color(0xD9FFFFFF),
                border = androidx.compose.foundation.BorderStroke(
                    1.dp,
                    if (isDark) Color(0x59FF7A1A) else Color(0x40FF6A1A)
                ),
                shadowElevation = 4.dp
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(5.dp)
                ) {
                    Icon(
                        imageVector = if (isDark) Icons.Outlined.LightMode else Icons.Outlined.DarkMode,
                        contentDescription = "Toggle Theme",
                        tint = if (isDark) Color(0xFFFFB82E) else Color(0xFFFF6A1A),
                        modifier = Modifier.size(14.dp)
                    )
                    Text(
                        text = if (isDark) "Dark" else "Light",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (isDark) Color(0xFFF8FAFC) else Color(0xFF0B0B2B)
                    )
                }
            }
        }
    }
}
