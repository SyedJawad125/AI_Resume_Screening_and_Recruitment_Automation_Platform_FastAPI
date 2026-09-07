"""
app/models/user.py
──────────────────
Auth & RBAC models, reused from the previous project with two changes:

1. Removed the `Employee` model and `Document` relationships — they
   belonged to a different domain (internal HR/document management).
   HireMind's own domain models (Job, Resume, Candidate, Application, ...)
   are added in Phase 2 and will hang off `User`/`Company` directly.
2. `Company` here doubles as the *recruiting organization* (the tenant
   that owns jobs and candidates) — kept the name for now; can be
   renamed to `Organization` later without any behavioral change.

RBAC is dynamic (Role <-> Permission, both DB rows), not a hardcoded
enum, so ADMIN / RECRUITER / HIRING_MANAGER are seeded rows, not
Python constants. That means new roles/permissions can be added without
a code change or migration touching an enum type.
"""

from enum import Enum as PyEnum

from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey,
    Integer, String, Text, Enum, func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.mixins import UUIDMixin, TimeStampMixin, SoftDeleteMixin, BaseModelMixin
from app.models.associations import role_permissions


# ── Enums ─────────────────────────────────────────────────────────

class UserType(str, PyEnum):
    RECRUITER = "recruiter"
    HIRING_MANAGER = "hiring_manager"
    ADMIN = "admin"


class SubscriptionPlan(str, PyEnum):
    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


# ── Company (recruiting organization / tenant) ──────────────────────

class Company(BaseModelMixin, Base):
    __tablename__ = "companies"

    name = Column(String(255), unique=True, nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(30), nullable=True)
    address = Column(String(500), nullable=True)
    website = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    logo = Column(String(500), nullable=True)
    subscription_plan = Column(Enum(SubscriptionPlan), default=SubscriptionPlan.FREE, nullable=False)
    monthly_screening_limit = Column(Integer, default=50, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    users = relationship(
        "User",
        back_populates="company",
        lazy="selectin",
        foreign_keys="[User.company_id]",
    )
    # Phase 2 will add: jobs = relationship("Job", back_populates="company")

    def __repr__(self):
        return f"<Company {self.name}>"


# ── Permission ────────────────────────────────────────────────────

class Permission(UUIDMixin, TimeStampMixin, Base):
    __tablename__ = "permissions"

    name = Column(String(100), nullable=False)
    code_name = Column(String(100), unique=True, nullable=False, index=True)
    module_name = Column(String(100), nullable=False)
    module_label = Column(String(100), nullable=True)
    description = Column(String(255), nullable=False, default="")

    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")

    def __repr__(self):
        return f"<Permission {self.code_name}>"


# ── Role ──────────────────────────────────────────────────────────

class Role(BaseModelMixin, Base):
    __tablename__ = "roles"

    name = Column(String(100), nullable=False)
    code_name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(250), nullable=False, default="")

    permissions = relationship(
        "Permission",
        secondary=role_permissions,
        back_populates="roles",
        lazy="selectin",
    )
    users = relationship("User", back_populates="role", foreign_keys="[User.role_id]")

    def __repr__(self):
        return f"<Role {self.name}>"

    def has_permission(self, code_name: str) -> bool:
        return any(p.code_name == code_name for p in self.permissions)


# ── User ──────────────────────────────────────────────────────────

class User(UUIDMixin, TimeStampMixin, SoftDeleteMixin, Base):
    __tablename__ = "users"

    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    full_name = Column(String(200), nullable=True)
    mobile = Column(String(35), nullable=True)

    password_hash = Column(String(255), nullable=True)
    profile_image = Column(String(500), nullable=True)

    is_active = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_staff = Column(Boolean, default=False, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    is_blocked = Column(Boolean, default=False, nullable=False)
    login_attempts = Column(Integer, default=0, nullable=False)

    type = Column(Enum(UserType), default=UserType.RECRUITER, nullable=False)

    # OTP password reset
    password_reset_code = Column(String(6), nullable=True)
    password_reset_code_created_at = Column(DateTime(timezone=True), nullable=True)
    password_reset_verified = Column(Boolean, default=False)

    # Link-based reset (reset_token issued after OTP verification)
    password_link_token = Column(String(255), nullable=True)
    password_link_token_created_at = Column(DateTime(timezone=True), nullable=True)

    last_password_changed = Column(DateTime(timezone=True), nullable=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    address = Column(String(255), nullable=True)

    # Foreign keys
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id", ondelete="SET NULL"), nullable=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)

    # Relationships — foreign_keys must be explicit since User has two FKs
    # into tables it also owns reverse relationships to.
    role = relationship("Role", back_populates="users", lazy="selectin", foreign_keys=[role_id])
    company = relationship("Company", back_populates="users", lazy="selectin", foreign_keys=[company_id])
    tokens = relationship("UserToken", back_populates="user", cascade="all, delete-orphan")

    # Phase 2 will add: jobs_created = relationship("Job", back_populates="created_by_user")

    def __repr__(self):
        return f"<User {self.email}>"

    def has_perm(self, code_name: str) -> bool:
        if self.is_superuser:
            return True
        if not self.role:
            return False
        return self.role.has_permission(code_name)

    @property
    def display_name(self) -> str:
        return self.full_name or f"{self.first_name} {self.last_name}"


# ── UserToken (refresh token store) ─────────────────────────────────

class UserToken(UUIDMixin, Base):
    __tablename__ = "user_tokens"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    device_token = Column(Text, nullable=True)
    token_hash = Column(String(255), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_revoked = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="tokens")
