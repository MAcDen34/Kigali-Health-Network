from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List


class InstitutionCreate(BaseModel):
    name: str
    type: str   # Hospital | Clinic | Pharmacy | Insurance

class InstitutionOut(BaseModel):
    id:          UUID
    name:        str
    type:        str
    staff_count: int
    active:      bool
    created_at:  datetime
    class Config: from_attributes = True

class InstitutionUpdate(BaseModel):
    name:   Optional[str] = None
    type:   Optional[str] = None
    active: Optional[bool] = None


class StaffCreate(BaseModel):
    full_name:      str
    email:          str
    password:       str
    role:           str
    institution_id: Optional[UUID] = None

class StaffOut(BaseModel):
    id:             UUID
    full_name:      str
    email:          str
    role:           str
    institution_id: Optional[UUID] = None
    active:         bool
    created_at:     datetime
    class Config: from_attributes = True

class StaffUpdate(BaseModel):
    full_name:      Optional[str] = None
    role:           Optional[str] = None
    institution_id: Optional[UUID] = None
    active:         Optional[bool] = None


class TokenIssueResponse(BaseModel):
    institution_id: UUID
    raw_token: str   # shown ONCE — client must store it
    message: str = "Store this token securely. It will not be shown again."


class PlatformAuditOut(BaseModel):
    id:             UUID
    actor_id:       UUID
    actor_name:     Optional[str] = None
    institution_id: Optional[UUID] = None
    action:         str
    target:         Optional[str] = None
    timestamp:      datetime
    class Config: from_attributes = True


class ServiceHealthOut(BaseModel):
    service:  str
    port:     int
    status:   str
    latency:  Optional[int] = None
    uptime:   Optional[str] = None
