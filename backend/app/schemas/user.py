"""
app/schemas/user.py
────────────────────
Pydantic schemas for User, Role, Permission, Employee endpoints.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator, ConfigDict


# ─── Permission ────────────────────────────────────────────────────

class PermissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:           str
    name:         str
    code_name:    str
    module_name:  str
    module_label: Optional[str]
    description:  str


# ─── Role ──────────────────────────────────────────────────────────

class RoleCreate(BaseModel):
    name:        str
    code_name:   str
    description: str = ''

    @field_validator('name', 'code_name')
    @classmethod
    def not_empty(cls, v):
        if not v.strip():
            raise ValueError('Field cannot be empty.')
        return v.strip()


class RoleUpdate(BaseModel):
    name:           Optional[str] = None
    description:    Optional[str] = None
    permission_ids: Optional[list[str]] = None


class RoleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:          str
    name:        str
    code_name:   str
    description: str
    permissions: list[PermissionOut] = []
    created_at:  datetime


# ─── User ──────────────────────────────────────────────────────────

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:          str
    email:       str
    first_name:  str
    last_name:   str
    full_name:   Optional[str]
    mobile:      Optional[str]
    type:        str
    is_active:   bool
    is_verified: bool
    is_blocked:  bool
    role:        Optional[RoleOut]
    created_at:  datetime


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name:  Optional[str] = None
    mobile:     Optional[str] = None
    role_id:    Optional[str] = None


class UserListOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:         str
    email:      str
    full_name:  Optional[str]
    type:       str
    is_active:  bool
    is_blocked: bool
    created_at: datetime


# ─── Employee ──────────────────────────────────────────────────────

class EmployeeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:     str
    status: str
    user:   Optional[UserOut]


# ─── Company ──────────────────────────────────────────────────────

class CompanyCreate(BaseModel):
    name:        str
    email:       Optional[str] = None
    phone:       Optional[str] = None
    address:     Optional[str] = None
    website:     Optional[str] = None
    description: Optional[str] = None

    @field_validator('name')
    @classmethod
    def not_empty(cls, v):
        if not v.strip():
            raise ValueError('Company name cannot be empty.')
        return v.strip().title()


class CompanyUpdate(BaseModel):
    name:               Optional[str] = None
    email:              Optional[str] = None
    phone:              Optional[str] = None
    address:            Optional[str] = None
    website:            Optional[str] = None
    description:        Optional[str] = None
    subscription_plan:  Optional[str] = None
    is_active:          Optional[bool] = None


class CompanyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:                str
    name:              str
    slug:              str
    email:             Optional[str]
    phone:             Optional[str]
    address:           Optional[str]
    website:           Optional[str]
    subscription_plan: str
    is_active:         bool
    created_at:        datetime