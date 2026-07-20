"""
Patients router — /api/records/patients
GET  /patients                           → list all (admin/doctor only)
POST /patients                           → register new patient
GET  /patients/{id}                      → get single patient
GET  /patients/{id}/medical_records      → all records for a patient (consent-gated)
GET  /patients/{id}/consents             → all consent grants for a patient
GET  /patients/{id}/audit                → audit log for a patient
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional

from .. import models, schemas
from ..database import get_db
from ..dependencies import require_roles, get_current_actor
from ..audit import log_access

router = APIRouter(prefix="/api/records", tags=["patients"])


@router.get("/patients", response_model=List[schemas.PatientOut])
def list_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["PLATFORM_ADMIN", "DOCTOR", "NURSE"]))
):
    """
    List all registered patients.
    Accessible by: Platform Admin, Doctor, Nurse.
    Frontend uses this to populate the clinic patient list.
    """
    return db.query(models.Patient).offset(skip).limit(limit).all()


@router.post("/patients", response_model=schemas.PatientOut)
def create_patient(
    payload: schemas.PatientCreate,
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["PLATFORM_ADMIN"]))
):
    """Register a new patient in the system. Platform Admin only."""
    existing = db.query(models.Patient).filter(
        models.Patient.national_id == payload.national_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Patient with this national ID already exists.")

    patient = models.Patient(**payload.dict())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/patients/{patient_id}", response_model=schemas.PatientOut)
def get_patient(
    patient_id: UUID,
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["PLATFORM_ADMIN", "DOCTOR", "NURSE", "PATIENT"]))
):
    """
    Get a single patient profile.
    Patients can only access their own record (enforced by frontend routing).
    """
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")
    return patient


@router.get("/patients/{patient_id}/medical_records", response_model=List[schemas.MedicalRecordOut])
def get_patient_records(
    patient_id: UUID,
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["PLATFORM_ADMIN", "DOCTOR", "NURSE", "PATIENT"]))
):
    """
    List all medical records for a patient.

    CONSENT GATE: If the actor is a Doctor or Nurse, an active consent grant
    must exist for their institution before records are returned.
    Returns 403 if consent is not granted — fail-closed by design.
    """
    # Consent check for clinical staff
    if actor.role in ("DOCTOR", "NURSE"):
        active_consent = db.query(models.ConsentGrant).filter(
            models.ConsentGrant.patient_id == patient_id,
            models.ConsentGrant.institution_id == actor.institution_id,
            models.ConsentGrant.revoked_at.is_(None)
        ).first()
        if not active_consent:
            raise HTTPException(
                status_code=403,
                detail="Access denied. Patient has not granted consent to your institution."
            )

    log_access(db, actor.id, patient_id, "viewed_medical_records")
    return db.query(models.MedicalRecord).filter(
        models.MedicalRecord.patient_id == patient_id
    ).order_by(models.MedicalRecord.created_at.desc()).all()


@router.get("/patients/{patient_id}/consents", response_model=List[schemas.ConsentOut])
def get_patient_consents(
    patient_id: UUID,
    active_only: bool = Query(False),
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["PLATFORM_ADMIN", "PATIENT"]))
):
    """
    List all consent grants for a patient.
    Used by the patient portal consent management tab.
    Accessible by: the patient themselves and Platform Admin only.
    """
    query = db.query(models.ConsentGrant).filter(
        models.ConsentGrant.patient_id == patient_id
    )
    if active_only:
        query = query.filter(models.ConsentGrant.revoked_at.is_(None))
    return query.order_by(models.ConsentGrant.granted_at.desc()).all()


@router.get("/patients/{patient_id}/audit", response_model=List[schemas.AuditLogOut])
def get_patient_audit(
    patient_id: UUID,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["PLATFORM_ADMIN", "PATIENT"]))
):
    """
    Return the access audit log for a patient.
    This powers the 'Who has viewed your data' section in the patient portal.
    Accessible by: patient themselves and Platform Admin only.
    """
    return db.query(models.AuditLog).filter(
        models.AuditLog.patient_id == patient_id
    ).order_by(models.AuditLog.timestamp.desc()).limit(limit).all()
