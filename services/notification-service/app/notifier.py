import os
import time
import threading
from datetime import datetime, timezone
from sqlalchemy.orm import sessionmaker
from .database import engine
from . import models

SessionLocal = sessionmaker(bind=engine)
POLL_SECONDS = int(os.getenv("NOTIFY_POLL_SECONDS", "30"))


def check_due_reminders():
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        due = db.query(models.Reminder).filter(models.Reminder.next_due_at <= now).all()
        for reminder in due:
            print(f"REMINDER DUE: patient {reminder.patient_id} — {reminder.drug_code} ({reminder.dosage})")
            reminder.last_notified_at = now
            reminder.notified_count += 1
        db.commit()
        return len(due)
    finally:
        db.close()


def notifier_loop():
    while True:
        try:
            check_due_reminders()
        except Exception as e:
            print(f"[notifier] error: {e}")
        time.sleep(POLL_SECONDS)


def start_notifier_thread():
    thread = threading.Thread(target=notifier_loop, daemon=True)
    thread.start()
