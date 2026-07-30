from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class PrescriptionCreate(BaseModel):
    record_id: UUID
    doctor_id: UUID
    drug_code: str
    dosage: str
    patient_id: Optional[UUID] = None

class PrescriptionOut(PrescriptionCreate):
    id: UUID
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class DispensingRecordCreate(BaseModel):
    prescription_id: UUID
    pharmacy_id: UUID

class DispensingRecordOut(DispensingRecordCreate):
    id: UUID
    dispensed_at: datetime
    model_config = ConfigDict(from_attributes=True)

class InteractionFlagCreate(BaseModel):
    prescription_id: UUID
    conflict_drug: str
    severity: str

class InteractionFlagOut(InteractionFlagCreate):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
