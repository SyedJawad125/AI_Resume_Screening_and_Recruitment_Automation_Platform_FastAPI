"""
app/schemas/company.py
───────────────────────
Company schemas (re-exports from user.py for clean imports).
"""
from app.schemas.user import CompanyCreate, CompanyUpdate, CompanyOut

__all__ = ['CompanyCreate', 'CompanyUpdate', 'CompanyOut']