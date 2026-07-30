from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import date, datetime
from typing import Optional

class PatientCreate(BaseModel):
    full_name: str
    national_id: str
    dob: date
    blood_group: Optional[str] = None
    allergies: list[str] = []

class PatientOut(PatientCreate):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class ConsentGrantCreate(BaseModel):
    patient_id: UUID
    institution_id: UUID

class ConsentOut(BaseModel):
    id: UUID
    patient_id: UUID
    institution_id: UUID
    granted_at: datetime
    revoked_at: Optional[datetime]
    model_config = ConfigDict(from_attributes=True)

class MedicalRecordCreate(BaseModel):
    patient_id: UUID
    type: str
    content: dict

class MedicalRecordOut(MedicalRecordCreate):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AuditLogOut(BaseModel):
    id: UUID
    actor_id: UUID
    patient_id: UUID
    action: str
    timestamp: datetime
    ip_address: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)
