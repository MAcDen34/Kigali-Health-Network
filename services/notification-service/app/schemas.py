from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class ReminderOut(BaseModel):
    id: UUID
    patient_id: UUID
    prescription_id: UUID
    drug_code: str
    dosage: str
    interval_hours: int
    next_due_at: datetime
    last_notified_at: Optional[datetime] = None
    notified_count: int
    acknowledged: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
