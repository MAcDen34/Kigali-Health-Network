import os
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session
from .database import get_db
from . import models

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_MINUTES = 60 * 24


def create_access_token(patient_id: str) -> str:
    payload = {
        "sub": patient_id,
        "role": "PATIENT",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRY_MINUTES),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_actor(
    x_actor_id: str = Header(None),
    authorization: str = Header(None),
    db: Session = Depends(get_db),
):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        patient = db.query(models.Patient).filter(
            models.Patient.id == payload["sub"],
            models.Patient.active == True
        ).first()
        if not patient:
            raise HTTPException(status_code=401, detail="Account not found or deactivated")
        return str(patient.id)

    if x_actor_id:
        return x_actor_id
    raise HTTPException(status_code=401, detail="Missing authentication")
