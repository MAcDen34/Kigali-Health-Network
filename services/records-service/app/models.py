"""
SQLAlchemy ORM models for the Records & Consent Service.
All tables live in the 'records' schema (records.*).
"""
import uuid
import bcrypt
from sqlalchemy import Column, String, Date, ForeignKey, DateTime, Boolean, ARRAY, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from .database import Base


class Institution(Base):
    """
    Registered healthcare institutions on the platform.
    Managed by the Admin Service — replicated here for FK references.
    """
    __tablename__ = "institutions"
    __table_args__ = {"schema": "records"}

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name         = Column(String, nullable=False)
    type         = Column(String, nullable=False)   # Hospital | Clinic | Pharmacy | Insurance
    api_token    = Column(String)                   # SHA-256 hashed
    active       = Column(Boolean, default=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())


class Staff(Base):
    """
    All users of the system: doctors, nurses, pharmacists, insurance agents,
    platform admins. Patients have their own table below.
    """
    __tablename__ = "staff"
    __table_args__ = {"schema": "records"}

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id  = Column(UUID(as_uuid=True), ForeignKey("records.institutions.id"), nullable=True)
    full_name       = Column(String, nullable=False)
    email           = Column(String, unique=True, nullable=False)
    password_hash   = Column(String, nullable=False)
    role            = Column(String, nullable=False)
    # PLATFORM_ADMIN | DOCTOR | NURSE | PHARMACIST | INSURANCE_AGENT
    active          = Column(Boolean, default=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    def set_password(self, plain: str):
        self.password_hash = bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()

    def check_password(self, plain: str) -> bool:
        return bcrypt.checkpw(plain.encode(), self.password_hash.encode())


class Patient(Base):
    __tablename__ = "patients"
    __table_args__ = {"schema": "records"}

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    national_id = Column(String, unique=True, nullable=False)
    full_name   = Column(String, nullable=False)
    dob         = Column(Date, nullable=False)
    blood_group = Column(String)
    allergies   = Column(ARRAY(String), default=[])
    phone       = Column(String)
    address     = Column(String)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())


class ConsentGrant(Base):
    __tablename__ = "consent_grants"
    __table_args__ = {"schema": "records"}

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id     = Column(UUID(as_uuid=True), ForeignKey("records.patients.id"), nullable=False)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("records.institutions.id"), nullable=False)
    granted_at     = Column(DateTime(timezone=True), server_default=func.now())
    revoked_at     = Column(DateTime(timezone=True), nullable=True)


class MedicalRecord(Base):
    __tablename__ = "medical_records"
    __table_args__ = {"schema": "records"}

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id     = Column(UUID(as_uuid=True), ForeignKey("records.patients.id"), nullable=False)
    institution_id = Column(UUID(as_uuid=True), nullable=True)
    created_by     = Column(UUID(as_uuid=True), nullable=True)   # staff.id
    type           = Column(String, nullable=False)               # Diagnosis | Lab Result | Vitals
    content        = Column(JSONB)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_log"
    __table_args__ = {"schema": "records"}

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id   = Column(UUID(as_uuid=True), nullable=False)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("records.patients.id"), nullable=False)
    action     = Column(String, nullable=False)
    timestamp  = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String)
