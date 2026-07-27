from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import prescriptions, dispensing, interaction_flags

app = FastAPI(title="Pharmacy Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)

app.include_router(prescriptions.router)
app.include_router(dispensing.router)
app.include_router(interaction_flags.router)


@app.get("/health")
def health_check():
    return {"status": "healthy"}
