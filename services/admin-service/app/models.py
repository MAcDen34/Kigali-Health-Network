"""
Admin Service models — admin.* schema
Owns: institutions, staff accounts, api_tokens, platform audit log.
"""
import uuid
import bcrypt
import secrets
import hashlib
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from .database import Base


class Institution(Base):
    __tablename__ = "institutions"
    __table_args__ = {"schema": "admin"}

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name       = Column(String, nullable=False)
    type       = Column(String, nullable=False)   # Hospital|Clinic|Pharmacy|Insurance
    staff_count= Column(Integer, default=0)
    api_token  = Column(String, nullable=True)    # SHA-256 hash of the raw token
    active     = Column(Boolean, default=False)   # starts False until admin approves
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def issue_token(self) -> str:
        """Generate a new raw token, store the hash, return the raw value once."""
        raw = secrets.token_urlsafe(32)
        self.api_token = hashlib.sha256(raw.encode()).hexdigest()
        return raw


class Staff(Base):
    __tablename__ = "staff"
    __table_args__ = {"schema": "admin"}

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("admin.institutions.id"), nullable=True)
    full_name      = Column(String, nullable=False)
    email          = Column(String, unique=True, nullable=False)
    password_hash  = Column(String, nullable=False)
    role           = Column(String, nullable=False)
    active         = Column(Boolean, default=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())

    def set_password(self, plain: str):
        self.password_hash = bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()

    def check_password(self, plain: str) -> bool:
        return bcrypt.checkpw(plain.encode(), self.password_hash.encode())


class PlatformAudit(Base):
    __tablename__ = "platform_audit"
    __table_args__ = {"schema": "admin"}

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id       = Column(UUID(as_uuid=True), nullable=False)
    actor_name     = Column(String)
    institution_id = Column(UUID(as_uuid=True), nullable=True)
    action         = Column(String, nullable=False)
    target         = Column(String)                  # e.g. "institution:uuid" or "staff:uuid"
    timestamp      = Column(DateTime(timezone=True), server_default=func.now())
