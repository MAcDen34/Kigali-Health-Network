import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from .database import Base

class Prescription(Base):
    __tablename__ = "prescriptions"
    __table_args__ = {"schema": "pharmacy"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    record_id = Column(UUID(as_uuid=True), nullable=False)  # references records.medical_records — no FK, cross-schema boundary
    patient_id = Column(UUID(as_uuid=True), nullable=True)  # denormalised from the medical record for display purposes
    doctor_id = Column(UUID(as_uuid=True), nullable=False)
    drug_code = Column(String, nullable=False)
    dosage = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending / dispensed / cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DispensingRecord(Base):
    __tablename__ = "dispensing_records"
    __table_args__ = {"schema": "pharmacy"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prescription_id = Column(UUID(as_uuid=True), ForeignKey("pharmacy.prescriptions.id"), nullable=False)
    pharmacy_id = Column(UUID(as_uuid=True), nullable=False)
    dispensed_at = Column(DateTime(timezone=True), server_default=func.now())


class InteractionFlag(Base):
    __tablename__ = "interaction_flags"
    __table_args__ = {"schema": "pharmacy"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prescription_id = Column(UUID(as_uuid=True), ForeignKey("pharmacy.prescriptions.id"), nullable=False)
    conflict_drug = Column(String, nullable=False)
    severity = Column(String, nullable=False)  # low / moderate / high
    created_at = Column(DateTime(timezone=True), server_default=func.now())
