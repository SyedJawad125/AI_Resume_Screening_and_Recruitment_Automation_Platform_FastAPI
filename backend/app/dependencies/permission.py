# from fastapi import Depends, HTTPException, status
# from typing import List, Callable
# # from app.dependencies.get_current_user import get_current_user
# # ✅ correct import
# from app.oauth2 import get_current_user

# from app.models import User


# def permission_required(required_permissions: List[str]) -> Callable:
#     def permission_checker(current_user: User = Depends(get_current_user)):
#         if current_user.is_superuser and not hasattr(current_user, "permissions_dict"):
#             # Backup logic if someone bypassed
#             return

#         # Use the dictionary attached to user
#         permissions_dict = getattr(current_user, "permissions_dict", {})

#         for perm in required_permissions:
#             if not permissions_dict.get(perm, False):
#                 raise HTTPException(
#                     status_code=status.HTTP_403_FORBIDDEN,
#                     detail=f"Missing permission: {perm}"
#                 )
#         return
#     return permission_checker


# def require(*perms: str):
#     return Depends(permission_required(list(perms)))




"""
app/dependencies/permission.py
────────────────────────────────
Permission-checking FastAPI dependencies.

Usage in routes:
    @router.delete('/admin/users')
    async def delete_user(
        user: User = Depends(require_permission('can_delete_users'))
    ):
"""
from fastapi import Depends
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.core.exceptions import ForbiddenError


def require_permission(code_name: str):
    """Factory — require a specific permission code."""
    async def _check(current_user: User = Depends(get_current_user)) -> User:
        if not current_user.has_perm(code_name):
            raise ForbiddenError(f'Required permission: {code_name}')
        return current_user
    return _check


def require_any_permission(*code_names: str):
    """Require at least ONE of the given permissions."""
    async def _check(current_user: User = Depends(get_current_user)) -> User:
        if not any(current_user.has_perm(c) for c in code_names):
            raise ForbiddenError(f'Requires one of: {", ".join(code_names)}')
        return current_user
    return _check


def require_all_permissions(*code_names: str):
    """Require ALL of the given permissions."""
    async def _check(current_user: User = Depends(get_current_user)) -> User:
        missing = [c for c in code_names if not current_user.has_perm(c)]
        if missing:
            raise ForbiddenError(f'Missing permissions: {", ".join(missing)}')
        return current_user
    return _check