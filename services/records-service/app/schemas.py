from pydantic import BaseModel
from uuid import UUID
from datetime import date, datetime
from typing import Optional

class PatientCreate(BaseModel):
    national_id: str
    dob: date
    blood_group: Optional[str] = None
    allergies: list[str] = []

class PatientOut(PatientCreate):
    id: UUID
    class Config:
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
        from_attributes = True
