package com.nexora.nmart.ui.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nexora.nmart.data.model.UserResponse
import com.nexora.nmart.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ProfileViewModel(
    private val repository: AuthRepository
) : ViewModel() {

    val currentUser: StateFlow<UserResponse?> = repository.currentUser

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing.asStateFlow()

    fun refreshProfile() {
        viewModelScope.launch {
            _isRefreshing.value = true
            repository.fetchProfile()
            _isRefreshing.value = false
        }
    }

    fun logout(onLoggedOut: () -> Unit) {
        viewModelScope.launch {
            repository.logout()
            onLoggedOut()
        }
    }
}
