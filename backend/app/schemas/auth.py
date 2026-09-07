"""
app/schemas/auth.py
────────────────────
Pydantic v2 schemas for authentication endpoints.

Why Pydantic schemas separate from SQLAlchemy models?
  - Models = DB shape (what's stored)
  - Schemas = API shape (what's sent/received)
  - Separation = you never accidentally expose password_hash in a response
"""

import re
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator, model_validator


# ─────────────────────────────────────────────────────────────────
#  Shared validators
# ─────────────────────────────────────────────────────────────────

def validate_password_strength(password: str) -> str:
    if len(password) < 8:
        raise ValueError('Password must be at least 8 characters.')
    if not re.search(r'[A-Z]', password):
        raise ValueError('Password must contain at least one uppercase letter.')
    if not re.search(r'[0-9]', password):
        raise ValueError('Password must contain at least one digit.')
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        raise ValueError('Password must contain at least one special character.')
    return password


# ─────────────────────────────────────────────────────────────────
#  Register
# ─────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    first_name:       str
    last_name:        str
    email:            EmailStr
    password:         str
    confirm_password: str
    company_name:     Optional[str] = None   # creates a new company if provided

    @field_validator('password')
    @classmethod
    def strong_password(cls, v):
        return validate_password_strength(v)

    @model_validator(mode='after')
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError('Passwords do not match.')
        return self


class RegisterResponse(BaseModel):
    id:         str
    email:      str
    full_name:  str
    message:    str = 'Registration successful. Please check your email to verify your account.'


# ─────────────────────────────────────────────────────────────────
#  Login
# ─────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token:  str
    refresh_token: str
    token_type:    str = 'bearer'
    expires_in:    int    # seconds


class LoginResponse(BaseModel):
    user:   dict
    tokens: TokenResponse


# ─────────────────────────────────────────────────────────────────
#  Token refresh
# ─────────────────────────────────────────────────────────────────

class RefreshRequest(BaseModel):
    refresh_token: str


# ─────────────────────────────────────────────────────────────────
#  Password management
# ─────────────────────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    code:  str

    @field_validator('code')
    @classmethod
    def digits_only(cls, v):
        if not v.isdigit() or len(v) != 6:
            raise ValueError('OTP must be a 6-digit number.')
        return v


class ResetPasswordRequest(BaseModel):
    reset_token:      str
    new_password:     str
    confirm_password: str

    @field_validator('new_password')
    @classmethod
    def strong_password(cls, v):
        return validate_password_strength(v)

    @model_validator(mode='after')
    def passwords_match(self):
        if self.new_password != self.confirm_password:
            raise ValueError('Passwords do not match.')
        return self


class ChangePasswordRequest(BaseModel):
    old_password:     str
    new_password:     str
    confirm_password: str

    @field_validator('new_password')
    @classmethod
    def strong_password(cls, v):
        return validate_password_strength(v)

    @model_validator(mode='after')
    def passwords_match(self):
        if self.new_password != self.confirm_password:
            raise ValueError('Passwords do not match.')
        if self.old_password == self.new_password:
            raise ValueError('New password must be different from the current password.')
        return self