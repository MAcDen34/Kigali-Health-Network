from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from .. import models, schemas
from ..database import get_db


router = APIRouter(prefix="/api/pharmacy", tags=["dispensing"])

@router.post("/dispensing", response_model=schemas.DispensingRecordOut)
def create_dispensing_record(payload: schemas.DispensingRecordCreate, db: Session = Depends(get_db)):
    prescription = db.query(models.Prescription).filter(models.Prescription.id == payload.prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    if prescription.status == "dispensed":
       raise HTTPException(status_code=400, detail="Prescription has already been dispensed")
    
    dispensing_record = models.DispensingRecord(**payload.dict())
    db.add(dispensing_record)
    db.commit()
    db.refresh(dispensing_record)

    prescription.status = "dispensed"
    db.commit()

    return dispensing_record

@router.get("/dispensing/{dispensing_id}", response_model=schemas.DispensingRecordOut)
def get_dispensing_record(dispensing_id: UUID, db: Session = Depends(get_db)):
    dispensing_record = db.query(models.DispensingRecord).filter(models.DispensingRecord.id == dispensing_id).first()
    if not dispensing_record:
        raise HTTPException(status_code=404, detail="Dispensing record not found")
    return dispensing_record

