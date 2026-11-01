package com.nexora.nmart.core.utils

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ValidationUtilsTest {

    @Test
    fun validEmail_returnsTrue() {
        assertTrue(ValidationUtils.isValidEmail("demo@nmart.com"))
        assertTrue(ValidationUtils.isValidEmail("alex.morgan@store.co"))
        assertTrue(ValidationUtils.isValidEmail("merchant_123@retail.org"))
    }

    @Test
    fun invalidEmail_returnsFalse() {
        assertFalse(ValidationUtils.isValidEmail(""))
        assertFalse(ValidationUtils.isValidEmail("plainaddress"))
        assertFalse(ValidationUtils.isValidEmail("@missingusername.com"))
        assertFalse(ValidationUtils.isValidEmail("user@.com"))
    }

    @Test
    fun loginValidation_withValidInputs_returnsValid() {
        val result = ValidationUtils.validateLogin("demo@nmart.com", "password123")
        assertTrue(result.isValid)
    }

    @Test
    fun loginValidation_withBlankEmail_returnsError() {
        val result = ValidationUtils.validateLogin("", "password123")
        assertFalse(result.isValid)
        assertEquals("email", result.field)
    }

    @Test
    fun loginValidation_withBlankPassword_returnsError() {
        val result = ValidationUtils.validateLogin("demo@nmart.com", "")
        assertFalse(result.isValid)
        assertEquals("password", result.field)
    }

    @Test
    fun registerValidation_withMismatchPassword_returnsError() {
        val result = ValidationUtils.validateRegister(
            firstName = "Alex",
            surname = "Morgan",
            email = "alex@nmart.com",
            phone = "1234567890",
            storeType = "Grocery & Supermarket",
            password = "password123",
            confirmPassword = "password456"
        )
        assertFalse(result.isValid)
        assertEquals("confirmPassword", result.field)
    }

    @Test
    fun registerValidation_withShortPassword_returnsError() {
        val result = ValidationUtils.validateRegister(
            firstName = "Alex",
            surname = "Morgan",
            email = "alex@nmart.com",
            phone = "1234567890",
            storeType = "Grocery & Supermarket",
            password = "123",
            confirmPassword = "123"
        )
        assertFalse(result.isValid)
        assertEquals("password", result.field)
    }

    @Test
    fun registerValidation_withValidInputs_returnsSuccess() {
        val result = ValidationUtils.validateRegister(
            firstName = "Alex",
            surname = "Morgan",
            email = "alex@nmart.com",
            phone = "+1-555-0199",
            storeType = "Grocery & Supermarket",
            password = "password123",
            confirmPassword = "password123"
        )
        assertTrue(result.isValid)
    }
}
