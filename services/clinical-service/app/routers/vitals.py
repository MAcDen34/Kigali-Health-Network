"""
Vitals router — /api/clinical/vitals
Nurses and Doctors can record vitals. Doctors can also view.

POST /vitals                          → record vitals (Doctor or Nurse)
GET  /patients/{patient_id}/vitals   → all vitals for a patient (consent-gated)
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from .. import models, schemas
from ..database import get_db
from ..dependencies import require_roles
from ..consent_check import assert_consent

router = APIRouter(prefix="/api/clinical", tags=["vitals"])


@router.post("/vitals", response_model=schemas.VitalsOut)
def record_vitals(
    payload: schemas.VitalsCreate,
    request: Request,
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["DOCTOR", "NURSE"]))
):
    """
    Record a new vitals entry for a patient.
    Available to both Doctors and Nurses (unlike diagnosis which is Doctor-only).
    Consent-gated.
    """
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    try:
        assert_consent(str(payload.patient_id), str(actor.institution_id), token)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        raise HTTPException(status_code=403, detail="No active consent for this patient.")

    vitals = models.Vitals(
        patient_id=payload.patient_id,
        recorded_by=actor.id,
        institution_id=actor.institution_id,
        blood_pressure=payload.blood_pressure,
        heart_rate=payload.heart_rate,
        temperature=payload.temperature,
        oxygen_sat=payload.oxygen_sat,
        notes=payload.notes,
    )
    db.add(vitals)
    db.commit()
    db.refresh(vitals)
    return vitals


@router.get("/patients/{patient_id}/vitals", response_model=List[schemas.VitalsOut])
def get_patient_vitals(
    patient_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["DOCTOR", "NURSE", "PLATFORM_ADMIN"]))
):
    if actor.role in ("DOCTOR", "NURSE"):
        token = request.headers.get("authorization", "").replace("Bearer ", "")
        try:
            assert_consent(str(patient_id), str(actor.institution_id), token)
        except RuntimeError as e:
            raise HTTPException(status_code=503, detail=str(e))
        except Exception:
            raise HTTPException(status_code=403, detail="No active consent for this patient.")

    return db.query(models.Vitals).filter(
        models.Vitals.patient_id == patient_id
    ).order_by(models.Vitals.recorded_at.desc()).all()
