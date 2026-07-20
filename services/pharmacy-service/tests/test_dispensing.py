import json
import pytest
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.main import app
from app.database import engine, get_db

@pytest.fixture()
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()

    yield session

    session.close()
    transaction.rollback()
    connection.close()

def test_dispense_flips_prescription_status(client):
    #Create a prescription first
    response = client.post("/api/pharmacy/prescriptions", json={
        "record_id": "123e4567-e89b-12d3-a456-426614174000",
        "doctor_id": "123e4567-e89b-12d3-a456-426614174000",
        "drug_code": "DRUG123",
        "dosage": "100mg once daily"
    })
    assert response.status_code == 200
    prescription_id = response.json()["id"]

    dispense_response = client.post("/api/pharmacy/dispensing", json={
        "prescription_id": prescription_id,
        "pharmacy_id": "123e4567-e89b-12d3-a456-426614174000",
    })
    assert dispense_response.status_code == 200

    check_response = client.get(f"/api/pharmacy/prescriptions/{prescription_id}")
    assert check_response.json()["status"] == "dispensed"

def test_dispense_nonexistent_prescription(client):
    # Attempt to dispense a prescription that doesn't exist
    response = client.post("/api/pharmacy/dispensing", json={
        "prescription_id": "00000000-0000-0000-0000-000000000000",
        "pharmacy_id": "123e4567-e89b-12d3-a456-426614174000",
    })
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Prescription not found"

def test_dispense_already_dispensed_prescription(client, db_session):
    # Create a prescription first
    response = client.post("/api/pharmacy/prescriptions", json={
        "record_id": "123e4567-e89b-12d3-a456-426614174000",
        "doctor_id": "123e4567-e89b-12d3-a456-426614174000",
        "drug_code": "DRUG123",
        "dosage": "100mg once daily"
    })
    assert response.status_code == 200
    prescription_id = response.json()["id"]


    dispense_response = client.post("/api/pharmacy/dispensing", json={
        "prescription_id": prescription_id,
        "pharmacy_id": "123e4567-e89b-12d3-a456-426614174000",
    })
    assert dispense_response.status_code == 200

    second_dispense_response = client.post("/api/pharmacy/dispensing", json={
        "prescription_id": prescription_id,
        "pharmacy_id": "123e4567-e89b-12d3-a456-426614174000",

    })

    assert second_dispense_response.status_code == 400
    assert second_dispense_response.json()["detail"] == "Prescription has already been dispensed"
