"""
Insurance Service models — insurance.* schema
Owns: claims (created either by an insurance agent directly, or automatically
when a prescription_created event arrives so coverage can be pre-validated).
"""
import uuid
from sqlalchemy import Column, String, DateTime, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from .database import Base


class Claim(Base):
    __tablename__ = "claims"
    __table_args__ = {"schema": "insurance"}

    id                  = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id          = Column(UUID(as_uuid=True), nullable=False)
    institution_id      = Column(UUID(as_uuid=True), nullable=True)
    prescription_id     = Column(UUID(as_uuid=True), nullable=True)
    submitted_by        = Column(UUID(as_uuid=True), nullable=True)   # insurance agent who last actioned it
    diagnosis_code      = Column(String, nullable=True)
    service_description = Column(String, nullable=True)
    amount              = Column(Numeric(12, 2), nullable=True)
    status              = Column(String, default="pending")          # pending|approved|denied|paid
    created_at          = Column(DateTime(timezone=True), server_default=func.now())
    updated_at          = Column(DateTime(timezone=True), onupdate=func.now())
