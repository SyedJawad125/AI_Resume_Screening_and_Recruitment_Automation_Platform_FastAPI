"""
app/core/exceptions.py
────────────────────────
Domain exceptions + a single place that turns them into consistent
JSON error responses. Route/service code raises these instead of
manually constructing HTTPException everywhere.
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse


class AppException(Exception):
    status_code = status.HTTP_400_BAD_REQUEST
    default_message = "An error occurred."

    def __init__(self, message: str | None = None):
        self.message = message or self.default_message
        super().__init__(self.message)


class ValidationError(AppException):
    status_code = status.HTTP_422_UNPROCESSABLE_CONTENT
    default_message = "Validation failed."


class UnauthorizedError(AppException):
    status_code = status.HTTP_401_UNAUTHORIZED
    default_message = "Not authenticated."


class ForbiddenError(AppException):
    status_code = status.HTTP_403_FORBIDDEN
    default_message = "You do not have permission to perform this action."


class NotFoundError(AppException):
    status_code = status.HTTP_404_NOT_FOUND

    def __init__(self, resource: str = "Resource"):
        super().__init__(f"{resource} not found.")


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.message, "data": None},
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # Never leak internals; log the real exception via observability layer instead.
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "message": "Internal server error.", "data": None},
    )
