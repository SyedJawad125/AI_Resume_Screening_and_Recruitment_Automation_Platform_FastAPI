"""
app/api/v1/users.py
────────────────────
Users, Roles, Permissions, Employees, Companies endpoints.

GET    /api/v1/users/me               → current user profile
PATCH  /api/v1/users/me               → update profile
GET    /api/v1/users/                 → list users (admin)
GET    /api/v1/users/{id}             → user detail
PATCH  /api/v1/users/{id}/block       → block/unblock user

GET    /api/v1/users/roles/           → list roles
POST   /api/v1/users/roles/           → create role
PATCH  /api/v1/users/roles/{id}       → update role
DELETE /api/v1/users/roles/{id}       → delete role

GET    /api/v1/users/permissions/     → list all permissions

GET    /api/v1/users/companies/       → list companies
POST   /api/v1/users/companies/       → create company
PATCH  /api/v1/users/companies/{id}   → update company
DELETE /api/v1/users/companies/{id}   → soft delete company
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.db.database import get_db
from app.dependencies.auth import get_current_user, require_superuser
from app.models.user import User, Role, Permission, Company
from app.repositories.user_repository import UserRepository
from app.schemas.user import (
    UserOut, UserUpdate, UserListOut,
    RoleCreate, RoleUpdate, RoleOut,
    PermissionOut,
    CompanyCreate, CompanyUpdate, CompanyOut,
)
from app.core.exceptions import NotFoundError, ValidationError, ForbiddenError
from app.utils.response import success_response, paginated_response

router = APIRouter()


# ─────────────────────────────────────────────────────────────────
#  Current User Profile
# ─────────────────────────────────────────────────────────────────

@router.get('/me')
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user's profile."""
    return success_response({
        'id':          str(current_user.id),
        'email':       current_user.email,
        'first_name':  current_user.first_name,
        'last_name':   current_user.last_name,
        'full_name':   current_user.full_name,
        'mobile':      current_user.mobile,
        'type':        current_user.type,
        'is_active':   current_user.is_active,
        'is_verified': current_user.is_verified,
        'role':        {'id': str(current_user.role.id), 'name': current_user.role.name,
                        'code_name': current_user.role.code_name} if current_user.role else None,
        'company_id':  str(current_user.company_id) if current_user.company_id else None,
    })


@router.patch('/me')
async def update_me(
    payload:      UserUpdate,
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
):
    """Update current user's own profile."""
    updates = payload.model_dump(exclude_none=True)
    if not updates:
        raise ValidationError('No fields provided to update.')

    for key, val in updates.items():
        setattr(current_user, key, val)

    if 'first_name' in updates or 'last_name' in updates:
        current_user.full_name = f'{current_user.first_name} {current_user.last_name}'

    await db.commit()
    return success_response({'message': 'Profile updated successfully.'})


# ─────────────────────────────────────────────────────────────────
#  User List & Detail  (admin only)
# ─────────────────────────────────────────────────────────────────

@router.get('/')
async def list_users(
    page:      int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin:     User = Depends(require_superuser),
    db:        AsyncSession = Depends(get_db),
):
    """List all users. Superuser only."""
    repo             = UserRepository(db)
    users, total     = await repo.list_by_company(admin.company_id or '', page, page_size) \
                        if not admin.is_superuser else \
                        await _list_all_users(db, page, page_size)
    data = [
        {
            'id':         str(u.id),
            'email':      u.email,
            'full_name':  u.full_name,
            'type':       u.type,
            'is_active':  u.is_active,
            'is_blocked': u.is_blocked,
            'created_at': u.created_at.isoformat(),
        }
        for u in users
    ]
    return paginated_response(data, total, page, page_size)


async def _list_all_users(db, page, page_size):
    from sqlalchemy import func
    q      = select(User).where(User.deleted == False).order_by(User.created_at.desc())
    total  = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar_one()
    result = await db.execute(q.offset((page - 1) * page_size).limit(page_size))
    return result.scalars().all(), total


@router.get('/{user_id}')
async def get_user(
    user_id: str,
    admin:   User = Depends(require_superuser),
    db:      AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise NotFoundError('User')
    return success_response({
        'id':          str(user.id),
        'email':       user.email,
        'full_name':   user.full_name,
        'type':        user.type,
        'is_active':   user.is_active,
        'is_blocked':  user.is_blocked,
        'login_attempts': user.login_attempts,
        'created_at':  user.created_at.isoformat(),
    })


@router.patch('/{user_id}/block')
async def toggle_block(
    user_id: str,
    admin:   User = Depends(require_superuser),
    db:      AsyncSession = Depends(get_db),
):
    """Block or unblock a user."""
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise NotFoundError('User')
    if str(user.id) == str(admin.id):
        raise ValidationError('Cannot block yourself.')

    user.is_blocked    = not user.is_blocked
    user.login_attempts = 0
    await db.commit()
    action = 'blocked' if user.is_blocked else 'unblocked'
    return success_response({'message': f'User {action} successfully.', 'is_blocked': user.is_blocked})


# ─────────────────────────────────────────────────────────────────
#  Permissions
# ─────────────────────────────────────────────────────────────────

@router.get('/permissions/')
async def list_permissions(
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
):
    """List all permissions grouped by module."""
    repo        = UserRepository(db)
    permissions = await repo.list_permissions()

    grouped: dict = {}
    for p in permissions:
        label = p.module_label or p.module_name
        grouped.setdefault(label, []).append({
            'id':          str(p.id),
            'name':        p.name,
            'code_name':   p.code_name,
            'module_name': p.module_name,
            'description': p.description,
        })
    return success_response(grouped, count=len(permissions))


# ─────────────────────────────────────────────────────────────────
#  Roles
# ─────────────────────────────────────────────────────────────────

@router.get('/roles/')
async def list_roles(
    current_user: User = Depends(get_current_user),
    db:           AsyncSession = Depends(get_db),
):
    repo  = UserRepository(db)
    roles = await repo.list_roles()
    data  = [
        {
            'id':        str(r.id),
            'name':      r.name,
            'code_name': r.code_name,
            'permissions': [{'id': str(p.id), 'name': p.name, 'code_name': p.code_name}
                            for p in r.permissions],
        }
        for r in roles
    ]
    return success_response(data, count=len(data))


@router.post('/roles/')
async def create_role(
    payload: RoleCreate,
    admin:   User = Depends(require_superuser),
    db:      AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    existing = await repo.get_role_by_code(payload.code_name)
    if existing:
        raise ValidationError(f'Role with code_name "{payload.code_name}" already exists.')

    role = await repo.create_role(
        name        = payload.name.title(),
        code_name   = payload.code_name.lower(),
        description = payload.description,
    )
    await db.commit()
    return success_response({'id': str(role.id), 'name': role.name, 'code_name': role.code_name},
                             status_code=201)


@router.patch('/roles/{role_id}')
async def update_role(
    role_id: str,
    payload: RoleUpdate,
    admin:   User = Depends(require_superuser),
    db:      AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    role = await repo.get_role_by_id(role_id)
    if not role:
        raise NotFoundError('Role')

    if payload.name:
        role.name = payload.name.title()
    if payload.description is not None:
        role.description = payload.description

    if payload.permission_ids is not None:
        result = await db.execute(
            select(Permission).where(Permission.id.in_(payload.permission_ids))
        )
        role.permissions = result.scalars().all()

    await db.commit()
    return success_response({'message': 'Role updated.'})


@router.delete('/roles/{role_id}')
async def delete_role(
    role_id: str,
    admin:   User = Depends(require_superuser),
    db:      AsyncSession = Depends(get_db),
):
    repo = UserRepository(db)
    role = await repo.get_role_by_id(role_id)
    if not role:
        raise NotFoundError('Role')
    if role.users:
        raise ValidationError('Cannot delete a role that has assigned users.')

    role.deleted = True
    await db.commit()
    return success_response({'message': 'Role deleted.'})


# ─────────────────────────────────────────────────────────────────
#  Companies
# ─────────────────────────────────────────────────────────────────

@router.get('/companies/')
async def list_companies(
    page:      int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin:     User = Depends(require_superuser),
    db:        AsyncSession = Depends(get_db),
):
    repo              = UserRepository(db)
    companies, total  = await repo.list_companies(page, page_size)
    data = [
        {
            'id':                str(c.id),
            'name':              c.name,
            'slug':              c.slug,
            'subscription_plan': c.subscription_plan,
            'is_active':         c.is_active,
            'created_at':        c.created_at.isoformat(),
        }
        for c in companies
    ]
    return paginated_response(data, total, page, page_size)


@router.post('/companies/')
async def create_company(
    payload: CompanyCreate,
    admin:   User = Depends(require_superuser),
    db:      AsyncSession = Depends(get_db),
):
    from python_slugify import slugify
    repo = UserRepository(db)
    if await repo.get_company_by_slug(slugify(payload.name)):
        raise ValidationError('Company with this name already exists.')

    company = await repo.create_company(
        name    = payload.name,
        slug    = slugify(payload.name),
        email   = payload.email or '',
        phone   = payload.phone or '',
        address = payload.address or '',
        website = payload.website or '',
    )
    await db.commit()
    return success_response({'id': str(company.id), 'name': company.name}, status_code=201)


@router.patch('/companies/{company_id}')
async def update_company(
    company_id: str,
    payload:    CompanyUpdate,
    admin:      User = Depends(require_superuser),
    db:         AsyncSession = Depends(get_db),
):
    repo    = UserRepository(db)
    company = await repo.get_company_by_id(company_id)
    if not company:
        raise NotFoundError('Company')

    for key, val in payload.model_dump(exclude_none=True).items():
        setattr(company, key, val)
    await db.commit()
    return success_response({'message': 'Company updated.'})


@router.delete('/companies/{company_id}')
async def delete_company(
    company_id: str,
    admin:      User = Depends(require_superuser),
    db:         AsyncSession = Depends(get_db),
):
    repo    = UserRepository(db)
    company = await repo.get_company_by_id(company_id)
    if not company:
        raise NotFoundError('Company')
    if company.users:
        raise ValidationError('Cannot delete a company that still has users.')

    company.deleted   = True
    company.is_active = False
    await db.commit()
    return success_response({'message': 'Company deleted.'})