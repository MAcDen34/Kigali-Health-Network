from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from .. import models, schemas
from ..database import get_db
from ..events import publish_prescription_created

router = APIRouter(prefix="/api/pharmacy", tags=["prescriptions"])

@router.get("/prescriptions", response_model=List[schemas.PrescriptionOut])
def list_prescriptions(db: Session = Depends(get_db)):
    """List all prescriptions — used by the Pharmacist's full queue view."""
    return db.query(models.Prescription).order_by(models.Prescription.created_at.desc()).all()

@router.post("/prescriptions", response_model=schemas.PrescriptionOut)
def create_prescription(payload: schemas.PrescriptionCreate, db: Session = Depends(get_db)):
    prescription = models.Prescription(**payload.dict())
    db.add(prescription)
    db.commit()
    db.refresh(prescription)

    publish_prescription_created(prescription)

    return prescription

@router.get("/prescriptions/{prescription_id}", response_model=schemas.PrescriptionOut)
def get_prescription(prescription_id: UUID, db: Session = Depends(get_db)):
    prescription = db.query(models.Prescription).filter(models.Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return prescription

@router.get("/patients/{patient_id}/prescriptions", response_model=List[schemas.PrescriptionOut])
def list_patient_prescriptions(patient_id: UUID, db: Session = Depends(get_db)):
    """List prescriptions for one patient — used by the Doctor/Nurse Clinic view."""
    return db.query(models.Prescription).filter(
        models.Prescription.record_id == patient_id
    ).order_by(models.Prescription.created_at.desc()).all()
