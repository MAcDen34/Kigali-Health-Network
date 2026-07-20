"""
Institutions router — /api/admin/institutions
All endpoints: Platform Admin only.

GET    /institutions              → list all
POST   /institutions              → onboard a new institution
GET    /institutions/{id}         → get single
PATCH  /institutions/{id}         → update (name, type, active flag)
POST   /institutions/{id}/token   → issue / rotate API token (shown once)
DELETE /institutions/{id}/token   → revoke API token
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from .. import models, schemas
from ..database import get_db
from ..dependencies import require_admin

router = APIRouter(prefix="/api/admin/institutions", tags=["institutions"])


@router.get("", response_model=List[schemas.InstitutionOut])
def list_institutions(
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """List all registered institutions. Platform Admin only."""
    return db.query(models.Institution).order_by(models.Institution.created_at.desc()).all()


@router.post("", response_model=schemas.InstitutionOut)
def onboard_institution(
    payload: schemas.InstitutionCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """
    Onboard a new institution. Starts as inactive (active=False).
    Admin must explicitly activate it and issue an API token separately.
    """
    inst = models.Institution(name=payload.name, type=payload.type)
    db.add(inst)
    db.commit()
    db.refresh(inst)

    # Log the action
    audit = models.PlatformAudit(
        actor_id=admin.id,
        actor_name=admin.full_name,
        action="onboarded_institution",
        target=f"institution:{inst.id}"
    )
    db.add(audit)
    db.commit()
    return inst


@router.get("/{institution_id}", response_model=schemas.InstitutionOut)
def get_institution(
    institution_id: UUID,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    inst = db.query(models.Institution).filter(models.Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found.")
    return inst


@router.patch("/{institution_id}", response_model=schemas.InstitutionOut)
def update_institution(
    institution_id: UUID,
    payload: schemas.InstitutionUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """Update name, type, or active status of an institution."""
    inst = db.query(models.Institution).filter(models.Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found.")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(inst, field, value)
    db.commit()
    db.refresh(inst)

    audit = models.PlatformAudit(
        actor_id=admin.id, actor_name=admin.full_name,
        action="updated_institution", target=f"institution:{inst.id}"
    )
    db.add(audit)
    db.commit()
    return inst


@router.post("/{institution_id}/token", response_model=schemas.TokenIssueResponse)
def issue_api_token(
    institution_id: UUID,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """
    Issue or rotate the API token for an institution.
    The raw token is returned ONCE and must be stored by the client.
    Only the SHA-256 hash is stored server-side.
    """
    inst = db.query(models.Institution).filter(models.Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found.")

    raw_token = inst.issue_token()  # sets api_token to hash, returns raw
    db.commit()

    audit = models.PlatformAudit(
        actor_id=admin.id, actor_name=admin.full_name,
        action="issued_api_token", target=f"institution:{inst.id}"
    )
    db.add(audit)
    db.commit()

    return schemas.TokenIssueResponse(institution_id=institution_id, raw_token=raw_token)


@router.delete("/{institution_id}/token")
def revoke_api_token(
    institution_id: UUID,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """Revoke (clear) the API token for an institution."""
    inst = db.query(models.Institution).filter(models.Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found.")

    inst.api_token = None
    db.commit()

    audit = models.PlatformAudit(
        actor_id=admin.id, actor_name=admin.full_name,
        action="revoked_api_token", target=f"institution:{inst.id}"
    )
    db.add(audit)
    db.commit()
    return {"message": "API token revoked."}
