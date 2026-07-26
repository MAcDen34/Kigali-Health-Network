from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_actor, ActorContext


router = APIRouter(prefix="/api/pharmacy", tags=["interaction_flags"])

@router.get("/interaction_flags", response_model=List[schemas.InteractionFlagOut])
def list_interaction_flags(db: Session = Depends(get_db), actor: ActorContext = Depends(get_current_actor)):
    """List all interaction flags — used to cross-reference against prescriptions in both the Clinic and Pharmacy views."""
    return db.query(models.InteractionFlag).order_by(models.InteractionFlag.created_at.desc()).all()

@router.post("/interaction_flags", response_model=schemas.InteractionFlagOut)
def create_interaction_flag(payload: schemas.InteractionFlagCreate, db: Session = Depends(get_db), actor: ActorContext = Depends(get_current_actor)):
    interaction_flag = models.InteractionFlag(**payload.dict())
    db.add(interaction_flag)
    db.commit()
    db.refresh(interaction_flag)
    return interaction_flag

@router.get("/interaction_flags/{flag_id}", response_model=schemas.InteractionFlagOut)
def get_interaction_flag(flag_id: UUID, db: Session = Depends(get_db), actor: ActorContext = Depends(get_current_actor)):
    interaction_flag = db.query(models.InteractionFlag).filter(models.InteractionFlag.id == flag_id).first()
    if not interaction_flag:
        raise HTTPException(status_code=404, detail="Interaction flag not found")
    return interaction_flag
