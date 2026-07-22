"""
Clinical Service models — clinical.* schema
Owns: diagnoses, vitals, treatment_plans, prescriptions.
"""
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from .database import Base


class Diagnosis(Base):
    __tablename__ = "diagnoses"
    __table_args__ = {"schema": "clinical"}

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id     = Column(UUID(as_uuid=True), nullable=False)
    doctor_id      = Column(UUID(as_uuid=True), nullable=False)
    institution_id = Column(UUID(as_uuid=True), nullable=False)
    icd_code       = Column(String)
    description    = Column(Text, nullable=False)
    notes          = Column(Text)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())


class Vitals(Base):
    __tablename__ = "vitals"
    __table_args__ = {"schema": "clinical"}

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id     = Column(UUID(as_uuid=True), nullable=False)
    recorded_by    = Column(UUID(as_uuid=True), nullable=False)   # nurse or doctor id
    institution_id = Column(UUID(as_uuid=True), nullable=False)
    blood_pressure = Column(String)    # e.g. "138/89"
    heart_rate     = Column(String)    # e.g. "76 bpm"
    temperature    = Column(String)    # e.g. "36.7°C"
    oxygen_sat     = Column(String)    # e.g. "98%"
    notes          = Column(Text)
    recorded_at    = Column(DateTime(timezone=True), server_default=func.now())


class TreatmentPlan(Base):
    __tablename__ = "treatment_plans"
    __table_args__ = {"schema": "clinical"}

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    diagnosis_id   = Column(UUID(as_uuid=True), ForeignKey("clinical.diagnoses.id"), nullable=False)
    patient_id     = Column(UUID(as_uuid=True), nullable=False)
    doctor_id      = Column(UUID(as_uuid=True), nullable=False)
    plan           = Column(JSONB)
    follow_up_date = Column(DateTime(timezone=True), nullable=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())


class Prescription(Base):
    __tablename__ = "prescriptions"
    __table_args__ = {"schema": "clinical"}

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id     = Column(UUID(as_uuid=True), nullable=False)
    doctor_id      = Column(UUID(as_uuid=True), nullable=False)
    institution_id = Column(UUID(as_uuid=True), nullable=False)
    drug_name      = Column(String, nullable=False)
    drug_code      = Column(String)
    dosage         = Column(String, nullable=False)
    frequency      = Column(String)
    duration_days  = Column(String)
    status         = Column(String, default="active")  # active|dispensed|cancelled|flagged
    flag           = Column(String, nullable=True)      # interaction|allergy|duplicate
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
