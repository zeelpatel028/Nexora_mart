package com.nexora.nmart.ui.navigation

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Storefront
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.NavigationRailItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.nexora.nmart.navigation.NavigationDestinations
import com.nexora.nmart.ui.theme.PrimaryBlue
import com.nexora.nmart.ui.theme.PrimaryContainer

/**
 * Side Navigation Rail for Medium width tablet devices (600dp - 840dp).
 */
@Composable
fun TabletNavigationRail(
    currentRoute: String,
    onNavigateToRoute: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    NavigationRail(
        modifier = modifier,
        containerColor = MaterialTheme.colorScheme.surface,
        header = {
            Icon(
                imageVector = Icons.Default.Storefront,
                contentDescription = "Nexora Mart Logo",
                tint = PrimaryBlue,
                modifier = Modifier
                    .size(36.dp)
                    .padding(top = 16.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
    ) {
        NavigationDestinations.items.forEach { destination ->
            val isSelected = currentRoute == destination.route
            NavigationRailItem(
                selected = isSelected,
                onClick = { onNavigateToRoute(destination.route) },
                icon = {
                    Icon(
                        imageVector = if (isSelected) destination.selectedIcon else destination.unselectedIcon,
                        contentDescription = destination.title
                    )
                },
                label = { Text(text = destination.title) },
                colors = NavigationRailItemDefaults.colors(
                    selectedIconColor = PrimaryBlue,
                    selectedTextColor = PrimaryBlue,
                    indicatorColor = PrimaryContainer,
                    unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                    unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                )
            )
        }
    }
}
