import os
import threading
import redis
from sqlalchemy.orm import sessionmaker
from .database import engine
from . import models

REDIS_URL     = os.getenv("REDIS_URL", "redis://localhost:6379")
STREAM_NAME   = "prescription_events"
GROUP_NAME    = "notification-service"
CONSUMER_NAME = "worker-1"

redis_client = redis.from_url(REDIS_URL, decode_responses=True)
SessionLocal = sessionmaker(bind=engine)


def ensure_group():
    """Create the consumer group once. Safe to call every startup."""
    try:
        redis_client.xgroup_create(STREAM_NAME, GROUP_NAME, id="0", mkstream=True)
    except redis.exceptions.ResponseError as e:
        if "BUSYGROUP" not in str(e):
            raise


def process_message(fields: dict):
    db = SessionLocal()
    try:
        reminder = models.Reminder(
            patient_id=fields["patient_id"],
            prescription_id=fields["prescription_id"],
            drug_code=fields["drug_code"],
            dosage=fields["dosage"],
        )
        db.add(reminder)
        db.commit()
    finally:
        db.close()


def consume_loop():
    ensure_group()
    while True:
        try:
            response = redis_client.xreadgroup(
                GROUP_NAME, CONSUMER_NAME,
                {STREAM_NAME: ">"},
                count=1, block=5000
            )
            if not response:
                continue
            for _stream, messages in response:
                for message_id, fields in messages:
                    process_message(fields)
                    redis_client.xack(STREAM_NAME, GROUP_NAME, message_id)
        except Exception as e:
            print(f"[notification-consumer] error: {e}")


def start_consumer_thread():
    thread = threading.Thread(target=consume_loop, daemon=True)
    thread.start()
