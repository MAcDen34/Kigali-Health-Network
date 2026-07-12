from pydantic import BaseModel, Field
from uuid import UUID
from datetime import date, datetime
from typing import Optional

class PatientCreate(BaseModel):
    national_id: str
    dob: date
    blood_group: Optional[str] = None
    allergies: list[str] = Field(default_factory=list)

class PatientOut(PatientCreate):
    id: UUID
    class Config:
        orm_mode = True
        # allow compatibility with pydantic v2 attribute loading
        from_attributes = True

class ConsentGrantCreate(BaseModel):
    patient_id: UUID
    institution_id: UUID

class ConsentOut(BaseModel):
    id: UUID
    patient_id: UUID
    institution_id: UUID
    granted_at: datetime
    revoked_at: Optional[datetime]
    class Config:
        orm_mode = True
        # allow compatibility with pydantic v2 attribute loading
        from_attributes = True
