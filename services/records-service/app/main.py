from fastapi import FastAPI
from .database import Base, engine
from .routers import consent, patients

app = FastAPI(title="Records & Consent Service")

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

app.include_router(consent.router)
app.include_router(patients.router)

@app.get("/health")
def health():
    return {"status": "ok"}
