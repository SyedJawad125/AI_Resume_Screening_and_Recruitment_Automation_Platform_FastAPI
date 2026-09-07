# # app/api/v1/__init__.py
# from app.api.v1.user import router as user_router
# from app.api.v1.auth import router as auth_router
# from app.api.v1.documents import router as documents_router
# from app.api.v1.chat import router as chat_router
# from app.api.v1.search import router as search_router
# from app.api.v1.extraction import router as extraction_router
# from app.api.v1.reports import router as reports_router
# from app.api.v1.roles import router as roles_router
# from app.api.v1.companies import router as companies_router

# # Export all routers
# __all__ = [
#     "user_router",
#     "auth_router",
#     "documents_router",
#     "chat_router",
#     "search_router",
#     "extraction_router",
#     "reports_router",
#     "roles_router",
#     "companies_router",
# ]






# app/api/v1/__init__.py

from app.api.v1.user import router as users_router
from app.api.v1.auth import router as auth_router
from app.api.v1.documents import router as documents_router
from app.api.v1.chat import router as chat_router
from app.api.v1.search import router as search_router
from app.api.v1.extraction import router as extraction_router
from app.api.v1.reports import router as reports_router

__all__ = [
    "users_router",
    "auth_router",
    "documents_router",
    "chat_router",
    "search_router",
    "extraction_router",
    "reports_router",
]