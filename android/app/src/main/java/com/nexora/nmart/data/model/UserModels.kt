package com.nexora.nmart.data.model

import com.google.gson.annotations.SerializedName

/**
 * User profile response model matching FastAPI's UserResponse schema:
 * class UserResponse(BaseModel):
 *     id: int
 *     email: str
 *     name: str
 *     firstName: str
 *     surname: str
 *     phone: str
 *     storeType: str
 *     isActive: bool
 */
data class UserResponse(
    @SerializedName("id")
    val id: Int,

    @SerializedName("email")
    val email: String,

    @SerializedName("name")
    val name: String,

    @SerializedName("firstName")
    val firstName: String,

    @SerializedName("surname")
    val surname: String,

    @SerializedName("phone")
    val phone: String,

    @SerializedName("storeType")
    val storeType: String,

    @SerializedName("isActive")
    val isActive: Boolean
) {
    val displayName: String
        get() = name.ifBlank { "$firstName $surname".trim().ifBlank { email.substringBefore("@") } }
}
