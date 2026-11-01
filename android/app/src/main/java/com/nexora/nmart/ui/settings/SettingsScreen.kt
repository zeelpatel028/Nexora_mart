package com.nexora.nmart.ui.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Dns
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nexora.nmart.core.config.AppConfig
import com.nexora.nmart.di.ServiceLocator
import com.nexora.nmart.network.NetworkResult
import com.nexora.nmart.ui.components.AppButton
import com.nexora.nmart.ui.components.AppTextField
import com.nexora.nmart.ui.components.ButtonVariant
import com.nexora.nmart.ui.theme.EmeraldLight
import com.nexora.nmart.ui.theme.EmeraldSuccess
import com.nexora.nmart.ui.theme.PrimaryBlue
import com.nexora.nmart.ui.theme.RedError
import com.nexora.nmart.ui.theme.RedErrorSubtle
import kotlinx.coroutines.launch

@Composable
fun SettingsScreen(
    modifier: Modifier = Modifier
) {
    var selectedEnv by remember { mutableStateOf(AppConfig.getEnvironment()) }
    var currentBaseUrl by remember { mutableStateOf(AppConfig.getBaseUrl()) }
    var customUrlInput by remember { mutableStateOf(if (selectedEnv == AppConfig.Environment.CUSTOM) currentBaseUrl else "") }
    var healthStatusMessage by remember { mutableStateOf<String?>(null) }
    var isCheckingHealth by remember { mutableStateOf(false) }
    var isHealthSuccess by remember { mutableStateOf(false) }

    val coroutineScope = rememberCoroutineScope()

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(20.dp),
        contentAlignment = Alignment.TopCenter
    ) {
        Column(
            modifier = Modifier
                .widthIn(max = 640.dp)
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
        ) {
            Text(
                text = "Application Settings",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Text(
                text = "Configure API endpoints, backend connectivity, and device networking",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 4.dp, bottom = 20.dp)
            )

            // API Endpoint Server Selector Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Dns,
                            contentDescription = null,
                            tint = PrimaryBlue
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Backend Server Environment",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    AppConfig.Environment.values().forEach { env ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                        ) {
                            RadioButton(
                                selected = selectedEnv == env,
                                onClick = {
                                    selectedEnv = env
                                    if (env != AppConfig.Environment.CUSTOM) {
                                        AppConfig.setEnvironment(env)
                                        currentBaseUrl = AppConfig.getBaseUrl()
                                        ServiceLocator.apiClient.refreshClient()
                                    }
                                },
                                colors = RadioButtonDefaults.colors(selectedColor = PrimaryBlue)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Column {
                                Text(
                                    text = env.displayName,
                                    style = MaterialTheme.typography.bodyLarge,
                                    fontWeight = FontWeight.SemiBold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                if (env.defaultApiUrl.isNotBlank()) {
                                    Text(
                                        text = "API: ${env.defaultApiUrl}",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }

                    if (selectedEnv == AppConfig.Environment.CUSTOM) {
                        Spacer(modifier = Modifier.height(12.dp))
                        AppTextField(
                            value = customUrlInput,
                            onValueChange = { customUrlInput = it },
                            label = "Custom Server Base URL",
                            placeholder = "http://192.168.1.100:8000/api/"
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        AppButton(
                            text = "Save Custom URL",
                            onClick = {
                                AppConfig.setEnvironment(AppConfig.Environment.CUSTOM, customUrlInput)
                                currentBaseUrl = AppConfig.getBaseUrl()
                                ServiceLocator.apiClient.refreshClient()
                            },
                            variant = ButtonVariant.PRIMARY
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                    Spacer(modifier = Modifier.height(16.dp))

                    // Active URL Display & Connection Test
                    Text(
                        text = "Current Active Base URL: $currentBaseUrl",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    AppButton(
                        text = "Test FastAPI Connection (/health)",
                        onClick = {
                            isCheckingHealth = true
                            healthStatusMessage = null
                            coroutineScope.launch {
                                val result = ServiceLocator.authRepository.checkHealth()
                                isCheckingHealth = false
                                when (result) {
                                    is NetworkResult.Success -> {
                                        isHealthSuccess = true
                                        healthStatusMessage = "Backend connected successfully! Status: ${result.data["status"] ?: "healthy"}"
                                    }
                                    is NetworkResult.Error -> {
                                        isHealthSuccess = false
                                        healthStatusMessage = "Connection failed: ${result.message}"
                                    }
                                    else -> {}
                                }
                            }
                        },
                        isLoading = isCheckingHealth,
                        variant = ButtonVariant.OUTLINE
                    )

                    if (!healthStatusMessage.isNullOrBlank()) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isHealthSuccess) EmeraldLight else RedErrorSubtle)
                                .padding(12.dp)
                        ) {
                            Text(
                                text = healthStatusMessage!!,
                                style = MaterialTheme.typography.bodyMedium,
                                color = if (isHealthSuccess) EmeraldSuccess else RedError,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Information & Guidelines Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = null,
                            tint = PrimaryBlue
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Android Networking Notes",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "• On an Android Studio Emulator, the host machine running FastAPI is reached at http://10.0.2.2:8000/api/\n" +
                               "• On physical Android devices connected to your Wi-Fi network, select 'Custom Local IP' and enter your computer's local Wi-Fi IP (e.g. http://192.168.x.x:8000/api/).\n" +
                               "• The backend database (SQLite/PostgreSQL) and Redis in-memory cache remain shared identically across website and mobile clients.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        lineHeight = MaterialTheme.typography.bodyMedium.lineHeight
                    )
                }
            }
        }
    }
}
