package com.nexora.nmart.network

import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import retrofit2.Response

/**
 * Sealed class hierarchy representing network states, results, and FastAPI error structures.
 */
sealed class NetworkResult<out T> {
    data class Success<out T>(val data: T) : NetworkResult<T>()
    data class Error(val message: String, val code: Int? = null) : NetworkResult<Nothing>()
    object Loading : NetworkResult<Nothing>()

    companion object {
        private val gson = Gson()

        /**
         * Parses FastAPI error responses (single string detail or array of validation errors).
         */
        fun <T> parseError(response: Response<T>): Error {
            val code = response.code()
            val errorBody = response.errorBody()?.string()

            if (errorBody.isNullOrBlank()) {
                val defaultMsg = when (code) {
                    401 -> "Invalid credentials or unauthorized session."
                    403 -> "Access forbidden."
                    404 -> "Requested endpoint not found."
                    500 -> "Internal server error. Please try again later."
                    else -> "Network request failed with status $code."
                }
                return Error(message = defaultMsg, code = code)
            }

            try {
                val json = gson.fromJson(errorBody, JsonObject::class.java)
                if (json.has("detail")) {
                    val detail = json.get("detail")
                    if (detail.isJsonPrimitive) {
                        return Error(message = detail.asString, code = code)
                    } else if (detail.isJsonArray) {
                        val array = detail.asJsonArray
                        val messages = mutableListOf<String>()
                        for (element in array) {
                            if (element.isJsonObject) {
                                val obj = element.asJsonObject
                                val msg = obj.get("msg")?.asString ?: obj.toString()
                                messages.add(msg)
                            }
                        }
                        if (messages.isNotEmpty()) {
                            return Error(message = messages.joinToString("; "), code = code)
                        }
                    }
                }
                if (json.has("message")) {
                    return Error(message = json.get("message").asString, code = code)
                }
            } catch (_: Exception) {
                // Not a valid JSON payload, return raw string or default
            }

            return Error(message = errorBody.take(150), code = code)
        }
    }
}
