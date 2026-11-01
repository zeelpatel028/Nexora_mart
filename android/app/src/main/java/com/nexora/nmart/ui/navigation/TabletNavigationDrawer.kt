package com.nexora.nmart.ui.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Storefront
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.NavigationDrawerItemDefaults
import androidx.compose.material3.PermanentDrawerSheet
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.nexora.nmart.navigation.NavigationDestinations
import com.nexora.nmart.ui.theme.NavyDark
import com.nexora.nmart.ui.theme.PrimaryBlue
import com.nexora.nmart.ui.theme.PrimaryContainer
import com.nexora.nmart.ui.theme.Slate100

/**
 * Permanent side navigation drawer for large tablet screens and desktops (> 840dp).
 */
@Composable
fun TabletNavigationDrawer(
    currentRoute: String,
    onNavigateToRoute: (String) -> Unit,
    modifier: Modifier = Modifier,
    merchantName: String? = null,
    storeType: String? = null
) {
    PermanentDrawerSheet(
        modifier = modifier.width(260.dp),
        drawerContainerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxHeight()
                .padding(16.dp)
        ) {
            // Brand Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(vertical = 12.dp, horizontal = 8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Storefront,
                    contentDescription = "NMART Logo",
                    tint = PrimaryBlue,
                    modifier = Modifier.size(32.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Nexora Mart",
                        style = MaterialTheme.typography.titleLarge,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Merchant Portal",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Navigation Items
            NavigationDestinations.items.forEach { destination ->
                val isSelected = currentRoute == destination.route
                NavigationDrawerItem(
                    selected = isSelected,
                    onClick = { onNavigateToRoute(destination.route) },
                    icon = {
                        Icon(
                            imageVector = if (isSelected) destination.selectedIcon else destination.unselectedIcon,
                            contentDescription = destination.title
                        )
                    },
                    label = { Text(text = destination.title, style = MaterialTheme.typography.labelLarge) },
                    shape = RoundedCornerShape(12.dp),
                    colors = NavigationDrawerItemDefaults.colors(
                        selectedContainerColor = PrimaryContainer,
                        selectedIconColor = PrimaryBlue,
                        selectedTextColor = PrimaryBlue,
                        unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                        unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                    ),
                    modifier = Modifier.padding(vertical = 4.dp)
                )
            }

            Spacer(modifier = Modifier.weight(1f))

            // Footer / Active Store Badge
            if (!merchantName.isNullOrBlank()) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(Slate100)
                        .padding(12.dp)
                ) {
                    Text(
                        text = merchantName,
                        style = MaterialTheme.typography.titleMedium,
                        color = NavyDark
                    )
                    Text(
                        text = storeType ?: "Retailer",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}
