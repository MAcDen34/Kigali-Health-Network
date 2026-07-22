"""
Auth router — POST /api/records/auth/login
Returns a signed JWT containing role + staff_id + institution_id claims.
The frontend swaps the demo-pill session for this real token on login.
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import jwt
import bcrypt
import os

from ..database import get_db
from .. import models

router = APIRouter(prefix="/api/records/auth", tags=["auth"])

JWT_SECRET    = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_MINUTES = int(os.getenv("JWT_EXPIRY_MINUTES", "60"))


# ── Schemas ────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str
    institution_id: Optional[str] = None
    institution: Optional[str] = None


# ── Helpers ────────────────────────────────────────────────────────────────

def create_jwt(payload: dict) -> str:
    data = payload.copy()
    data["exp"] = datetime.utcnow() + timedelta(minutes=JWT_EXPIRY_MINUTES)
    data["iat"] = datetime.utcnow()
    return jwt.encode(data, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ── Login endpoint ─────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate a staff member or patient by email + password.
    Returns a JWT with role claims embedded.

    Frontend usage:
        POST /api/records/auth/login
        Body: { email, password }
        → { access_token, role, name, institution_id, institution }

    The access_token is then sent on every subsequent request as:
        Authorization: Bearer <token>
    """
    staff = db.query(models.Staff).filter(
        models.Staff.email == payload.email.lower(),
        models.Staff.active == True
    ).first()

    if not staff or not verify_password(payload.password, staff.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    institution = db.query(models.Institution).filter(
        models.Institution.id == staff.institution_id
    ).first() if staff.institution_id else None

    token = create_jwt({
        "sub":            str(staff.id),
        "role":           staff.role,
        "institution_id": str(staff.institution_id) if staff.institution_id else None,
    })

    return TokenResponse(
        access_token=token,
        role=staff.role,
        name=staff.full_name,
        institution_id=str(staff.institution_id) if staff.institution_id else None,
        institution=institution.name if institution else None,
    )


@router.get("/me")
def get_current_user_info(db: Session = Depends(get_db),
                          actor_id=Depends(lambda: None)):  # replaced by real dep below
    """
    Returns the currently authenticated user's profile.
    Requires Authorization: Bearer <token>
    """
    pass  # wired in dependencies.py
