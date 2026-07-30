from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from typing import Optional

ALLOWED_STATUSES = ["pending", "approved", "denied", "paid"]


class ClaimCreate(BaseModel):
    patient_id:          UUID
    institution_id:      Optional[UUID] = None
    diagnosis_code:      Optional[str] = None
    service_description: Optional[str] = None
    amount:              Optional[Decimal] = None


class ClaimOut(BaseModel):
    id:                  UUID
    patient_id:          UUID
    institution_id:      Optional[UUID] = None
    prescription_id:     Optional[UUID] = None
    submitted_by:        Optional[UUID] = None
    diagnosis_code:      Optional[str] = None
    service_description: Optional[str] = None
    amount:              Optional[Decimal] = None
    status:              str
    created_at:          datetime
    updated_at:          Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class ClaimStatusUpdate(BaseModel):
    status: str
    amount: Optional[Decimal] = None   # let an agent set/confirm the amount on approval
