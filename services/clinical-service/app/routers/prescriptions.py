"""
Prescriptions router — /api/clinical/prescriptions
Doctor only for creation. After saving, a Redis event fires so Pharmacy and
Insurance Services can react asynchronously.

POST /prescriptions                          → create (Doctor only, consent-gated)
GET  /prescriptions/{id}                     → get single
GET  /patients/{patient_id}/prescriptions   → list for a patient (consent-gated)
PATCH /prescriptions/{id}/cancel            → cancel a prescription (Doctor)
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
import json, os

from .. import models, schemas
from ..database import get_db
from ..dependencies import require_roles, get_current_actor
from ..consent_check import assert_consent

router = APIRouter(prefix="/api/clinical", tags=["prescriptions"])

# Redis publisher (gracefully skipped if Redis not available in dev)
def publish_prescription_event(prescription_id: str, patient_id: str, drug_name: str):
    try:
        import redis
        r = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))
        r.publish("prescription_created", json.dumps({
            "prescription_id": prescription_id,
            "patient_id":      patient_id,
            "drug_name":       drug_name,
        }))
    except Exception:
        pass  # Redis unavailable in dev — log and continue


@router.post("/prescriptions", response_model=schemas.PrescriptionOut)
def create_prescription(
    payload: schemas.PrescriptionCreate,
    request: Request,
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["DOCTOR"]))
):
    """
    Create a new prescription. Doctor only.

    Flow:
    1. Consent gate (sync call to Records Service).
    2. Save prescription to clinical.prescriptions.
    3. Publish 'prescription_created' event to Redis.
       → Pharmacy Service picks it up to run interaction/duplicate checks.
       → Insurance Service picks it up to pre-validate coverage.
       → Notification Service picks it up to SMS/email the patient.
    """
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    try:
        assert_consent(str(payload.patient_id), str(actor.institution_id), token)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        raise HTTPException(status_code=403, detail="No active consent for this patient.")

    rx = models.Prescription(
        patient_id=payload.patient_id,
        doctor_id=actor.id,
        institution_id=actor.institution_id,
        drug_name=payload.drug_name,
        drug_code=payload.drug_code,
        dosage=payload.dosage,
        frequency=payload.frequency,
        duration_days=payload.duration_days,
    )
    db.add(rx)
    db.commit()
    db.refresh(rx)

    # Async: publish event so Pharmacy, Insurance, Notification react
    publish_prescription_event(str(rx.id), str(rx.patient_id), rx.drug_name)

    return rx


@router.get("/prescriptions/{rx_id}", response_model=schemas.PrescriptionOut)
def get_prescription(
    rx_id: UUID,
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["DOCTOR", "NURSE", "PHARMACIST", "PLATFORM_ADMIN"]))
):
    rx = db.query(models.Prescription).filter(models.Prescription.id == rx_id).first()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found.")
    return rx


@router.get("/patients/{patient_id}/prescriptions", response_model=List[schemas.PrescriptionOut])
def get_patient_prescriptions(
    patient_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["DOCTOR", "NURSE", "PHARMACIST", "PLATFORM_ADMIN"]))
):
    if actor.role in ("DOCTOR", "NURSE", "PHARMACIST"):
        token = request.headers.get("authorization", "").replace("Bearer ", "")
        try:
            assert_consent(str(patient_id), str(actor.institution_id), token)
        except RuntimeError as e:
            raise HTTPException(status_code=503, detail=str(e))
        except Exception:
            raise HTTPException(status_code=403, detail="No active consent for this patient.")

    return db.query(models.Prescription).filter(
        models.Prescription.patient_id == patient_id
    ).order_by(models.Prescription.created_at.desc()).all()


@router.patch("/prescriptions/{rx_id}/cancel")
def cancel_prescription(
    rx_id: UUID,
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["DOCTOR"]))
):
    """Cancel an active prescription. Doctor only."""
    rx = db.query(models.Prescription).filter(models.Prescription.id == rx_id).first()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found.")
    if rx.status == "dispensed":
        raise HTTPException(status_code=400, detail="Cannot cancel a prescription that has already been dispensed.")
    rx.status = "cancelled"
    db.commit()
    return {"message": "Prescription cancelled.", "id": str(rx_id)}
