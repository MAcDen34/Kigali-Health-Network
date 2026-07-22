from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List
import jwt, os
from .database import get_db
from . import models

JWT_SECRET    = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
bearer_scheme = HTTPBearer(auto_error=False)

def get_current_actor(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> models.Staff:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")

    staff = db.query(models.Staff).filter(
        models.Staff.id == payload.get("sub"),
        models.Staff.active == True
    ).first()
    if not staff:
        raise HTTPException(status_code=401, detail="Account not found.")
    return staff

def require_admin(actor: models.Staff = Depends(get_current_actor)) -> models.Staff:
    if actor.role != "PLATFORM_ADMIN":
        raise HTTPException(status_code=403, detail="Platform Admin access required.")
    return actor
