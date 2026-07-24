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


def ensure_group(stream_name=STREAM_NAME, group_name=GROUP_NAME):
    try:
        redis_client.xgroup_create(stream_name, group_name, id="0", mkstream=True)
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
    ensure_group()
    while True:
        try:
            poll_once(count=1, block_ms=5000)
        except Exception as e:
            print(f"[notification-consumer] error: {e}")


def start_consumer_thread():
    thread = threading.Thread(target=consume_loop, daemon=True)
    thread.start()
