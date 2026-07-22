"""
Staff router — /api/admin/staff
All endpoints: Platform Admin only.

GET    /staff                    → list all staff
POST   /staff                    → create a new staff account (doctor, nurse, etc.)
GET    /staff/{id}               → get single staff member
PATCH  /staff/{id}               → update role, institution, active status
DELETE /staff/{id}               → deactivate (soft delete — never hard delete)
POST   /staff/{id}/reset-password→ admin resets a staff member's password
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from .. import models, schemas
from ..database import get_db
from ..dependencies import require_admin

router = APIRouter(prefix="/api/admin/staff", tags=["staff"])


@router.get("", response_model=List[schemas.StaffOut])
def list_staff(
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """List all staff accounts across all institutions."""
    return db.query(models.Staff).order_by(models.Staff.created_at.desc()).all()


@router.post("", response_model=schemas.StaffOut)
def create_staff(
    payload: schemas.StaffCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """
    Create a new staff account.
    This is how doctors, nurses, pharmacists, and insurance agents
    get access to the platform. Platform Admin only.

    Roles accepted: DOCTOR | NURSE | PHARMACIST | INSURANCE_AGENT | PLATFORM_ADMIN
    """
    existing = db.query(models.Staff).filter(
        models.Staff.email == payload.email.lower()
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="A staff account with this email already exists.")

    staff = models.Staff(
        full_name=payload.full_name,
        email=payload.email.lower(),
        role=payload.role,
        institution_id=payload.institution_id,
    )
    staff.set_password(payload.password)
    db.add(staff)
    db.commit()
    db.refresh(staff)

    audit = models.PlatformAudit(
        actor_id=admin.id, actor_name=admin.full_name,
        action="created_staff_account",
        target=f"staff:{staff.id} role:{staff.role}"
    )
    db.add(audit)
    db.commit()
    return staff


@router.get("/{staff_id}", response_model=schemas.StaffOut)
def get_staff(
    staff_id: UUID,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found.")
    return staff


@router.patch("/{staff_id}", response_model=schemas.StaffOut)
def update_staff(
    staff_id: UUID,
    payload: schemas.StaffUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """Update a staff member's role, institution assignment, or active status."""
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found.")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(staff, field, value)
    db.commit()
    db.refresh(staff)

    audit = models.PlatformAudit(
        actor_id=admin.id, actor_name=admin.full_name,
        action="updated_staff_account", target=f"staff:{staff.id}"
    )
    db.add(audit)
    db.commit()
    return staff


@router.delete("/{staff_id}")
def deactivate_staff(
    staff_id: UUID,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """
    Soft-delete: set active=False. The account record is preserved for audit purposes.
    The staff member will be rejected on next login attempt.
    """
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found.")
    if staff.id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot deactivate your own account.")

    staff.active = False
    db.commit()

    audit = models.PlatformAudit(
        actor_id=admin.id, actor_name=admin.full_name,
        action="deactivated_staff_account", target=f"staff:{staff.id}"
    )
    db.add(audit)
    db.commit()
    return {"message": f"Staff account for {staff.full_name} has been deactivated."}


@router.post("/{staff_id}/reset-password")
def reset_staff_password(
    staff_id: UUID,
    payload: dict,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """Admin resets a staff member's password. Body: { new_password: str }"""
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found.")

    new_password = payload.get("new_password", "")
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    staff.set_password(new_password)
    db.commit()

    audit = models.PlatformAudit(
        actor_id=admin.id, actor_name=admin.full_name,
        action="reset_staff_password", target=f"staff:{staff.id}"
    )
    db.add(audit)
    db.commit()
    return {"message": "Password reset successfully."}
