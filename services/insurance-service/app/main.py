import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import claims

app = FastAPI(
    title="Insurance Service",
    description="Claims and coverage pre-validation for KUPRIN.",
    version="1.0.0",
)

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
    yield

app.include_router(claims.router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "insurance-service"}
