"""
app/models/mixins.py
─────────────────────
Reusable SQLAlchemy mixins shared across all models.
"""

import uuid

from sqlalchemy import Column, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID


class UUIDMixin:
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )


class TimeStampMixin:
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )


class UserTrackingMixin:
    """
    Tracks the user who created and last updated the record.
    """

    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True
    )

    updated_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True
    )


class SoftDeleteMixin:
    deleted = Column(
        Boolean,
        default=False,
        nullable=False
    )


class BaseModelMixin(
    UUIDMixin,
    TimeStampMixin,
    UserTrackingMixin,
    SoftDeleteMixin
):
    """
    Full mixin:
    UUID primary key + timestamps + user tracking + soft delete.
    """
    pass