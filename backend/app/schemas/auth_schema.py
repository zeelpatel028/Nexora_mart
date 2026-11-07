from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)

class UserRegisterRequest(BaseModel):
    firstName: str = Field(..., min_length=1, max_length=100)
    surname: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=30)
    storeType: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6)

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=4, max_length=10)

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=4, max_length=10)
    newPassword: str = Field(..., min_length=6)

class UpdateProfileRequest(BaseModel):
    firstName: Optional[str] = Field(None, max_length=100)
    surname: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=30)
    currentPassword: Optional[str] = None
    newPassword: Optional[str] = Field(None, min_length=6)

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    firstName: str
    surname: str
    phone: str
    storeType: str
    isActive: bool

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    token: str
    tokenType: str = "bearer"
    user: UserResponse
