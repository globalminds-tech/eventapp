from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "visitor"

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class OTPSendSchema(BaseModel):
    email: EmailStr

class OTPVerifySchema(BaseModel):
    email: EmailStr
    otp: str

class PasswordResetSchema(BaseModel):
    email: EmailStr
    password: str
