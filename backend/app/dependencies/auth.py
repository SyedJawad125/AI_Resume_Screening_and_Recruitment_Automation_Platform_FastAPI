"""
app/dependencies/auth.py
──────────────────────────
FastAPI dependencies for pulling the authenticated user out of the
Authorization header and enforcing authorization rules.
"""

from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import UnauthorizedError, ForbiddenError
from app.core.security import decode_token
from app.db.database import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Decode the access token from the Authorization header and load the user."""
    if credentials is None:
        raise UnauthorizedError("Authentication credentials were not provided.")

    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise UnauthorizedError("Invalid token type.")
        user_id = payload.get("sub")
    except JWTError:
        raise UnauthorizedError("Invalid or expired access token.")

    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user or not user.is_active:
        raise UnauthorizedError("User not found or inactive.")
    if user.is_blocked:
        raise UnauthorizedError("Account is blocked.")

    return user


async def require_superuser(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_superuser:
        raise ForbiddenError("Superuser privileges required.")
    return current_user


def require_permission(code_name: str):
    """Factory dependency: require_permission('jobs.create') as a route dependency."""

    async def _checker(current_user: User = Depends(get_current_user)) -> User:
        if not current_user.has_perm(code_name):
            raise ForbiddenError(f'Missing required permission: "{code_name}".')
        return current_user

    return _checker
