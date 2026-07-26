from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timedelta, timezone
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/notifications", tags=["reminders"])

@router.get("/reminders/{patient_id}", response_model=List[schemas.ReminderOut])
def get_reminders_for_patient(patient_id: UUID, db: Session = Depends(get_db)):
    return db.query(models.Reminder).filter(models.Reminder.patient_id == patient_id).all()


@router.get("/due", response_model=List[schemas.ReminderOut])
def get_due_reminders(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    return db.query(models.Reminder).filter(models.Reminder.next_due_at <= now).all()


@router.patch("/reminders/{reminder_id}/acknowledge", response_model=schemas.ReminderOut)
def acknowledge_reminder(reminder_id: UUID, db: Session = Depends(get_db)):
    reminder = db.query(models.Reminder).filter(models.Reminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    reminder.next_due_at = datetime.now(timezone.utc) + timedelta(hours=reminder.interval_hours)
    db.commit()
    db.refresh(reminder)
    return reminder
