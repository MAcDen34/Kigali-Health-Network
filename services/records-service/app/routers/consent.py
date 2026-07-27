from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from .. import models, schemas
from ..database import get_db
from datetime import datetime
from ..dependencies import get_current_actor
from ..audit import log_access


router = APIRouter(prefix="/api/records", tags=["consent"])

def log_consent_action(db: Session, actor_id: UUID, patient_id: UUID, action: str):
    log_access(db, actor_id, patient_id, action)


@router.post("/consents", response_model=schemas.ConsentOut)
def grant_consent(payload: schemas.ConsentGrantCreate, db: Session = Depends(get_db), actor_id: UUID = Depends(get_current_actor)):
    consent = models.ConsentGrant(**payload.dict())
    db.add(consent)
    db.commit()
    db.refresh(consent)
    log_consent_action(db, actor_id, payload.patient_id, "grant")
    return consent

@router.get("/consents/{patient_id}", response_model=schemas.ConsentOut)
def check_consent(patient_id: UUID, institution_id: UUID, db: Session = Depends(get_db), actor_id: UUID = Depends(get_current_actor)):
    consent = db.query(models.ConsentGrant).filter(
        models.ConsentGrant.patient_id == patient_id,
        models.ConsentGrant.institution_id == institution_id,
        models.ConsentGrant.revoked_at.is_(None)
    ).first()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")
    log_consent_action(db, actor_id, patient_id, "check")
    return consent

@router.get("/patients/{patient_id}/consents", response_model=List[schemas.ConsentOut])
def list_patient_consents(patient_id: UUID, db: Session = Depends(get_db), actor_id: UUID = Depends(get_current_actor)):
    if str(actor_id) != str(patient_id):
        raise HTTPException(status_code=403, detail="You can only view your own consents.")
    return db.query(models.ConsentGrant).filter(
        models.ConsentGrant.patient_id == patient_id
    ).order_by(models.ConsentGrant.granted_at.desc()).all()

@router.delete("/consents/{consent_id}")
def revoke_consent(consent_id: UUID, db: Session = Depends(get_db), actor_id: UUID = Depends(get_current_actor)):
    consent = db.query(models.ConsentGrant).filter(models.ConsentGrant.id == consent_id).first()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")
    log_consent_action(db, actor_id, consent.patient_id, "revoke")
    consent.revoked_at = datetime.utcnow()
    db.commit()
    db.refresh(consent)
    return {"message": "Consent revoked successfully"}
