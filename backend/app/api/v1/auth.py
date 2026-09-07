"""
app/api/v1/auth.py
───────────────────
Authentication endpoints.

POST /api/v1/auth/register       → create account
POST /api/v1/auth/login          → get tokens
POST /api/v1/auth/refresh        → exchange refresh → new access token
POST /api/v1/auth/logout         → invalidate refresh token
POST /api/v1/auth/forgot-password → send OTP
POST /api/v1/auth/verify-otp     → verify OTP, get reset_token
POST /api/v1/auth/reset-password → set new password
POST /api/v1/auth/change-password → change password (logged in)
"""

import random
import string
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.core.config import settings
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
)
from app.core.exceptions import (
    UnauthorizedError, NotFoundError, ValidationError, AppException,
)
from app.models.user import User, UserToken, Company
from app.schemas.auth import (
    RegisterRequest, RegisterResponse,
    LoginRequest, LoginResponse, TokenResponse,
    RefreshRequest,
    ForgotPasswordRequest, VerifyOTPRequest,
    ResetPasswordRequest, ChangePasswordRequest,
)
from app.dependencies.auth import get_current_user
from app.utils.response import success_response

router = APIRouter()

MAX_LOGIN_ATTEMPTS = 5


# ─────────────────────────────────────────────────────────────────
#  Register
# ─────────────────────────────────────────────────────────────────

@router.post('/register', response_model=None, status_code=201)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Create a new user account. Optionally creates a company."""

    # Check if email already exists
    result = await db.execute(select(User).where(User.email == payload.email, User.deleted == False))
    if result.scalar_one_or_none():
        raise ValidationError('An account with this email already exists.')

    # Create company if provided
    company = None
    if payload.company_name:
        from python_slugify import slugify
        slug = slugify(payload.company_name)
        company = Company(name=payload.company_name.title(), slug=slug)
        db.add(company)
        await db.flush()

    # Create user
    user = User(
        username      = payload.email,
        email         = payload.email,
        first_name    = payload.first_name.title(),
        last_name     = payload.last_name.title(),
        full_name     = f'{payload.first_name.title()} {payload.last_name.title()}',
        password_hash = hash_password(payload.password),
        company_id    = company.id if company else None,
        is_active     = True,      # simplify: auto-activate (add email verification later)
        is_verified   = True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return success_response({
        'id':       str(user.id),
        'email':    user.email,
        'full_name': user.full_name,
        'message':  'Registration successful.',
    }, status_code=201)


# ─────────────────────────────────────────────────────────────────
#  Login
# ─────────────────────────────────────────────────────────────────

@router.post('/login')
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return access + refresh tokens with role and permissions."""

    from sqlalchemy.orm import selectinload
    from app.models.user import Role, Permission

    result = await db.execute(
        select(User)
        .options(selectinload(User.role).selectinload(Role.permissions))
        .where(User.email == payload.email, User.deleted == False)
    )
    user   = result.scalar_one_or_none()

    if not user:
        raise UnauthorizedError('Invalid email or password.')

    if user.is_blocked:
        raise UnauthorizedError('Account is blocked. Please contact support.')

    if not verify_password(payload.password, user.password_hash or ''):
        user.login_attempts = (user.login_attempts or 0) + 1
        if user.login_attempts >= MAX_LOGIN_ATTEMPTS:
            user.is_blocked = True
        await db.commit()
        raise UnauthorizedError('Invalid email or password.')

    # Successful login
    user.login_attempts = 0
    user.last_login     = datetime.now(timezone.utc)
    await db.commit()

    token_data     = {'sub': str(user.id)}
    access_token   = create_access_token(token_data)
    refresh_token  = create_refresh_token(token_data)

    # Store refresh token hash
    from app.core.security import hash_password as hash_token
    token_record = UserToken(
        user_id    = user.id,
        token_hash = hash_token(refresh_token),
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(token_record)
    await db.commit()

    # Build role and permissions data
    role_data = None
    permissions_list = []
    
    if user.role:
        role_data = {
            'id': str(user.role.id),
            'name': user.role.name,
            'code_name': user.role.code_name,
            'description': user.role.description
        }
        
        if user.role.permissions:
            permissions_list = [perm.code_name for perm in user.role.permissions]

    return success_response({
        'user': {
            'id':         str(user.id),
            'email':      user.email,
            'full_name':  user.full_name,
            'type':       user.type,
            'company_id': str(user.company_id) if user.company_id else None,
            'role':       role_data,
        },
        'tokens': {
            'access_token':  access_token,
            'refresh_token': refresh_token,
            'token_type':    'bearer',
            'expires_in':    settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        },
        'permissions': permissions_list,
    })


# ─────────────────────────────────────────────────────────────────
#  Refresh
# ─────────────────────────────────────────────────────────────────

@router.post('/refresh')
async def refresh_token(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Exchange a refresh token for a new access token."""
    try:
        token_data = decode_token(payload.refresh_token)
        if token_data.get('type') != 'refresh':
            raise UnauthorizedError('Invalid token type.')
        user_id = token_data.get('sub')
    except Exception:
        raise UnauthorizedError('Invalid or expired refresh token.')

    result = await db.execute(select(User).where(User.id == user_id, User.deleted == False))
    user   = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise UnauthorizedError('User not found or inactive.')

    new_access_token = create_access_token({'sub': str(user.id)})
    return success_response({'access_token': new_access_token, 'token_type': 'bearer'})


# ─────────────────────────────────────────────────────────────────
#  Logout
# ─────────────────────────────────────────────────────────────────

@router.post('/logout')
async def logout(
    payload:      RefreshRequest,
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
):
    """Invalidate the refresh token (logout)."""
    await db.execute(
        UserToken.__table__.update()
        .where(UserToken.user_id == current_user.id)
        .values(is_revoked=True)
    )
    await db.commit()
    return success_response({'message': 'Logged out successfully.'})


# ─────────────────────────────────────────────────────────────────
#  Forgot Password — send OTP
# ─────────────────────────────────────────────────────────────────

@router.post('/forgot-password')
async def forgot_password(payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Send a 6-digit OTP to the user's email."""
    result = await db.execute(select(User).where(User.email == payload.email, User.deleted == False))
    user   = result.scalar_one_or_none()

    # Always return 200 — don't reveal if email exists (security)
    if not user:
        return success_response({'message': 'If this email exists, a reset code has been sent.'})

    code = ''.join(random.choices(string.digits, k=6))
    user.password_reset_code            = code
    user.password_reset_code_created_at = datetime.now(timezone.utc)
    user.password_reset_verified        = False
    await db.commit()

    # TODO: send email via Celery/background task
    # For development — code is returned in response (remove in production)
    return success_response({
        'message': 'Reset code sent to your email.',
        'code':    code if settings.DEBUG else None,  # remove in production
    })


# ─────────────────────────────────────────────────────────────────
#  Verify OTP
# ─────────────────────────────────────────────────────────────────

@router.post('/verify-otp')
async def verify_otp(payload: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    """Verify the 6-digit OTP. Returns a reset_token for step 3."""
    result = await db.execute(select(User).where(User.email == payload.email, User.deleted == False))
    user   = result.scalar_one_or_none()

    if not user or not user.password_reset_code:
        raise ValidationError('Invalid email or no OTP found. Request a new one.')

    # Check expiry (3 minutes)
    expiry = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    if datetime.now(timezone.utc) - user.password_reset_code_created_at.replace(tzinfo=timezone.utc) > timedelta(minutes=3):
        user.password_reset_code = None
        await db.commit()
        raise ValidationError('OTP has expired. Please request a new one.')

    if user.password_reset_code != payload.code:
        raise ValidationError('Invalid OTP code.')

    # Generate reset token
    import secrets
    reset_token = secrets.token_urlsafe(32)
    user.password_reset_verified        = True
    user.password_link_token            = reset_token
    user.password_link_token_created_at = datetime.now(timezone.utc)
    await db.commit()

    return success_response({
        'message':     'OTP verified. Use the reset_token to set a new password.',
        'reset_token': reset_token,
    })


# ─────────────────────────────────────────────────────────────────
#  Reset Password
# ─────────────────────────────────────────────────────────────────

@router.post('/reset-password')
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Set a new password using the reset_token from OTP verification."""
    result = await db.execute(
        select(User).where(User.password_link_token == payload.reset_token, User.deleted == False)
    )
    user = result.scalar_one_or_none()

    if not user or not user.password_reset_verified:
        raise ValidationError('Invalid or expired reset token.')

    if verify_password(payload.new_password, user.password_hash or ''):
        raise ValidationError('New password cannot be the same as the current password.')

    user.password_hash              = hash_password(payload.new_password)
    user.password_reset_code        = None
    user.password_reset_code_created_at = None
    user.password_reset_verified    = False
    user.password_link_token        = None
    user.password_link_token_created_at = None
    user.last_password_changed      = datetime.now(timezone.utc)
    user.login_attempts             = 0
    user.is_blocked                 = False
    await db.commit()

    return success_response({'message': 'Password reset successfully. You can now log in.'})


# ─────────────────────────────────────────────────────────────────
#  Change Password (logged in)
# ─────────────────────────────────────────────────────────────────

@router.post('/change-password')
async def change_password(
    payload:      ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
):
    """Change password for authenticated user."""
    if not verify_password(payload.old_password, current_user.password_hash or ''):
        raise ValidationError('Current password is incorrect.')

    current_user.password_hash         = hash_password(payload.new_password)
    current_user.last_password_changed = datetime.now(timezone.utc)
    current_user.login_attempts        = 0
    await db.commit()

    return success_response({'message': 'Password changed successfully.'})