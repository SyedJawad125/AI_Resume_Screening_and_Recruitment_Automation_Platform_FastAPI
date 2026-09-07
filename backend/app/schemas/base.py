"""
app/schemas/base.py
────────────────────
Base Pydantic schemas reused across the project.
"""
from datetime import datetime
from typing import Any, Optional, Generic, TypeVar
from pydantic import BaseModel, ConfigDict

T = TypeVar('T')


class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TimestampSchema(BaseSchema):
    created_at: datetime
    updated_at: datetime


class SuccessResponse(BaseModel):
    success: bool = True
    data:    Any  = None
    message: Optional[str] = None
    count:   Optional[int] = None


class ErrorDetail(BaseModel):
    code:    str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error:   ErrorDetail


class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = True
    data:    list[T]
    pagination: dict