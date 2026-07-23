from fastapi import FastAPI
from .database import Base, engine
from .routers import reminders
from .consumer import start_consumer_thread

app = FastAPI(title="Notification Service")

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    start_consumer_thread()

app.include_router(reminders.router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "notification-service"}
