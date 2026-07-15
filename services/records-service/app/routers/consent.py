from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from .. import models, schemas
from ..database import get_db
from datetime import datetime

router = APIRouter(prefix="/api/records", tags=["consent"])

@router.post("/consents", response_model=schemas.ConsentOut)
def grant_consent(payload: schemas.ConsentGrantCreate, db: Session = Depends(get_db)):
    consent = models.ConsentGrant(**payload.dict())
    db.add(consent)
    db.commit()
    db.refresh(consent)
    return consent

@router.get("/consents/{patient_id}", response_model=schemas.ConsentOut)
def check_consent(patient_id: UUID, institution_id: UUID, db: Session = Depends(get_db)):
    consent = db.query(models.ConsentGrant).filter(
        models.ConsentGrant.patient_id == patient_id,
        models.ConsentGrant.institution_id == institution_id,
        models.ConsentGrant.revoked_at.is_(None)
    ).first()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")
    return consent

@router.delete("/consents/{consent_id}")
def revoke_consent(consent_id: UUID, db: Session = Depends(get_db)):
    consent = db.query(models.ConsentGrant).filter(models.ConsentGrant.id == consent_id).first()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")
    consent.revoked_at = datetime.utcnow()
    db.commit()
    db.refresh(consent)
    return {"message": "Consent revoked successfully"}
