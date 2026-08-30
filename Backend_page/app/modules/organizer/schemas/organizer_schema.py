from pydantic import BaseModel, EmailStr
from typing import Optional, List

class OrganizerKycSubmitSchema(BaseModel):
    company_name: str
    gst_number: str
    pan_number: str
    bank_account_number: str
    ifsc_code: str
    bank_name: str
    account_holder_name: str

class OrganizerProfileSchema(BaseModel):
    name: str
    email: EmailStr
    mobile: Optional[str] = ""
    company_name: Optional[str] = ""
