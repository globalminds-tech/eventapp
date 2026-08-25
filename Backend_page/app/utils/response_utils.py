from fastapi.responses import JSONResponse

def success_response(data=None, message: str = None, status_code: int = 200):
    payload = {"success": True}
    if data is not None:
        payload["data"] = data
    if message:
        payload["message"] = message
    return JSONResponse(content=payload, status_code=status_code)

def paginated_response(data: list, page: int, limit: int, total: int, status_code: int = 200):
    return JSONResponse(
        content={
            "success": True,
            "data": data,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total
            }
        },
        status_code=status_code
    )

def error_response(message: str, status_code: int = 400):
    return JSONResponse(
        content={
            "success": False,
            "message": message
        },
        status_code=status_code
    )
