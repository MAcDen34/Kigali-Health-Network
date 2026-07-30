import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import reminders

app = FastAPI(title="Notification Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@asynccontextmanager
async def lifespan(app):
    Base.metadata.create_all(bind=engine)
    if os.getenv("DISABLE_CONSUMER") != "1":
        from .consumer import start_consumer_thread
        start_consumer_thread()
        from .notifier import start_notifier_thread
        start_notifier_thread()
    yield

app.include_router(reminders.router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "notification-service"}
