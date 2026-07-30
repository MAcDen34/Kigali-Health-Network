import os
import redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
STREAM_NAME = "prescription_events"

redis_client = redis.from_url(REDIS_URL, decode_responses=True)

def publish_prescription_created(prescription):
    """
    XADD appends to a persistent, ordered log — unlike Pub/Sub,
    this survives even if no consumer is currently connected.
    """
    redis_client.xadd(STREAM_NAME, {
        "prescription_id": str(prescription.id),
        "patient_id":      str(prescription.patient_id) if prescription.patient_id else str(prescription.record_id),
        "drug_code":       prescription.drug_code,
        "dosage":          prescription.dosage,
    })
