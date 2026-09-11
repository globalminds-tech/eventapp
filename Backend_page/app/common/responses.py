from fastapi.responses import JSONResponse

def success_response(data=None, message="Success", status_code=200):
    response = {
        "status": True,
        "message": message,
    }
    if data is not None:
        response["data"] = data
    return JSONResponse(content=response, status_code=status_code)

def error_response(message="An error occurred", status_code=400, errors=None):
    response = {
        "status": False,
        "message": message,
    }
    if errors is not None:
        response["errors"] = errors
    return JSONResponse(content=response, status_code=status_code)
