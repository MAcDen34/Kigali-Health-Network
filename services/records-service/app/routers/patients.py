from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_actor

router = APIRouter(prefix="/api/records", tags=["patients"])

@router.get("/patients", response_model=List[schemas.PatientOut])
def list_patients(db: Session = Depends(get_db), actor_id: str = Depends(get_current_actor)):
    """Requires any valid, authenticated session (staff or patient) — no anonymous access to patient PII."""
    return db.query(models.Patient).filter(models.Patient.active == True).all()

@router.post("/patients", response_model=schemas.PatientOut)
def create_patient(payload: schemas.PatientCreate, db: Session = Depends(get_db)):
    patient = models.Patient(**payload.dict())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

@router.get("/patients/{patient_id}", response_model=schemas.PatientOut)
def get_patient(patient_id: UUID, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient
