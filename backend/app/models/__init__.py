"""Import all models so Alembic autogenerate detects every table."""
from app.models.associations import role_permissions
from app.models.user import (
    Company, Role, Permission, User, Employee, UserToken,
    UserType, EmployeeStatus, SubscriptionPlan,
)
from app.models.document import (
    Document, DocumentPage, DocumentChunk,
    DocumentStatus, ExtractionMethod,
)

__all__ = [
    'role_permissions',
    'Company', 'Role', 'Permission', 'User', 'Employee', 'UserToken',
    'UserType', 'EmployeeStatus', 'SubscriptionPlan',
    'Document', 'DocumentPage', 'DocumentChunk',
    'DocumentStatus', 'ExtractionMethod',
]