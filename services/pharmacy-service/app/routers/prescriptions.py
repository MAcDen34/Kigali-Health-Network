from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/pharmacy", tags=["prescriptions"])

@router.post("/prescriptions", response_model=schemas.PrescriptionOut)
def create_prescription(payload: schemas.PrescriptionCreate, db: Session = Depends(get_db)):
    prescription = models.Prescription(**payload.dict())
    db.add(prescription)
    db.commit()
    db.refresh(prescription)
    return prescription

@router.get("/prescriptions/{prescription_id}", response_model=schemas.PrescriptionOut)
def get_prescription(prescription_id: UUID, db: Session = Depends(get_db)):
    prescription = db.query(models.Prescription).filter(models.Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return prescription
