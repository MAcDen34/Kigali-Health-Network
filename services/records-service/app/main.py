from fastapi import FastAPI
from .database import Base, engine
from .routers import consent, patients, medical_records

app = FastAPI(title="Records & Consent Service")

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

app.include_router(consent.router)
app.include_router(patients.router)
app.include_router(medical_records.router)

@app.get("/health")
def health():
    return {"status": "ok"}
