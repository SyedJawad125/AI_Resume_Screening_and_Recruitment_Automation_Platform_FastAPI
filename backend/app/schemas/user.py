"""
app/schemas/user.py
─────────────────────
Request/response schemas for users, roles, permissions, companies.
"""

from pydantic import BaseModel, EmailStr, Field


# ── User ──────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    type: str
    is_active: bool
    is_blocked: bool


class UserListOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    type: str
    is_active: bool
    is_blocked: bool
    created_at: str


class UserUpdate(BaseModel):
    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    mobile: str | None = Field(default=None, max_length=35)
    address: str | None = Field(default=None, max_length=255)
    profile_image: str | None = None


# ── Role ──────────────────────────────────────────────────────────

class RoleCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    code_name: str = Field(min_length=1, max_length=50)
    description: str = ""


class RoleUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    permission_ids: list[str] | None = None


class RoleOut(BaseModel):
    id: str
    name: str
    code_name: str
    description: str


# ── Permission ────────────────────────────────────────────────────

class PermissionOut(BaseModel):
    id: str
    name: str
    code_name: str
    module_name: str
    description: str


# ── Company ───────────────────────────────────────────────────────

class CompanyCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None
    website: str | None = None


class CompanyUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None
    website: str | None = None
    is_active: bool | None = None


class CompanyOut(BaseModel):
    id: str
    name: str
    slug: str
    subscription_plan: str
    is_active: bool
