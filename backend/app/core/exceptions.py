"""
app/core/exceptions.py
───────────────────────
Custom exception classes + global FastAPI exception handlers.

All errors return:
{
    "success": false,
    "error": {
        "code": "DOCUMENT_NOT_FOUND",
        "message": "Document does not exist."
    }
}
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError


# ─────────────────────────────────────────────────────────────────
#  Custom Exception Classes
# ─────────────────────────────────────────────────────────────────

class AppException(Exception):
    """Base exception for all app errors."""
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code        = code
        self.message     = message
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppException):
    def __init__(self, resource: str = 'Resource'):
        super().__init__(
            code=f'{resource.upper().replace(" ", "_")}_NOT_FOUND',
            message=f'{resource} does not exist.',
            status_code=404,
        )


class UnauthorizedError(AppException):
    def __init__(self, message: str = 'Authentication required.'):
        super().__init__(code='UNAUTHORIZED', message=message, status_code=401)


class ForbiddenError(AppException):
    def __init__(self, message: str = 'You do not have permission to perform this action.'):
        super().__init__(code='FORBIDDEN', message=message, status_code=403)


class ValidationError(AppException):
    def __init__(self, message: str):
        super().__init__(code='VALIDATION_ERROR', message=message, status_code=422)


class FileTooLargeError(AppException):
    def __init__(self, max_mb: int):
        super().__init__(
            code='FILE_TOO_LARGE',
            message=f'File exceeds maximum size of {max_mb} MB.',
            status_code=413,
        )


class UnsupportedFileTypeError(AppException):
    def __init__(self, allowed: list[str]):
        super().__init__(
            code='UNSUPPORTED_FILE_TYPE',
            message=f'Only {", ".join(allowed)} files are supported.',
            status_code=415,
        )


class DocumentProcessingError(AppException):
    def __init__(self, message: str = 'Document processing failed.'):
        super().__init__(code='PROCESSING_FAILED', message=message, status_code=500)


class OCRError(AppException):
    def __init__(self, message: str = 'OCR extraction failed.'):
        super().__init__(code='OCR_FAILED', message=message, status_code=500)


class EmbeddingError(AppException):
    def __init__(self, message: str = 'Embedding generation failed.'):
        super().__init__(code='EMBEDDING_FAILED', message=message, status_code=500)


class LLMError(AppException):
    def __init__(self, message: str = 'LLM request failed.'):
        super().__init__(code='LLM_FAILED', message=message, status_code=502)


class LLMTimeoutError(AppException):
    def __init__(self):
        super().__init__(code='LLM_TIMEOUT', message='LLM request timed out.', status_code=504)


class DatabaseError(AppException):
    def __init__(self, message: str = 'Database operation failed.'):
        super().__init__(code='DATABASE_ERROR', message=message, status_code=500)


# ─────────────────────────────────────────────────────────────────
#  Error Response Helper
# ─────────────────────────────────────────────────────────────────

def error_response(code: str, message: str, status_code: int) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            'success': False,
            'error': {'code': code, 'message': message},
        },
    )


# ─────────────────────────────────────────────────────────────────
#  Register Global Handlers on FastAPI App
# ─────────────────────────────────────────────────────────────────

def register_exception_handlers(app: FastAPI) -> None:

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return error_response(exc.code, exc.message, exc.status_code)

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return error_response('HTTP_ERROR', exc.detail, exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        # Extract the first meaningful validation error message
        errors = exc.errors()
        message = errors[0]['msg'] if errors else 'Invalid request data.'
        field   = ' → '.join(str(loc) for loc in errors[0].get('loc', []))
        return error_response(
            'VALIDATION_ERROR',
            f'{field}: {message}' if field else message,
            422,
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        import logging
        logging.getLogger('app').exception(f'Unhandled exception: {exc}')
        return error_response('INTERNAL_ERROR', 'An unexpected error occurred.', 500)