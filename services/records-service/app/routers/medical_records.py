from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from .. import models, schemas
from ..database import get_db


router = APIRouter(prefix="/api/records", tags=["medical_records"])

@router.post("/medical_records", response_model=schemas.MedicalRecordOut)
def create_medical_record(payload: schemas.MedicalRecordCreate, db: Session = Depends(get_db)):
    medical_record = models.MedicalRecord(**payload.dict())
    db.add(medical_record)
    db.commit()
    db.refresh(medical_record)
    return medical_record

@router.get("/medical_records/{record_id}", response_model=schemas.MedicalRecordOut)
def get_medical_record(record_id: UUID, db: Session = Depends(get_db)):
    medical_record = db.query(models.MedicalRecord).filter(models.MedicalRecord.id == record_id).first()
    if not medical_record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return medical_record
