from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import diagnoses, vitals, prescriptions

app = FastAPI(
    title="Clinical Service",
    description="Diagnosis entry, vitals recording, treatment plans, and prescription creation for KUNRN.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

app.include_router(diagnoses.router)
app.include_router(vitals.router)
app.include_router(prescriptions.router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "clinical-service"}
