"""
app/dependencies/auth.py
─────────────────────────
FastAPI dependencies for authentication and authorization.

Usage in routes:
    @router.get('/me')
    async def me(current_user: User = Depends(get_current_user)):
        ...

    @router.delete('/admin/x')
    async def admin_action(user: User = Depends(require_superuser)):
        ...
"""

from fastapi import Depends, Header
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import decode_token
from app.core.exceptions import UnauthorizedError, ForbiddenError
from app.db.database import get_db
from app.models.user import User


async def get_current_user(
    authorization: str = Header(..., description='Bearer <access_token>'),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Extracts and validates the JWT token from the Authorization header.
    Returns the authenticated User object.

    Why Header() instead of OAuth2PasswordBearer?
      - Matches your existing Django pattern (Authorization: Bearer <token>)
      - More flexible for cookie-based auth later
    """
    if not authorization.startswith('Bearer '):
        raise UnauthorizedError('Invalid token format. Use: Bearer <token>')

    token = authorization.split(' ', 1)[1]

    try:
        payload = decode_token(token)
        user_id = payload.get('sub')
        if not user_id:
            raise UnauthorizedError('Invalid token payload.')
        if payload.get('type') != 'access':
            raise UnauthorizedError('Refresh tokens cannot be used for API access.')
    except JWTError:
        raise UnauthorizedError('Token is invalid or has expired.')

    result = await db.execute(select(User).where(User.id == user_id, User.deleted == False))
    user   = result.scalar_one_or_none()

    if not user:
        raise UnauthorizedError('User not found.')
    if not user.is_active:
        raise UnauthorizedError('Account is not active.')
    if user.is_blocked:
        raise UnauthorizedError('Account is blocked. Please contact support.')

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Alias — same as get_current_user but named clearly."""
    return current_user


async def require_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_superuser:
        raise ForbiddenError('Superuser access required.')
    return current_user


def require_permission(code_name: str):
    """
    Factory dependency — require a specific permission.
    Usage: Depends(require_permission('can_upload_documents'))
    """
    async def check_permission(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if not current_user.has_perm(code_name):
            raise ForbiddenError(f'Permission required: {code_name}')
        return current_user
    return check_permission


def get_document_owner_check(document_model):
    """
    Factory dependency — ensures the current user owns the document.
    Usage: Depends(get_document_owner_check(Document))
    """
    async def check_ownership(
        document_id: str,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ):
        from app.models.document import Document
        result   = await db.execute(
            select(Document).where(
                Document.id == document_id,
                Document.deleted == False,
            )
        )
        document = result.scalar_one_or_none()
        if not document:
            from app.core.exceptions import NotFoundError
            raise NotFoundError('Document')
        if str(document.user_id) != str(current_user.id) and not current_user.is_superuser:
            raise ForbiddenError('You do not have access to this document.')
        return document
    return check_ownership