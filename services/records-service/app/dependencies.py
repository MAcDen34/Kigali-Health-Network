"""
Auth dependencies — used across all routers.

Every protected endpoint calls one of:
  - get_current_actor()        → returns the Staff (or Patient) object from the JWT
  - require_roles([...])       → factory that returns get_current_actor but also
                                 enforces the role is in the allowed list

JWT is read from:
  Authorization: Bearer <token>

The token was issued by POST /api/records/auth/login (or the admin-service login).
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List
import jwt
import os

from .database import get_db
from . import models

JWT_SECRET    = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"

bearer_scheme = HTTPBearer(auto_error=False)


def decode_token(credentials: HTTPAuthorizationCredentials) -> dict:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authentication token provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        return jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")


def get_current_actor(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> models.Staff:
    """
    Decodes the JWT and returns the Staff object for the authenticated user.
    Raises 401 if token is missing, expired, or invalid.
    Raises 401 if the staff account no longer exists or is inactive.
    """
    payload = decode_token(credentials)
    staff_id = payload.get("sub")
    if not staff_id:
        raise HTTPException(status_code=401, detail="Token missing subject claim.")

    staff = db.query(models.Staff).filter(
        models.Staff.id == staff_id,
        models.Staff.active == True
    ).first()
    if not staff:
        raise HTTPException(status_code=401, detail="Account not found or deactivated.")
    return staff


def require_roles(allowed: List[str]):
    """
    Dependency factory. Usage:

        @router.get("/something")
        def endpoint(actor = Depends(require_roles(["DOCTOR", "NURSE"]))):
            ...

    Returns the actor object if the role is allowed, raises 403 otherwise.
    """
    def _check(actor: models.Staff = Depends(get_current_actor)) -> models.Staff:
        if actor.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(allowed)}. Your role: {actor.role}."
            )
        return actor
    return _check
