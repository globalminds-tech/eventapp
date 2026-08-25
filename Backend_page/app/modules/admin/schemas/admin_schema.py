from pydantic import BaseModel, Field
from typing import Optional, List, Union

class UpdateEventStatusSchema(BaseModel):
    status: str = Field(..., description="APPROVED, REJECTED, PENDING")

class CategorySchema(BaseModel):
    name: str = Field(..., min_length=1)
    subcategories: Optional[Union[str, List[str]]] = ""
    icon_name: Optional[str] = "Tag"
    status: Optional[str] = "Active"

class UpdateKycStatusSchema(BaseModel):
    status: str = Field(..., description="VERIFIED, REJECTED, PENDING")
