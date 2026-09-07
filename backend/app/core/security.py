"""
app/core/security.py
─────────────────────
JWT creation/verification and password hashing.

Why python-jose?
  - Standard JWT library for Python
  - Supports HS256 (symmetric) and RS256 (asymmetric)
  - Integrates cleanly with FastAPI

Why passlib + bcrypt?
  - bcrypt is the industry standard for password hashing
  - Salted by default — same password = different hash every time
  - Configurable rounds (cost factor)
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# bcrypt context — rounds=12 is a good production default
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


# ─────────────────────────────────────────────────────────────────
#  Password Utilities
# ─────────────────────────────────────────────────────────────────

def hash_password(plain_password: str) -> str:
    """Hash a plain-text password. Never store plain passwords."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compare plain password against stored hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ─────────────────────────────────────────────────────────────────
#  JWT Utilities
# ─────────────────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a signed JWT access token.
    `data` must include `sub` (subject = user id as string).
    """
    payload = data.copy()
    expire  = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload.update({'exp': expire, 'type': 'access'})
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """Create a longer-lived refresh token."""
    payload = data.copy()
    expire  = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload.update({'exp': expire, 'type': 'refresh'})
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decode and verify a JWT token.
    Raises JWTError if invalid, expired, or tampered.
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


def get_token_subject(token: str) -> Optional[str]:
    """
    Extract the `sub` claim from a token without raising.
    Returns None if the token is invalid.
    """
    try:
        payload = decode_token(token)
        return payload.get('sub')
    except JWTError:
        return None