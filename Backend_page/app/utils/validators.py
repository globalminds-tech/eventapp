from typing import Type, TypeVar
from pydantic import BaseModel
from app.exceptions.api_error import ApiError

T = TypeVar("T", bound=BaseModel)

def validate_schema(schema_cls: Type[T], raw_data: dict) -> T:
    if not isinstance(raw_data, dict):
        raise ApiError("Invalid request body format. Expected JSON object.", 400)
    try:
        return schema_cls(**raw_data)
    except Exception as err:
        if hasattr(err, "errors"):
            msg = err.errors()[0].get("msg", "Validation error")
            raise ApiError(msg, 422)
        raise ApiError(str(err), 422)
