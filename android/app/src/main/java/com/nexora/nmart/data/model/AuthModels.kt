package com.nexora.nmart.data.model

import com.google.gson.annotations.SerializedName

/**
 * Authentication request and response models matching FastAPI schemas.
 */

data class LoginRequest(
    @SerializedName("email")
    val email: String,

    @SerializedName("password")
    val password: String
)

data class RegisterRequest(
    @SerializedName("firstName")
    val firstName: String,

    @SerializedName("surname")
    val surname: String,

    @SerializedName("email")
    val email: String,

    @SerializedName("phone")
    val phone: String,

    @SerializedName("storeType")
    val storeType: String,

    @SerializedName("password")
    val password: String
)

data class ForgotPasswordRequest(
    @SerializedName("email")
    val email: String
)

data class TokenResponse(
    @SerializedName("token")
    val token: String,

    @SerializedName("tokenType")
    val tokenType: String = "bearer",

    @SerializedName("user")
    val user: UserResponse
)

data class ApiMessageResponse(
    @SerializedName("message")
    val message: String? = null,

    @SerializedName("detail")
    val detail: Any? = null,

    @SerializedName("success")
    val success: Boolean? = true
)
