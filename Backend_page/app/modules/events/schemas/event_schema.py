from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class CreateEventSchema(BaseModel):
    event_name: Optional[str] = None
    eventDetails: Optional[Dict[str, Any]] = None
    booking: Optional[Dict[str, Any]] = None
    layout: Optional[Dict[str, Any]] = None
    foodProvision: Optional[Dict[str, Any]] = None
    vehicleProvision: Optional[Dict[str, Any]] = None
    documents: Optional[Dict[str, Any]] = None
    termsDetails: Optional[Dict[str, Any]] = None
    vendorSponsor: Optional[Dict[str, Any]] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    venue: Optional[str] = None
    address: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = "OneTime"
    visibility: Optional[str] = "Public"

    class Config:
        extra = "allow"

class UpdateEventSchema(BaseModel):
    event_name: Optional[str] = None
    eventDetails: Optional[Dict[str, Any]] = None
    booking: Optional[Dict[str, Any]] = None
    layout: Optional[Dict[str, Any]] = None
    foodProvision: Optional[Dict[str, Any]] = None
    vehicleProvision: Optional[Dict[str, Any]] = None
    documents: Optional[Dict[str, Any]] = None
    termsDetails: Optional[Dict[str, Any]] = None
    vendorSponsor: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

    class Config:
        extra = "allow"

