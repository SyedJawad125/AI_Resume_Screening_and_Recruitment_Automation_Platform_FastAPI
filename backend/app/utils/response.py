from typing import Any, Dict, Optional, List
from fastapi import Response
from fastapi.responses import JSONResponse


def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = 200
) -> JSONResponse:
    """
    Standard success response format.
    
    Args:
        data: The response data
        message: Success message
        status_code: HTTP status code
    
    Returns:
        JSONResponse with standard format
    """
    response_data = {
        "success": True,
        "message": message,
        "data": data
    }
    return JSONResponse(content=response_data, status_code=status_code)


def paginated_response(
    data: List[Any],
    total: int,
    page: int,
    page_size: int,
    message: str = "Success"
) -> JSONResponse:
    """
    Standard paginated response format.
    
    Args:
        data: The response data (list of items)
        total: Total number of items
        page: Current page number
        page_size: Number of items per page
        message: Success message
    
    Returns:
        JSONResponse with pagination metadata
    """
    response_data = {
        "success": True,
        "message": message,
        "data": data,
        "pagination": {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if page_size > 0 else 0
        }
    }
    return JSONResponse(content=response_data)


def error_response(
    message: str = "Error",
    errors: Optional[Dict[str, Any]] = None,
    status_code: int = 400
) -> JSONResponse:
    """
    Standard error response format.
    
    Args:
        message: Error message
        errors: Detailed error information
        status_code: HTTP status code
    
    Returns:
        JSONResponse with error format
    """
    response_data = {
        "success": False,
        "message": message,
        "errors": errors
    }
    return JSONResponse(content=response_data, status_code=status_code)
