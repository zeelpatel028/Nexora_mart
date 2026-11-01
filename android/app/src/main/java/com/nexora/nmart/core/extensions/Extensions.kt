package com.nexora.nmart.core.extensions

import java.text.NumberFormat
import java.util.Locale

/**
 * Utility extensions for formatting and string manipulations.
 */

fun Double.toCurrencyFormat(): String {
    val format = NumberFormat.getCurrencyInstance(Locale.US)
    return format.format(this)
}

fun Int.toCommaFormat(): String {
    return NumberFormat.getNumberInstance(Locale.US).format(this)
}

fun String.capitalizeWords(): String {
    return split(" ").joinToString(" ") { word ->
        word.replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.getDefault()) else it.toString() }
    }
}
