from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import institutions, staff, audit, auth, health

app = FastAPI(
    title="Admin & Platform Service",
    description="Institution onboarding, staff management, API tokens, and platform audit for KUPRIN.",
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

app.include_router(institutions.router)
app.include_router(staff.router)
app.include_router(audit.router)
app.include_router(auth.router)
app.include_router(health.router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "admin-service"}
