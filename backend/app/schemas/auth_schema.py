from typing import Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field

class StoreTypeSummary(BaseModel):
    id: int
    code: str
    name: str

    class Config:
        from_attributes = True

class StoreSummary(BaseModel):
    id: int
    name: str
    code: Optional[str] = None
    store_type: Optional[StoreTypeSummary] = None

    class Config:
        from_attributes = True

class UserLoginRequest(BaseModel):
    email: str = Field(..., min_length=1, description="Email, phone or username")
    password: str = Field(..., min_length=1)

class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., min_length=1, description="Cryptographic refresh token")

class UserRegisterRequest(BaseModel):
    name: Optional[str] = Field(None, max_length=150)
    firstName: Optional[str] = Field(None, max_length=100)
    surname: Optional[str] = Field(None, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=30)
    store_type_id: Optional[int] = None
    store_type_code: Optional[str] = None
    storeType: Optional[str] = None
    store_name: Optional[str] = None
    password: str = Field(..., min_length=6)

class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., min_length=1, description="Username or email")

class VerifyOtpRequest(BaseModel):
    email: str = Field(..., min_length=1)
    otp: str = Field(..., min_length=4, max_length=10)

class ResetPasswordRequest(BaseModel):
    email: str = Field(..., min_length=1)
    otp: str = Field(..., min_length=4, max_length=10)
    newPassword: str = Field(..., min_length=6)

class UpdateProfileRequest(BaseModel):
    firstName: Optional[str] = Field(None, max_length=100)
    surname: Optional[str] = Field(None, max_length=100)
    name: Optional[str] = Field(None, max_length=150)
    phone: Optional[str] = Field(None, max_length=30)
    currentPassword: Optional[str] = None
    newPassword: Optional[str] = Field(None, min_length=6)

class SafeUser(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    firstName: Optional[str] = ""
    surname: Optional[str] = ""
    phone: Optional[str] = ""
    storeType: Optional[str] = ""
    isActive: bool = True
    user: Optional[SafeUser] = None
    store: Optional[StoreSummary] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token: Optional[str] = None
    refresh_token: Optional[str] = None
    tokenType: str = "bearer"
    token_type: str = "bearer"
    expires_in: int = 900
    user: UserResponse
    store: Optional[StoreSummary] = None
