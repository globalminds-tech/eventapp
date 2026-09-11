import math
from typing import Optional, Generic, TypeVar, List, Dict, Any
from pydantic import BaseModel
from fastapi import Query

T = TypeVar("T")

class PaginationParams:
    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number"),
        limit: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
        search: Optional[str] = Query(None, max_length=100, description="Keyword search query"),
        sort_by: str = Query("created_at", description="Field to sort by"),
        sort_order: str = Query("desc", description="Sort direction")
    ):
        self.page = max(1, page)
        self.limit = min(max(1, limit), 100)
        self.search = search.strip() if search and search.strip() else None
        self.sort_by = sort_by
        self.sort_order = sort_order.lower() if sort_order in ["asc", "desc"] else "desc"
        self.offset = (self.page - 1) * self.limit

class PaginationMetadata(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool

class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = True
    data: List[T]
    pagination: PaginationMetadata

def build_pagination_metadata(total: int, page: int, limit: int) -> Dict[str, Any]:
    safe_limit = min(max(1, limit), 100)
    safe_page = max(1, page)
    total_pages = math.ceil(total / safe_limit) if safe_limit > 0 and total > 0 else 1
    return {
        "page": safe_page,
        "limit": safe_limit,
        "total": total,
        "total_pages": total_pages,
        "has_next": safe_page < total_pages,
        "has_prev": safe_page > 1
    }

def get_pagination_params(request=None):
    try:
        if request and hasattr(request, "query_params"):
            page = int(request.query_params.get('page', 1))
            per_page = int(request.query_params.get('per_page', request.query_params.get('limit', 10)))
        else:
            page = 1
            per_page = 10
    except (ValueError, TypeError):
        page = 1
        per_page = 10
    return page, per_page

def paginate_query(query, page=1, per_page=10):
    total = query.count() if hasattr(query, "count") else len(query)
    items = query.offset((page - 1) * per_page).limit(per_page).all() if hasattr(query, "offset") else query[(page-1)*per_page:page*per_page]
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page if per_page > 0 else 0
    }

