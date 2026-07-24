from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from .. import models
from ..database import get_db
from ..dependencies import create_access_token

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


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.email == payload.email).first()
    if not patient or not patient.check_password(payload.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(str(patient.id))
    return LoginResponse(
        access_token=token,
        patient_id=str(patient.id),
        name=None,
    )
