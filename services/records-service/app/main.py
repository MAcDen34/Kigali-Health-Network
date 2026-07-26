from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import consent, patients, medical_records, auth

app = FastAPI(title="Records & Consent Service")

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

app.include_router(consent.router)
app.include_router(patients.router)
app.include_router(medical_records.router)
app.include_router(auth.router)

@app.get("/health")
def health():
    return {"status": "ok"}
