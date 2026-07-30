"""
Platform health router — /api/admin/health
Platform Admin only.

Pings every other backend service's real /health endpoint and reports
back actual status + response time. Uptime tracking would require
persistent state we don't have yet, so it's honestly returned as null
rather than faked.
"""
import time
import httpx
from fastapi import APIRouter, Depends
from typing import List

from .. import schemas
from ..dependencies import require_admin

router = APIRouter(prefix="/api/admin/health", tags=["health"])

SERVICES = [
    ("records-service", "http://records-service:8000/health", 8000),
    ("clinical-service", "http://clinical-service:8001/health", 8001),
    ("pharmacy-service", "http://pharmacy-service:8002/health", 8002),
    ("insurance-service", "http://insurance-service:8003/health", 8003),
    ("notification-service", "http://notification-service:8005/health", 8005),
]


@router.get("", response_model=List[schemas.ServiceHealthOut])
def check_services_health(admin=Depends(require_admin)):
    """Live-pings every sibling service and reports real status + latency."""
    results = [
        schemas.ServiceHealthOut(service="admin-service", port=8004, status="healthy", latency=0, uptime=None)
    ]
    for name, url, port in SERVICES:
        start = time.monotonic()
        try:
            response = httpx.get(url, timeout=3.0)
            latency_ms = int((time.monotonic() - start) * 1000)
            status = "healthy" if response.status_code == 200 else "degraded"
        except Exception:
            latency_ms = None
            status = "degraded"
        results.append(schemas.ServiceHealthOut(service=name, port=port, status=status, latency=latency_ms, uptime=None))
    return results
