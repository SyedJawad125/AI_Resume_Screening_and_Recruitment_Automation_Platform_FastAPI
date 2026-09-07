"""
app/utils/response.py
─────────────────────────
Every endpoint returns the same envelope shape so the Next.js frontend
(and Postman tests) can rely on a consistent contract:

    { "success": true, "message": "...", "data": ... }
    { "success": true, "message": "...", "data": [...],
      "pagination": {"page": 1, "page_size": 20, "total": 137, "total_pages": 7} }
"""

from fastapi.responses import JSONResponse


def success_response(data=None, message: str = "OK", status_code: int = 200, count: int | None = None):
    body = {"success": True, "message": message, "data": data}
    if count is not None:
        body["count"] = count
    return JSONResponse(status_code=status_code, content=_jsonable(body))


def paginated_response(data: list, total: int, page: int, page_size: int, message: str = "OK"):
    body = {
        "success": True,
        "message": message,
        "data": data,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": (total + page_size - 1) // page_size if page_size else 0,
        },
    }
    return JSONResponse(status_code=200, content=_jsonable(body))


def _jsonable(obj):
    """Recursively coerce Enum members to their .value so JSONResponse doesn't choke."""
    from enum import Enum

    if isinstance(obj, Enum):
        return obj.value
    if isinstance(obj, dict):
        return {k: _jsonable(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_jsonable(v) for v in obj]
    return obj
