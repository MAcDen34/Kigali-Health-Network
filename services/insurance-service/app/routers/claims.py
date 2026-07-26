"""
Claims router — /api/insurance/claims
Insurance Agent (and Platform Admin) only.

POST  /claims                              → create a claim manually
GET   /claims/{id}                         → get single claim
GET   /claims                              → list all claims
GET   /patients/{patient_id}/claims        → list claims for a patient
PATCH /claims/{id}/status                  → approve / deny / mark paid

Claims can also be created automatically — see app/consumer.py, which listens
for 'prescription_created' events on the same Redis stream pharmacy-service
publishes to, and opens a pending claim so coverage can be pre-validated
before the patient ever asks about it.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from .. import models, schemas
from ..database import get_db
from ..dependencies import require_roles

router = APIRouter(prefix="/api/insurance", tags=["claims"])

# A claim can only move forward, never sideways or backward once decided.
ALLOWED_TRANSITIONS = {
    "pending":  {"approved", "denied"},
    "approved": {"paid"},
    "denied":   set(),
    "paid":     set(),
}


@router.post("/claims", response_model=schemas.ClaimOut)
def create_claim(
    payload: schemas.ClaimCreate,
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["INSURANCE_AGENT", "PLATFORM_ADMIN"])),
):
    claim = models.Claim(
        patient_id=payload.patient_id,
        institution_id=payload.institution_id,
        diagnosis_code=payload.diagnosis_code,
        service_description=payload.service_description,
        amount=payload.amount,
        submitted_by=actor.id,
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim


@router.get("/claims/{claim_id}", response_model=schemas.ClaimOut)
def get_claim(
    claim_id: UUID,
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["INSURANCE_AGENT", "PLATFORM_ADMIN"])),
):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")
    return claim


@router.get("/claims", response_model=List[schemas.ClaimOut])
def list_claims(
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["INSURANCE_AGENT", "PLATFORM_ADMIN"])),
):
    return db.query(models.Claim).order_by(models.Claim.created_at.desc()).all()


@router.get("/patients/{patient_id}/claims", response_model=List[schemas.ClaimOut])
def list_patient_claims(
    patient_id: UUID,
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["INSURANCE_AGENT", "PLATFORM_ADMIN"])),
):
    # NOTE: patients cannot view their own claims yet — self-service viewing
    # is a reasonable next-phase addition, not implemented in this first pass.
    return db.query(models.Claim).filter(
        models.Claim.patient_id == patient_id
    ).order_by(models.Claim.created_at.desc()).all()


@router.patch("/claims/{claim_id}/status", response_model=schemas.ClaimOut)
def update_claim_status(
    claim_id: UUID,
    payload: schemas.ClaimStatusUpdate,
    db: Session = Depends(get_db),
    actor=Depends(require_roles(["INSURANCE_AGENT", "PLATFORM_ADMIN"])),
):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found.")

    if payload.status not in schemas.ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail=f"Status must be one of {schemas.ALLOWED_STATUSES}.")

    if payload.status not in ALLOWED_TRANSITIONS[claim.status]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot move a claim from '{claim.status}' to '{payload.status}'.",
        )

    claim.status = payload.status
    claim.submitted_by = actor.id
    if payload.amount is not None:
        claim.amount = payload.amount
    db.commit()
    db.refresh(claim)
    return claim
