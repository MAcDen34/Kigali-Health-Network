"""
Platform audit router — /api/admin/audit
Platform Admin only.

GET /audit           → paginated list of all platform-wide audit events
GET /audit/stats     → summary counts for the dashboard KPICards
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from ..dependencies import require_admin

router = APIRouter(prefix="/api/admin/audit", tags=["audit"])


@router.get("", response_model=List[schemas.PlatformAuditOut])
def list_audit(
    skip:  int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """Full platform-wide audit trail, most recent first."""
    return (
        db.query(models.PlatformAudit)
        .order_by(models.PlatformAudit.timestamp.desc())
        .offset(skip).limit(limit).all()
    )


@router.get("/stats")
def audit_stats(
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """
    Returns counts used by the Admin dashboard KPICards:
    total institutions, active institutions, total staff, pending institutions.
    """
    total_inst   = db.query(models.Institution).count()
    active_inst  = db.query(models.Institution).filter(models.Institution.active == True).count()
    pending_inst = db.query(models.Institution).filter(models.Institution.active == False).count()
    total_staff  = db.query(models.Staff).filter(models.Staff.active == True).count()
    total_events = db.query(models.PlatformAudit).count()

    return {
        "total_institutions":   total_inst,
        "active_institutions":  active_inst,
        "pending_institutions": pending_inst,
        "total_staff":          total_staff,
        "total_audit_events":   total_events,
    }
