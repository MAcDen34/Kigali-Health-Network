from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/notifications", tags=["reminders"])

@router.get("/reminders/{patient_id}", response_model=List[schemas.ReminderOut])
def get_reminders_for_patient(patient_id: UUID, db: Session = Depends(get_db)):
    return db.query(models.Reminder).filter(models.Reminder.patient_id == patient_id).all()
