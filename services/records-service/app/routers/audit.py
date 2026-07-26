from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_actor

router = APIRouter(prefix="/api/records", tags=["audit"])

@router.get("/patients/{patient_id}/audit", response_model=List[schemas.AuditLogOut])
def list_patient_audit_log(patient_id: UUID, db: Session = Depends(get_db), actor_id: UUID = Depends(get_current_actor)):
    if str(actor_id) != str(patient_id):
        raise HTTPException(status_code=403, detail="You can only view your own audit log.")
    return db.query(models.AuditLog).filter(
        models.AuditLog.patient_id == patient_id
    ).order_by(models.AuditLog.timestamp.desc()).all()
