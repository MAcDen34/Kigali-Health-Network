import uuid
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from .database import Base

class Reminder(Base):
    __tablename__ = "reminders"
    __table_args__ = {"schema": "notify"}

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id     = Column(UUID(as_uuid=True), nullable=False)
    prescription_id = Column(UUID(as_uuid=True), nullable=False)  # references pharmacy.prescriptions — no FK, cross-schema
    drug_code      = Column(String, nullable=False)
    dosage         = Column(String, nullable=False)
    acknowledged   = Column(Boolean, default=False)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
