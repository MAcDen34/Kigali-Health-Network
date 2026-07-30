from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime, date
from typing import Optional, List


class DiagnosisCreate(BaseModel):
    patient_id:  UUID
    icd_code:    Optional[str] = None
    description: str
    notes:       Optional[str] = None

class DiagnosisOut(BaseModel):
    id:             UUID
    patient_id:     UUID
    doctor_id:      UUID
    institution_id: UUID
    icd_code:       Optional[str] = None
    description:    str
    notes:          Optional[str] = None
    created_at:     datetime
    model_config = ConfigDict(from_attributes=True)


class VitalsCreate(BaseModel):
    patient_id:    UUID
    blood_pressure: Optional[str] = None
    heart_rate:     Optional[str] = None
    temperature:    Optional[str] = None
    oxygen_sat:     Optional[str] = None
    notes:          Optional[str] = None

class VitalsOut(BaseModel):
    id:             UUID
    patient_id:     UUID
    recorded_by:    UUID
    institution_id: UUID
    blood_pressure: Optional[str] = None
    heart_rate:     Optional[str] = None
    temperature:    Optional[str] = None
    oxygen_sat:     Optional[str] = None
    notes:          Optional[str] = None
    recorded_at:    datetime
    model_config = ConfigDict(from_attributes=True)


class TreatmentPlanCreate(BaseModel):
    diagnosis_id:   UUID
    patient_id:     UUID
    plan:           dict
    follow_up_date: Optional[datetime] = None

class TreatmentPlanOut(BaseModel):
    id:             UUID
    diagnosis_id:   UUID
    patient_id:     UUID
    doctor_id:      UUID
    plan:           dict
    follow_up_date: Optional[datetime] = None
    created_at:     datetime
    model_config = ConfigDict(from_attributes=True)


class PrescriptionCreate(BaseModel):
    patient_id:    UUID
    drug_name:     str
    drug_code:     Optional[str] = None
    dosage:        str
    frequency:     Optional[str] = None
    duration_days: Optional[str] = None

class PrescriptionOut(BaseModel):
    id:             UUID
    patient_id:     UUID
    doctor_id:      UUID
    institution_id: UUID
    drug_name:      str
    drug_code:      Optional[str] = None
    dosage:         str
    frequency:      Optional[str] = None
    duration_days:  Optional[str] = None
    status:         str
    flag:           Optional[str] = None
    created_at:     datetime
    model_config = ConfigDict(from_attributes=True)


class InteractionFlagOut(BaseModel):
    prescription_id: UUID
    flag_type:       str   # interaction | allergy | duplicate
    message:         str
    severity:        str   # low | moderate | high
