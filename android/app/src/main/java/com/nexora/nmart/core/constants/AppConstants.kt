package com.nexora.nmart.core.constants

/**
 * Application constants mirroring frontend options and validation bounds.
 */
object AppConstants {
    const val APP_NAME = "Nexora Mart"
    const val PREFS_KEY_TOKEN = "nmart_auth_token"
    const val PREFS_KEY_USER = "nmart_auth_user"

    // Demo merchant credentials for quick fill
    const val DEMO_EMAIL = "demo@nmart.com"
    const val DEMO_PASSWORD = "password123"

    // 10 Supported store categories mirroring backend and frontend
    val STORE_TYPES = listOf(
        "Grocery Store",
        "Supermarket",
        "Medical Store",
        "Clothing Store",
        "Electronics Store",
        "Mobile Accessories",
        "Hardware Store",
        "Stationery Store",
        "Footwear Store",
        "Vegetable & Fruit Shop"
    )
}
