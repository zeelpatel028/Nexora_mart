package com.nexora.nmart.ui.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nexora.nmart.ui.components.AppButton
import com.nexora.nmart.ui.components.ButtonVariant
import com.nexora.nmart.ui.theme.EmeraldLight
import com.nexora.nmart.ui.theme.EmeraldSuccess
import com.nexora.nmart.ui.theme.NavyDark
import com.nexora.nmart.ui.theme.PrimaryBlue
import com.nexora.nmart.ui.theme.PrimaryContainer
import com.nexora.nmart.ui.theme.Slate100
import com.nexora.nmart.ui.theme.Slate200
import com.nexora.nmart.ui.theme.Slate50

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier
) {
    val user by viewModel.currentUser.collectAsState()
    val stats by viewModel.stats.collectAsState()
    val isRefreshing by viewModel.isRefreshing.collectAsState()

    val merchantName = user?.displayName ?: "Merchant"
    val storeType = if (stats.categoryName.isNotBlank() && stats.categoryName != "Retail Store") stats.categoryName else (user?.storeType ?: "Standard Retailer")

    androidx.compose.runtime.LaunchedEffect(Unit) {
        viewModel.refreshProfile()
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(20.dp)
            .verticalScroll(rememberScrollState())
    ) {
        // Top Header Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Welcome, $merchantName! 👋",
                        style = MaterialTheme.typography.headlineMedium,
                        color = MaterialTheme.colorScheme.onSurface,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Nexora Mart Control Center • ",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = PrimaryContainer
                        ) {
                            Text(
                                text = storeType,
                                style = MaterialTheme.typography.labelSmall,
                                color = PrimaryBlue,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = { viewModel.refreshProfile() }) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Refresh",
                            tint = if (isRefreshing) PrimaryBlue else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    AppButton(
                        text = "Sign Out",
                        onClick = { viewModel.logout(onLogout) },
                        variant = ButtonVariant.OUTLINE,
                        modifier = Modifier.width(110.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Responsive Metric Cards Grid
        BoxWithConstraints(modifier = Modifier.fillMaxWidth()) {
            val columns = when {
                maxWidth < 600.dp -> 2
                maxWidth < 840.dp -> 2
                else -> 4
            }
            val cardWidth = (maxWidth - (12.dp * (columns - 1))) / columns

            FlowRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                maxItemsInEachRow = columns
            ) {
                StatCard(label = "Total Orders", value = stats.totalOrders, modifier = Modifier.width(cardWidth))
                StatCard(label = "Gross Revenue", value = stats.grossRevenue, modifier = Modifier.width(cardWidth))
                StatCard(label = "Active Products", value = stats.activeProducts, modifier = Modifier.width(cardWidth))
                StatCard(label = "System Health", value = stats.systemHealth, isSuccess = true, modifier = Modifier.width(cardWidth))
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Quick Actions & Redis Status Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Account & Performance Status",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Your session is verified with FastAPI Bearer JWT and accelerated via Redis in-memory cache.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = EmeraldLight
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(EmeraldSuccess)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Redis Cache: Active",
                                style = MaterialTheme.typography.labelSmall,
                                color = EmeraldSuccess,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    AppButton(
                        text = "Manage Store Inventory",
                        onClick = {},
                        variant = ButtonVariant.PRIMARY,
                        modifier = Modifier.weight(1f)
                    )
                    AppButton(
                        text = "View Analytics",
                        onClick = {},
                        variant = ButtonVariant.SECONDARY,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
    }
}

@Composable
private fun StatCard(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
    isSuccess: Boolean = false
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold,
                color = if (isSuccess) EmeraldSuccess else MaterialTheme.colorScheme.onSurface
            )
        }
    }
}
