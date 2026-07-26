from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt, os
from dataclasses import dataclass
from typing import Optional
from uuid import UUID

JWT_SECRET    = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
bearer_scheme = HTTPBearer(auto_error=False)


@dataclass
class ActorContext:
    id:             UUID
    role:           str
    institution_id: Optional[UUID]


def get_current_actor(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> ActorContext:
    """Same pattern already proven in clinical-service — decodes and trusts
    the shared-secret-signed token. No role restriction here: any
    authenticated actor (Doctor, Nurse, Pharmacist, Patient) may use these
    endpoints, matching how they're actually used across the app today."""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")

    return ActorContext(
        id=UUID(payload["sub"]),
        role=payload["role"],
        institution_id=UUID(payload["institution_id"]) if payload.get("institution_id") else None,
    )
