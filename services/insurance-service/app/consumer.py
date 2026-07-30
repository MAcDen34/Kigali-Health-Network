"""
Listens on the same 'prescription_events' Redis Stream that pharmacy-service
publishes to (see pharmacy-service/app/events.py) and notification-service
already consumes from its own consumer group. Redis Streams support multiple
independent consumer groups reading the same stream, so this runs alongside
notification-service without competing for messages.

NOTE: clinical-service/app/routers/prescriptions.py also has a
publish_prescription_event() function whose docstring mentions "Insurance
Service" — but it uses plain Redis Pub/Sub on a different channel with
different field names, and nothing consumes it. That path is dead code.
This consumer intentionally listens to the real stream instead.
"""
import os
import threading
from . import models
from .database import SessionLocal
import redis

REDIS_URL     = os.getenv("REDIS_URL", "redis://localhost:6379")
STREAM_NAME   = "prescription_events"
GROUP_NAME    = "insurance-service"
CONSUMER_NAME = "worker-1"

redis_client = redis.from_url(REDIS_URL, decode_responses=True)


def ensure_group(stream_name=STREAM_NAME, group_name=GROUP_NAME):
    try:
        redis_client.xgroup_create(stream_name, group_name, id="0", mkstream=True)
    except redis.exceptions.ResponseError as e:
        if "BUSYGROUP" not in str(e):
            raise


def process_message(fields: dict):
    db = SessionLocal()
    try:
        drug_code = fields.get("drug_code", "")
        dosage = fields.get("dosage", "")
        claim = models.Claim(
            patient_id=fields["patient_id"],
            prescription_id=fields["prescription_id"],
            service_description=f"Prescription: {drug_code} — {dosage}".strip(" —"),
            status="pending",
        )
        db.add(claim)
        db.commit()
    finally:
        db.close()


def poll_once(count=1, block_ms=1000, stream_name=STREAM_NAME, group_name=GROUP_NAME, consumer_name=CONSUMER_NAME):
    response = redis_client.xreadgroup(
        group_name, consumer_name,
        {stream_name: ">"},
        count=count, block=block_ms
    )
    if not response:
        return 0

    processed = 0
    for _stream, messages in response:
        for message_id, fields in messages:
            process_message(fields)
            redis_client.xack(stream_name, group_name, message_id)
            processed += 1
    return processed


def consume_loop():
    import time
    while True:
        try:
            ensure_group()
            poll_once(count=1, block_ms=5000)
        except Exception as e:
            print(f"[insurance-consumer] error: {e}")
            time.sleep(5)


def start_consumer_thread():
    thread = threading.Thread(target=consume_loop, daemon=True)
    thread.start()
