# """
# app/models/associations.py
# ───────────────────────────
# All SQLAlchemy many-to-many association tables.
# Kept in one file so there are no circular import issues.
# """
# from sqlalchemy import Table, Column, ForeignKey
# from sqlalchemy.dialects.postgresql import UUID
# from app.db.database import Base


# # Role ↔ Permission
# role_permissions = Table(
#     'role_permissions',
#     Base.metadata,
#     Column('role_id',       UUID(as_uuid=True), ForeignKey('roles.id',       ondelete='CASCADE'), primary_key=True),
#     Column('permission_id', UUID(as_uuid=True), ForeignKey('permissions.id', ondelete='CASCADE'), primary_key=True),
# )






"""
app/models/associations.py
───────────────────────────
All SQLAlchemy many-to-many association tables.

Kept in one file to avoid circular import issues.
"""

from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


# ═════════════════════════════════════════════════════════════════════
# Role ↔ Permission
# ═════════════════════════════════════════════════════════════════════

role_permissions = Table(
    "role_permissions",
    Base.metadata,

    Column(
        "role_id",
        UUID(as_uuid=True),
        ForeignKey(
            "roles.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),

    Column(
        "permission_id",
        UUID(as_uuid=True),
        ForeignKey(
            "permissions.id",
            ondelete="CASCADE",
        ),
        primary_key=True,
    ),
)