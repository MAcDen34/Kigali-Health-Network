import uuid
from sqlalchemy import Column, String, Date, ForeignKey, DateTime, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from .database import Base

class Patient(Base):
    __tablename__ = "patients"
    __table_args__ = {"schema": "records"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    national_id = Column(String, unique=True, nullable=False)
    dob = Column(Date, nullable=False)
    blood_group = Column(String)
    allergies = Column(ARRAY(String), default=[])


class ConsentGrant(Base):
    __tablename__ = "consent_grants"
    __table_args__ = {"schema": "records"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("records.patients.id"), nullable=False)
    institution_id = Column(UUID(as_uuid=True), nullable=False)
    granted_at = Column(DateTime(timezone=True), server_default=func.now())
    revoked_at = Column(DateTime(timezone=True), nullable=True)


class MedicalRecord(Base):
    __tablename__ = "medical_records"
    __table_args__ = {"schema": "records"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("records.patients.id"), nullable=False)
    type = Column(String, nullable=False)
    content = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_log"
    __table_args__ = {"schema": "records"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id = Column(UUID(as_uuid=True), nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("records.patients.id"), nullable=False)
    action = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String)
