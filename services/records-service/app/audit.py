from sqlalchemy.orm import Session
from uuid import UUID
from . import models

def log_access(db: Session, actor_id: UUID, patient_id: UUID, action: str, ip_address: str | None = None):
    entry = models.AuditLog(
        actor_id=actor_id,
        patient_id=patient_id,
        action=action,
        ip_address=ip_address,
    )
    db.add(entry)
    db.commit()
