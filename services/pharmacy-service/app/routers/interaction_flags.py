from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from .. import models, schemas
from ..database import get_db


router = APIRouter(prefix="/api/pharmacy", tags=["interaction_flags"])


@router.post("/interaction_flags", response_model=schemas.InteractionFlagOut)
def create_interaction_flag(payload: schemas.InteractionFlagCreate, db: Session = Depends(get_db)):
    interaction_flag = models.InteractionFlag(**payload.dict())
    db.add(interaction_flag)
    db.commit()
    db.refresh(interaction_flag)
    return interaction_flag

@router.get("/interaction_flags/{flag_id}", response_model=schemas.InteractionFlagOut)
def get_interaction_flag(flag_id: UUID, db: Session = Depends(get_db)):
    interaction_flag = db.query(models.InteractionFlag).filter(models.InteractionFlag.id == flag_id).first()
    if not interaction_flag:
        raise HTTPException(status_code=404, detail="Interaction flag not found")
    return interaction_flag
