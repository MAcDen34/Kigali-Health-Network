from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class ReminderOut(BaseModel):
    id: UUID
    patient_id: UUID
    prescription_id: UUID
    drug_code: str
    dosage: str
    acknowledged: bool
    created_at: datetime
    class Config:
        from_attributes = True
