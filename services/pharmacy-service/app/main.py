from fastapi import FastAPI
from .database import Base, engine
from .routers import prescriptions, dispensing, interaction_flags

app = FastAPI(title="Pharmacy Service")


@app.on_event("startup")
def startup_event():
    # Create the database tables if they don't exist
    Base.metadata.create_all(bind=engine)

app.include_router(prescriptions.router)
app.include_router(dispensing.router)
app.include_router(interaction_flags.router)


@app.get("/health")
def health_check():
    # This endpoint can be used to check if the service is running and healthy.
    return {"status": "healthy"}
