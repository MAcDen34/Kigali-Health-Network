"""
Diagnoses router — /api/clinical/diagnoses
Doctor only (except GET which nurses can also access).

POST /diagnoses                         → create new diagnosis (Doctor)
GET  /diagnoses/{id}                    → get single diagnosis
GET  /patients/{patient_id}/diagnoses  → all diagnoses for a patient (consent-gated)
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from .. import models, schemas
from ..database import get_db
from ..dependencies import require_roles, get_current_actor
from ..consent_check import assert_consent

router = APIRouter(prefix="/api/clinical", tags=["diagnoses"])


@router.post("/diagnoses", response_model=schemas.DiagnosisOut)
def create_diagnosis(
    payload: schemas.DiagnosisCreate,
    request: Request,
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["DOCTOR"]))
):
    """
    Create a new diagnosis entry.
    CONSENT GATE: Records Service is called first to verify active consent.
    Doctor only — Nurses cannot create diagnosis entries.

    After saving, publishes a 'diagnosis_created' event to Redis so
    the Notification Service can alert the patient (next sprint).
    """
    # Consent gate — calls Records Service
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    try:
        assert_consent(str(payload.patient_id), str(actor.institution_id), token)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        raise HTTPException(status_code=403, detail="No active consent for this patient.")

    diagnosis = models.Diagnosis(
        patient_id=payload.patient_id,
        doctor_id=actor.id,
        institution_id=actor.institution_id,
        icd_code=payload.icd_code,
        description=payload.description,
        notes=payload.notes,
    )
    db.add(diagnosis)
    db.commit()
    db.refresh(diagnosis)
    return diagnosis


@router.get("/diagnoses/{diagnosis_id}", response_model=schemas.DiagnosisOut)
def get_diagnosis(
    diagnosis_id: UUID,
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["DOCTOR", "NURSE", "PLATFORM_ADMIN"]))
):
    diag = db.query(models.Diagnosis).filter(models.Diagnosis.id == diagnosis_id).first()
    if not diag:
        raise HTTPException(status_code=404, detail="Diagnosis not found.")
    return diag


@router.get("/patients/{patient_id}/diagnoses", response_model=List[schemas.DiagnosisOut])
def get_patient_diagnoses(
    patient_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["DOCTOR", "NURSE", "PLATFORM_ADMIN"]))
):
    """
    List all diagnoses for a patient.
    Consent-gated for Doctor/Nurse — calls Records Service.
    """
    if actor.role in ("DOCTOR", "NURSE"):
        token = request.headers.get("authorization", "").replace("Bearer ", "")
        try:
            assert_consent(str(patient_id), str(actor.institution_id), token)
        except RuntimeError as e:
            raise HTTPException(status_code=503, detail=str(e))
        except Exception:
            raise HTTPException(status_code=403, detail="No active consent for this patient.")

    return db.query(models.Diagnosis).filter(
        models.Diagnosis.patient_id == patient_id
    ).order_by(models.Diagnosis.created_at.desc()).all()
