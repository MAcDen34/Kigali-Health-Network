"""
Pydantic v2 schemas for the Records & Consent Service.
Input schemas validate incoming requests.
Output schemas control what gets serialised back to the client.
"""
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import date, datetime
from typing import Optional, List


# ── Auth ──────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str
    institution_id: Optional[str] = None
    institution: Optional[str] = None


# ── Staff ─────────────────────────────────────────────────────────────────

class StaffCreate(BaseModel):
    full_name:      str
    email:          str
    password:       str
    role:           str   # DOCTOR | NURSE | PHARMACIST | INSURANCE_AGENT | PLATFORM_ADMIN
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


# ── Patient ───────────────────────────────────────────────────────────────

class PatientCreate(BaseModel):
    national_id: str
    full_name:   str
    dob:         date
    blood_group: Optional[str] = None
    allergies:   List[str] = []
    phone:       Optional[str] = None
    address:     Optional[str] = None

class PatientOut(PatientCreate):
    id:         UUID
    created_at: datetime
    class Config: from_attributes = True


# ── Consent ───────────────────────────────────────────────────────────────

class ConsentGrantCreate(BaseModel):
    patient_id:     UUID
    institution_id: UUID

class ConsentOut(BaseModel):
    id:             UUID
    patient_id:     UUID
    institution_id: UUID
    granted_at:     datetime
    revoked_at:     Optional[datetime] = None
    class Config: from_attributes = True


# ── Medical records ───────────────────────────────────────────────────────

class MedicalRecordCreate(BaseModel):
    patient_id: UUID
    type:       str   # Diagnosis | Lab Result | Vitals
    content:    dict  # flexible JSONB — e.g. { detail: "...", icd_code: "I10" }

class MedicalRecordOut(BaseModel):
    id:             UUID
    patient_id:     UUID
    institution_id: Optional[UUID] = None
    created_by:     Optional[UUID] = None
    type:           str
    content:        dict
    created_at:     datetime
    class Config: from_attributes = True


# ── Audit log ─────────────────────────────────────────────────────────────

class AuditLogOut(BaseModel):
    id:         UUID
    actor_id:   UUID
    patient_id: UUID
    action:     str
    timestamp:  datetime
    ip_address: Optional[str] = None
    class Config: from_attributes = True


# ── Institution ───────────────────────────────────────────────────────────

class InstitutionCreate(BaseModel):
    name: str
    type: str   # Hospital | Clinic | Pharmacy | Insurance

class InstitutionOut(BaseModel):
    id:         UUID
    name:       str
    type:       str
    active:     bool
    created_at: datetime
    class Config: from_attributes = True
