package com.nexora.nmart.ui.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Storefront
import androidx.compose.material.icons.outlined.DarkMode
import androidx.compose.material.icons.outlined.LightMode
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nexora.nmart.R
import com.nexora.nmart.core.constants.AppConstants
import com.nexora.nmart.ui.theme.NexoraDarkBackground
import com.nexora.nmart.ui.theme.NexoraDarkCardBackground
import com.nexora.nmart.ui.theme.NexoraDarkCardBorder
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
 * SignupScreen - Create Account Screen (Android Jetpack Compose)
 * Matched 1:1 to React Web & Requirements:
 * 1. Header: 92x92 dp logo (rounded 24 dp), 26sp title ("NEXORA" in navy & "MART" in orange), 12sp muted tagline.
 *    Logo + title + tagline as ONE group centered vertically & horizontally in flexible area above card.
 * 2. Floating Card: 24 dp radius, 16 dp inner padding, white in light mode (#181E2B in dark mode), 12 dp side margins, 22 dp bottom margin.
 * 3. Exact Spacing: 42-44 dp input fields (12 dp radius), 44 dp button (fully rounded).
 * 4. Responsive & Keyboard friendly: imePadding, moves card up when keyboard opens, shrinks/scrolls header without overlapping fields.
 * 5. Light/Dark theme toggle pill at the top-right corner.
 */
@Composable
fun SignupScreen(
    viewModel: AuthViewModel,
    onNavigateToLogin: () -> Unit,
    onSignupSuccess: () -> Unit,
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

    val uiState by viewModel.uiState.collectAsState()

    var firstName by remember { mutableStateOf("") }
    var surname by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var storeType by remember { mutableStateOf(AppConstants.STORE_TYPES.first()) }
    var isStoreTypeExpanded by remember { mutableStateOf(false) }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var isPasswordVisible by remember { mutableStateOf(false) }
    var isConfirmPasswordVisible by remember { mutableStateOf(false) }

    val focusManager = LocalFocusManager.current
    val scrollState = rememberScrollState()
    val passwordTransformation = remember { PasswordVisualTransformation() }

    LaunchedEffect(uiState) {
        if (uiState is AuthUiState.Success) {
            onSignupSuccess()
        }
    }

    BoxWithConstraints(
        modifier = modifier
            .fillMaxSize()
            .imePadding()
    ) {
        val screenHeight = maxHeight
        val isCompactOrKeyboard = screenHeight < 640.dp

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
                        top = if (isCompactOrKeyboard) 8.dp else 16.dp,
                        bottom = if (isCompactOrKeyboard) 10.dp else 16.dp
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
            // CREATE ACCOUNT CARD: Floating White/Dark Card
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
                    // Heading: "Create Account"
                    Text(
                        text = "Create Account",
                        style = TextStyle(
                            fontSize = 22.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = textPrimary,
                            letterSpacing = (-0.3).sp
                        )
                    )

                    Spacer(modifier = Modifier.height(2.dp))

                    // Subtitle
                    Text(
                        text = "Sign up to continue to Nmart",
                        style = TextStyle(
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = textSecondary
                        )
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Error Banner
                    if (uiState is AuthUiState.Error) {
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 6.dp),
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

                    // ROW 1: Name Fields (First Name & Surname, 2 columns)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // First Name
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(42.dp)
                                .background(inputBackground, RoundedCornerShape(12.dp))
                                .border(1.dp, inputBorderColor, RoundedCornerShape(12.dp))
                                .padding(horizontal = 10.dp),
                            contentAlignment = Alignment.CenterStart
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = "First Name",
                                    tint = NexoraOrange,
                                    modifier = Modifier.size(17.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                BasicTextField(
                                    value = firstName,
                                    onValueChange = { firstName = it },
                                    singleLine = true,
                                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                                    keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Right) }),
                                    textStyle = TextStyle(fontSize = 13.sp, fontWeight = FontWeight.Medium, color = textPrimary),
                                    cursorBrush = SolidColor(NexoraOrange),
                                    modifier = Modifier.weight(1f),
                                    decorationBox = { inner ->
                                        Box(contentAlignment = Alignment.CenterStart) {
                                            if (firstName.isEmpty()) {
                                                Text("First name", style = TextStyle(fontSize = 13.sp, color = textSecondary))
                                            }
                                            inner()
                                        }
                                    }
                                )
                            }
                        }

                        // Surname
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(42.dp)
                                .background(inputBackground, RoundedCornerShape(12.dp))
                                .border(1.dp, inputBorderColor, RoundedCornerShape(12.dp))
                                .padding(horizontal = 10.dp),
                            contentAlignment = Alignment.CenterStart
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = "Surname",
                                    tint = NexoraOrange,
                                    modifier = Modifier.size(17.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                BasicTextField(
                                    value = surname,
                                    onValueChange = { surname = it },
                                    singleLine = true,
                                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                                    keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) }),
                                    textStyle = TextStyle(fontSize = 13.sp, fontWeight = FontWeight.Medium, color = textPrimary),
                                    cursorBrush = SolidColor(NexoraOrange),
                                    modifier = Modifier.weight(1f),
                                    decorationBox = { inner ->
                                        Box(contentAlignment = Alignment.CenterStart) {
                                            if (surname.isEmpty()) {
                                                Text("Surname", style = TextStyle(fontSize = 13.sp, color = textSecondary))
                                            }
                                            inner()
                                        }
                                    }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(7.dp))

                    // ROW 2: Contact Fields (Email & Phone, 2 columns)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Email Address
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(42.dp)
                                .background(inputBackground, RoundedCornerShape(12.dp))
                                .border(1.dp, inputBorderColor, RoundedCornerShape(12.dp))
                                .padding(horizontal = 10.dp),
                            contentAlignment = Alignment.CenterStart
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Email,
                                    contentDescription = "Email",
                                    tint = NexoraOrange,
                                    modifier = Modifier.size(17.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                BasicTextField(
                                    value = email,
                                    onValueChange = { email = it },
                                    singleLine = true,
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                                    keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Right) }),
                                    textStyle = TextStyle(fontSize = 13.sp, fontWeight = FontWeight.Medium, color = textPrimary),
                                    cursorBrush = SolidColor(NexoraOrange),
                                    modifier = Modifier.weight(1f),
                                    decorationBox = { inner ->
                                        Box(contentAlignment = Alignment.CenterStart) {
                                            if (email.isEmpty()) {
                                                Text("Email address", style = TextStyle(fontSize = 13.sp, color = textSecondary))
                                            }
                                            inner()
                                        }
                                    }
                                )
                            }
                        }

                        // Phone Number
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(42.dp)
                                .background(inputBackground, RoundedCornerShape(12.dp))
                                .border(1.dp, inputBorderColor, RoundedCornerShape(12.dp))
                                .padding(horizontal = 10.dp),
                            contentAlignment = Alignment.CenterStart
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Phone,
                                    contentDescription = "Phone",
                                    tint = NexoraOrange,
                                    modifier = Modifier.size(17.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                BasicTextField(
                                    value = phone,
                                    onValueChange = { phone = it },
                                    singleLine = true,
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone, imeAction = ImeAction.Next),
                                    keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Down) }),
                                    textStyle = TextStyle(fontSize = 13.sp, fontWeight = FontWeight.Medium, color = textPrimary),
                                    cursorBrush = SolidColor(NexoraOrange),
                                    modifier = Modifier.weight(1f),
                                    decorationBox = { inner ->
                                        Box(contentAlignment = Alignment.CenterStart) {
                                            if (phone.isEmpty()) {
                                                Text("Phone number", style = TextStyle(fontSize = 13.sp, color = textSecondary))
                                            }
                                            inner()
                                        }
                                    }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(7.dp))

                    // ROW 3: Store Type Dropdown (Full Width, 1 Column)
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(42.dp)
                            .background(inputBackground, RoundedCornerShape(12.dp))
                            .border(1.dp, inputBorderColor, RoundedCornerShape(12.dp))
                            .clickable { isStoreTypeExpanded = true }
                            .padding(horizontal = 10.dp),
                        contentAlignment = Alignment.CenterStart
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(
                                imageVector = Icons.Default.Storefront,
                                contentDescription = "Store Type",
                                tint = NexoraOrange,
                                modifier = Modifier.size(17.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = storeType,
                                style = TextStyle(
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = textPrimary
                                ),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                                modifier = Modifier.weight(1f)
                            )
                            Icon(
                                imageVector = Icons.Default.ArrowDropDown,
                                contentDescription = "Select",
                                tint = textSecondary,
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        DropdownMenu(
                            expanded = isStoreTypeExpanded,
                            onDismissRequest = { isStoreTypeExpanded = false }
                        ) {
                            AppConstants.STORE_TYPES.forEach { type ->
                                DropdownMenuItem(
                                    text = { Text(type, style = TextStyle(fontSize = 13.sp, color = textPrimary)) },
                                    onClick = {
                                        storeType = type
                                        isStoreTypeExpanded = false
                                    }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(7.dp))

                    // ROW 4: Password & Confirm Password (2 columns with visibility toggles)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Password
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(42.dp)
                                .background(inputBackground, RoundedCornerShape(12.dp))
                                .border(1.dp, inputBorderColor, RoundedCornerShape(12.dp))
                                .padding(start = 10.dp, end = 2.dp),
                            contentAlignment = Alignment.CenterStart
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Lock,
                                    contentDescription = "Password",
                                    tint = NexoraOrange,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(5.dp))
                                BasicTextField(
                                    value = password,
                                    onValueChange = { password = it },
                                    singleLine = true,
                                    visualTransformation = if (isPasswordVisible) VisualTransformation.None else passwordTransformation,
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Next),
                                    keyboardActions = KeyboardActions(onNext = { focusManager.moveFocus(FocusDirection.Right) }),
                                    textStyle = TextStyle(fontSize = 13.sp, fontWeight = FontWeight.Medium, color = textPrimary),
                                    cursorBrush = SolidColor(NexoraOrange),
                                    modifier = Modifier.weight(1f),
                                    decorationBox = { inner ->
                                        Box(contentAlignment = Alignment.CenterStart) {
                                            if (password.isEmpty()) {
                                                Text("Password", style = TextStyle(fontSize = 13.sp, color = textSecondary))
                                            }
                                            inner()
                                        }
                                    }
                                )
                                IconButton(
                                    onClick = { isPasswordVisible = !isPasswordVisible },
                                    modifier = Modifier.size(26.dp)
                                ) {
                                    Icon(
                                        imageVector = if (isPasswordVisible) Icons.Outlined.VisibilityOff else Icons.Outlined.Visibility,
                                        contentDescription = "Toggle Password",
                                        tint = if (isPasswordVisible) NexoraOrange else textSecondary,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }

                        // Confirm Password
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(42.dp)
                                .background(inputBackground, RoundedCornerShape(12.dp))
                                .border(1.dp, inputBorderColor, RoundedCornerShape(12.dp))
                                .padding(start = 10.dp, end = 2.dp),
                            contentAlignment = Alignment.CenterStart
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Lock,
                                    contentDescription = "Confirm Password",
                                    tint = NexoraOrange,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(5.dp))
                                BasicTextField(
                                    value = confirmPassword,
                                    onValueChange = { confirmPassword = it },
                                    singleLine = true,
                                    visualTransformation = if (isConfirmPasswordVisible) VisualTransformation.None else passwordTransformation,
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
                                    keyboardActions = KeyboardActions(onDone = {
                                        focusManager.clearFocus()
                                        viewModel.register(
                                            firstName = firstName,
                                            surname = surname,
                                            email = email,
                                            phone = phone,
                                            storeType = storeType,
                                            password = password,
                                            confirmPassword = confirmPassword
                                        )
                                    }),
                                    textStyle = TextStyle(fontSize = 13.sp, fontWeight = FontWeight.Medium, color = textPrimary),
                                    cursorBrush = SolidColor(NexoraOrange),
                                    modifier = Modifier.weight(1f),
                                    decorationBox = { inner ->
                                        Box(contentAlignment = Alignment.CenterStart) {
                                            if (confirmPassword.isEmpty()) {
                                                Text("Confirm", style = TextStyle(fontSize = 13.sp, color = textSecondary))
                                            }
                                            inner()
                                        }
                                    }
                                )
                                IconButton(
                                    onClick = { isConfirmPasswordVisible = !isConfirmPasswordVisible },
                                    modifier = Modifier.size(26.dp)
                                ) {
                                    Icon(
                                        imageVector = if (isConfirmPasswordVisible) Icons.Outlined.VisibilityOff else Icons.Outlined.Visibility,
                                        contentDescription = "Toggle Confirm Password",
                                        tint = if (isConfirmPasswordVisible) NexoraOrange else textSecondary,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Primary Button: Gradient Pill "Create Account ->" (44dp height)
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
                                    listOf(Color(0xFFFF5F1F), Color(0xFFFF7A1F), Color(0xFFFFB62E))
                                )
                            )
                            .clickable(enabled = uiState !is AuthUiState.Loading) {
                                focusManager.clearFocus()
                                viewModel.register(
                                    firstName = firstName,
                                    surname = surname,
                                    email = email,
                                    phone = phone,
                                    storeType = storeType,
                                    password = password,
                                    confirmPassword = confirmPassword
                                )
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
                                    text = "Create Account",
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

                    Spacer(modifier = Modifier.height(10.dp))

                    // Footer: "Already have an account? Log In"
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Already have an account? ",
                            style = TextStyle(
                                fontSize = 13.sp,
                                color = textSecondary,
                                fontWeight = FontWeight.Normal
                            )
                        )
                        Text(
                            text = "Log In",
                            style = TextStyle(
                                fontSize = 13.sp,
                                color = NexoraOrange,
                                fontWeight = FontWeight.SemiBold
                            ),
                            modifier = Modifier.clickable {
                                onNavigateToLogin()
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
