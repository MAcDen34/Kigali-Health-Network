import os
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import Header, HTTPException

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


def get_current_actor(x_actor_id: str = Header(None), authorization: str = Header(None)):
    """
    Supports two auth styles during this transition:
    - the existing X-Actor-Id header (staff calling from other services)
    - a real 'Authorization: Bearer <token>' JWT (patients logging in directly)
    Falls back cleanly rather than breaking existing consent/audit routes.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return payload["sub"]
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
    if x_actor_id:
        return x_actor_id
    raise HTTPException(status_code=401, detail="Missing authentication")
