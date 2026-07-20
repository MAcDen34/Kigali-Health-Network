"""
Medical records router — /api/records/medical_records
POST /medical_records          → create a new record (Doctor/Nurse)
GET  /medical_records/{id}     → get single record by ID
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from .. import models, schemas
from ..database import get_db
from ..dependencies import require_roles
from ..audit import log_access

router = APIRouter(prefix="/api/records", tags=["medical_records"])


@router.post("/medical_records", response_model=schemas.MedicalRecordOut)
def create_medical_record(
    payload: schemas.MedicalRecordCreate,
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["DOCTOR", "NURSE"]))
):
    """
    Create a new medical record entry (diagnosis, lab result, vitals).
    Requires active consent for the actor's institution.
    Doctor and Nurse only.
    """
    # Consent gate
    active_consent = db.query(models.ConsentGrant).filter(
        models.ConsentGrant.patient_id == payload.patient_id,
        models.ConsentGrant.institution_id == actor.institution_id,
        models.ConsentGrant.revoked_at.is_(None)
    ).first()
    if not active_consent:
        raise HTTPException(
            status_code=403,
            detail="Access denied. Patient has not granted consent to your institution."
        )

    # Nurses can only create Vitals entries
    if actor.role == "NURSE" and payload.type not in ("Vitals", "vitals"):
        raise HTTPException(
            status_code=403,
            detail="Nurses may only record vitals. Diagnosis entries require a Doctor."
        )

    record = models.MedicalRecord(
        patient_id=payload.patient_id,
        type=payload.type,
        content=payload.content,
        institution_id=actor.institution_id,
        created_by=actor.id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    log_access(db, actor.id, payload.patient_id, f"created_{payload.type.lower()}_record")
    return record


@router.get("/medical_records/{record_id}", response_model=schemas.MedicalRecordOut)
def get_medical_record(
    record_id: UUID,
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["PLATFORM_ADMIN", "DOCTOR", "NURSE", "PATIENT"]))
):
    """Get a single medical record by ID."""
    record = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.id == record_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found.")
    return record
