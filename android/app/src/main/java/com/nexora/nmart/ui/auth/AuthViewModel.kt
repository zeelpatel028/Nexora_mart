package com.nexora.nmart.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nexora.nmart.core.utils.ValidationUtils
import com.nexora.nmart.data.model.LoginRequest
import com.nexora.nmart.data.model.RegisterRequest
import com.nexora.nmart.data.model.UserResponse
import com.nexora.nmart.data.repository.AuthRepository
import com.nexora.nmart.network.NetworkResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface AuthUiState {
    object Idle : AuthUiState
    object Loading : AuthUiState
    data class Success(val user: UserResponse) : AuthUiState
    data class Error(val message: String) : AuthUiState
}

open class AuthViewModel(
    private val repository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    private val _forgotPasswordMessage = MutableStateFlow<String?>(null)
    val forgotPasswordMessage: StateFlow<String?> = _forgotPasswordMessage.asStateFlow()

    // Form States
    private val _email = MutableStateFlow("")
    val email: StateFlow<String> = _email.asStateFlow()

    private val _password = MutableStateFlow("")
    val password: StateFlow<String> = _password.asStateFlow()

    private val _passwordVisible = MutableStateFlow(false)
    val passwordVisible: StateFlow<Boolean> = _passwordVisible.asStateFlow()

    private val _rememberMe = MutableStateFlow(true)
    val rememberMe: StateFlow<Boolean> = _rememberMe.asStateFlow()

    // Field-specific validation errors
    private val _emailError = MutableStateFlow<String?>(null)
    val emailError: StateFlow<String?> = _emailError.asStateFlow()

    private val _passwordError = MutableStateFlow<String?>(null)
    val passwordError: StateFlow<String?> = _passwordError.asStateFlow()

    fun onEmailChange(newEmail: String) {
        _email.value = newEmail
        if (_emailError.value != null) _emailError.value = null
    }

    fun onPasswordChange(newPassword: String) {
        _password.value = newPassword
        if (_passwordError.value != null) _passwordError.value = null
    }

    fun togglePasswordVisibility() {
        _passwordVisible.value = !_passwordVisible.value
    }

    fun onRememberMeChange(checked: Boolean) {
        _rememberMe.value = checked
    }

    fun validateLoginForm(): Boolean {
        var isValid = true
        val currentEmail = _email.value.trim()
        val currentPassword = _password.value

        if (currentEmail.isBlank() || !ValidationUtils.isValidEmail(currentEmail)) {
            _emailError.value = "Please enter a valid email address"
            isValid = false
        } else {
            _emailError.value = null
        }

        if (currentPassword.isBlank()) {
            _passwordError.value = "Please enter your password"
            isValid = false
        } else {
            _passwordError.value = null
        }

        return isValid
    }

    fun resetState() {
        _uiState.value = AuthUiState.Idle
        _forgotPasswordMessage.value = null
        _emailError.value = null
        _passwordError.value = null
    }

    /**
     * Authenticates merchant with email and password via FastAPI.
     */
    fun login(emailParam: String? = null, passwordParam: String? = null) {
        val targetEmail = emailParam ?: _email.value
        val targetPassword = passwordParam ?: _password.value

        if (!validateLoginForm()) {
            return
        }

        _uiState.value = AuthUiState.Loading
        viewModelScope.launch {
            val result = repository.login(
                LoginRequest(
                    email = targetEmail.trim().lowercase(),
                    password = targetPassword
                )
            )
            when (result) {
                is NetworkResult.Success -> {
                    _uiState.value = AuthUiState.Success(result.data.user)
                }
                is NetworkResult.Error -> {
                    _uiState.value = AuthUiState.Error(result.message)
                }
                is NetworkResult.Loading -> {
                    _uiState.value = AuthUiState.Loading
                }
            }
        }
    }

    /**
     * Registers a new merchant account via FastAPI.
     */
    fun register(
        firstName: String,
        surname: String,
        email: String,
        phone: String,
        storeType: String,
        password: String,
        confirmPassword: String
    ) {
        val validation = ValidationUtils.validateRegister(
            firstName = firstName,
            surname = surname,
            email = email,
            phone = phone,
            storeType = storeType,
            password = password,
            confirmPassword = confirmPassword
        )
        if (!validation.isValid) {
            _uiState.value = AuthUiState.Error(validation.message)
            return
        }

        _uiState.value = AuthUiState.Loading
        viewModelScope.launch {
            val result = repository.register(
                RegisterRequest(
                    firstName = firstName.trim(),
                    surname = surname.trim(),
                    email = email.trim().lowercase(),
                    phone = phone.trim(),
                    storeType = storeType.trim(),
                    password = password
                )
            )
            when (result) {
                is NetworkResult.Success -> {
                    _uiState.value = AuthUiState.Success(result.data.user)
                }
                is NetworkResult.Error -> {
                    _uiState.value = AuthUiState.Error(result.message)
                }
                is NetworkResult.Loading -> {
                    _uiState.value = AuthUiState.Loading
                }
            }
        }
    }

    /**
     * Dispatches password reset instructions via FastAPI.
     */
    fun forgotPassword(email: String) {
        if (!ValidationUtils.isValidEmail(email)) {
            _forgotPasswordMessage.value = "Please enter a valid email address."
            return
        }

        viewModelScope.launch {
            val result = repository.forgotPassword(email)
            when (result) {
                is NetworkResult.Success -> {
                    _forgotPasswordMessage.value = result.data.message ?: "Password reset instructions sent to your email."
                }
                is NetworkResult.Error -> {
                    _forgotPasswordMessage.value = result.message
                }
                else -> {}
            }
        }
    }
}

/**
 * Typealias providing LoginViewModel compatibility as specified in Step 6
 */
typealias LoginViewModel = AuthViewModel
