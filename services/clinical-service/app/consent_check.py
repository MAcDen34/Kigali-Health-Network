"""
Consent gate helper for the Clinical Service.
Makes an internal REST call to the Records Service to verify
that an active consent grant exists for the given patient + institution.

In production this runs synchronously before any clinical data is returned.
Fail-closed: if the Records Service is unreachable, access is DENIED.
"""
import os
import httpx

RECORDS_URL = os.getenv("RECORDS_SERVICE_URL", "http://records-service:8000")


def assert_consent(patient_id: str, institution_id: str, actor_token: str):
    """
    Raises httpx.HTTPStatusError (403) if no active consent exists.
    Raises RuntimeError if Records Service is unreachable (fail-closed).
    """
    try:
        resp = httpx.get(
            f"{RECORDS_URL}/api/records/consents/{patient_id}",
            params={"institution_id": str(institution_id)},
            headers={"Authorization": f"Bearer {actor_token}"},
            timeout=3.0
        )
        resp.raise_for_status()
    except httpx.TimeoutException:
        raise RuntimeError(
            "Records Service is unreachable. Access denied (fail-closed). "
            "Please try again or contact the platform administrator."
        )
