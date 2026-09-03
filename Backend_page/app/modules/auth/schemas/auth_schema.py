from pydantic import BaseModel, Field
from typing import Optional

class RegisterSchema(BaseModel):
    name: str = Field(..., min_length=2)
    email: str
    password: str = Field(..., min_length=6)
    role: str = Field(default="user")

class OrganizerRegisterSchema(BaseModel):
    # Step 1: Contact
    name: str = Field(..., min_length=2)
    email: str
    password: Optional[str] = ""
    mobile: Optional[str] = None
    
    # Step 2: Legal/Business
    company_name: str
    business_type: Optional[str] = None
    gstin: Optional[str] = None
    pan_number: Optional[str] = None
    business_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    website_url: Optional[str] = None

    # Step 3: Payout Bank
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    account_holder: Optional[str] = None
    upi_id: Optional[str] = None

class ExhibitorRegisterSchema(BaseModel):
    # Step 1: Contact
    name: str = Field(..., min_length=2)
    email: str
    password: Optional[str] = ""
    mobile: Optional[str] = None

    # Step 2: Legal/Business
    company_name: str
    vendor_category: Optional[str] = None
    gstin: Optional[str] = None
    pan_number: Optional[str] = None
    business_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    website_url: Optional[str] = None

    # Step 3: Financial & Refund
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    account_holder: Optional[str] = None
    upi_id: Optional[str] = None

class UpgradeOrganizerStep1Schema(BaseModel):
    company_name: str
    business_type: Optional[str] = None
    gstin: Optional[str] = None
    pan_number: Optional[str] = None
    business_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    website_url: Optional[str] = None
    mobile: Optional[str] = None

class UpgradeOrganizerCompleteSchema(BaseModel):
    company_name: Optional[str] = None
    business_type: Optional[str] = None
    gstin: Optional[str] = None
    pan_number: Optional[str] = None
    business_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    website_url: Optional[str] = None
    mobile: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    account_holder: Optional[str] = None
    upi_id: Optional[str] = None

class UpgradeExhibitorStep1Schema(BaseModel):
    company_name: str
    vendor_category: Optional[str] = None
    gstin: Optional[str] = None
    pan_number: Optional[str] = None
    business_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    website_url: Optional[str] = None
    mobile: Optional[str] = None

class UpgradeExhibitorCompleteSchema(BaseModel):
    company_name: Optional[str] = None
    vendor_category: Optional[str] = None
    gstin: Optional[str] = None
    pan_number: Optional[str] = None
    business_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    website_url: Optional[str] = None
    mobile: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    account_holder: Optional[str] = None
    upi_id: Optional[str] = None

class LoginSchema(BaseModel):
    email: str
    password: str

class SendOTPSchema(BaseModel):
    email: str

class VerifyOTPSchema(BaseModel):
    email: str
    otp: str

class ResetPasswordSchema(BaseModel):
    email: str
    password: str = Field(..., min_length=6)


