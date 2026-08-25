from pydantic import BaseModel, Field
from typing import Optional

class RegisterSchema(BaseModel):
    name: str = Field(..., min_length=2)
    email: str
    password: str = Field(..., min_length=6)
    role: str = Field(default="visitor")

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
