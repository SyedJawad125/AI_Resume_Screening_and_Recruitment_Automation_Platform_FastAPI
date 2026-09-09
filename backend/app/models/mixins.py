"""
app/models/mixins.py
─────────────────────
Reusable SQLAlchemy mixins shared across all models.
(Reused as-is from the previous project.)
"""

import uuid

from sqlalchemy import Column, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID


class UUIDMixin:
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


class TimeStampMixin:
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class UserTrackingMixin:
    """Tracks the user who created and last updated the record.

    `use_alter=True` is required here: Company and Role both use this
    mixin AND are referenced BY User (via company_id/role_id), creating a
    circular FK dependency (users -> companies -> users, users -> roles
    -> users). Without use_alter, SQLAlchemy/Alembic can't determine a
    valid CREATE TABLE order and DDL generation fails with a "table
    dependency cycle" error. use_alter defers these two FKs to a separate
    ALTER TABLE ... ADD CONSTRAINT, issued after every table already
    exists, which breaks the cycle. Each needs an explicit `name=` since
    use_alter constraints must be individually nameable for Alembic to
    track them.
    """

    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", use_alter=True, name="fk_created_by_user"),
        nullable=True,
    )
    updated_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", use_alter=True, name="fk_updated_by_user"),
        nullable=True,
    )


class SoftDeleteMixin:
    deleted = Column(Boolean, default=False, nullable=False)


class BaseModelMixin(UUIDMixin, TimeStampMixin, UserTrackingMixin, SoftDeleteMixin):
    """Full mixin: UUID primary key + timestamps + user tracking + soft delete."""

    pass
