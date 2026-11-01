package com.nexora.nmart.core.utils

import android.util.Patterns

/**
 * Validation utilities matching frontend and FastAPI validation schemas.
 */
object ValidationUtils {

    fun isValidEmail(email: String): Boolean {
        if (email.isBlank()) return false
        val trimmed = email.trim()
        val emailRegex = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$".toRegex()
        return emailRegex.matches(trimmed)
    }

    fun validateLogin(email: String, password: String): ValidationResult {
        if (email.isBlank()) {
            return ValidationResult(isValid = false, message = "Please enter your email address", field = "email")
        }
        if (!isValidEmail(email)) {
            return ValidationResult(isValid = false, message = "Please enter a valid email address", field = "email")
        }
        if (password.isBlank()) {
            return ValidationResult(isValid = false, message = "Please enter your password", field = "password")
        }
        return ValidationResult(isValid = true)
    }

    fun validateRegister(
        firstName: String,
        surname: String,
        email: String,
        phone: String,
        storeType: String,
        password: String,
        confirmPassword: String
    ): ValidationResult {
        if (firstName.trim().isBlank()) {
            return ValidationResult(isValid = false, message = "Please enter your first name", field = "firstName")
        }
        if (surname.trim().isBlank()) {
            return ValidationResult(isValid = false, message = "Please enter your surname", field = "surname")
        }
        if (email.trim().isBlank()) {
            return ValidationResult(isValid = false, message = "Please enter your email address", field = "email")
        }
        if (!isValidEmail(email)) {
            return ValidationResult(isValid = false, message = "Please enter a valid email address", field = "email")
        }
        if (phone.trim().isBlank()) {
            return ValidationResult(isValid = false, message = "Please enter your phone number", field = "phone")
        }
        if (phone.trim().length < 5) {
            return ValidationResult(isValid = false, message = "Phone number must be at least 5 digits", field = "phone")
        }
        if (storeType.trim().isBlank()) {
            return ValidationResult(isValid = false, message = "Please select your store type", field = "storeType")
        }
        if (password.isBlank()) {
            return ValidationResult(isValid = false, message = "Please enter a password", field = "password")
        }
        if (password.length < 6) {
            return ValidationResult(isValid = false, message = "Password must be at least 6 characters", field = "password")
        }
        if (password != confirmPassword) {
            return ValidationResult(isValid = false, message = "Passwords do not match", field = "confirmPassword")
        }
        return ValidationResult(isValid = true)
    }
}

data class ValidationResult(
    val isValid: Boolean,
    val message: String = "",
    val field: String? = null
)
