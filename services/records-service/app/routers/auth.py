from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from typing import Optional
from .. import models
from ..database import get_db
from ..dependencies import create_access_token, get_current_actor

router = APIRouter(prefix="/api/records/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str = "PATIENT"
    patient_id: str
    name: str | None = None


class RegisterRequest(BaseModel):
    full_name: str
    national_id: str
    dob: date
    blood_group: Optional[str] = None
    allergies: list[str] = []
    email: str
    password: str


@router.post("/register", response_model=LoginResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    existing = db.query(models.Patient).filter(models.Patient.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    existing_national_id = db.query(models.Patient).filter(
        models.Patient.national_id == payload.national_id
    ).first()
    if existing_national_id:
        raise HTTPException(status_code=409, detail="An account with this national ID already exists.")

    patient = models.Patient(
        full_name=payload.full_name,
        national_id=payload.national_id,
        dob=payload.dob,
        blood_group=payload.blood_group,
        allergies=payload.allergies,
        email=payload.email,
    )
    patient.set_password(payload.password)
    db.add(patient)
    db.commit()
    db.refresh(patient)

    token = create_access_token(str(patient.id))
    return LoginResponse(access_token=token, patient_id=str(patient.id), name=patient.full_name)


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(
        models.Patient.email == payload.email,
        models.Patient.active == True
    ).first()
    if not patient or not patient.check_password(payload.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(str(patient.id))
    return LoginResponse(access_token=token, patient_id=str(patient.id), name=patient.full_name)


@router.delete("/me")
def deactivate_own_account(
    actor_id: str = Depends(get_current_actor),
    db: Session = Depends(get_db),
):
    patient = db.query(models.Patient).filter(models.Patient.id == actor_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Account not found.")

    patient.active = False
    db.commit()
    return {"message": "Your account has been deactivated."}
