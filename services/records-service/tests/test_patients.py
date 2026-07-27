def test_create_patient(client):
    response = client.post("/api/records/patients", json={
        "full_name": "Test Patient",
        "national_id": "1199099999999999",
        "dob": "1985-03-20",
        "blood_group": "A+",
        "allergies": []
    })
    assert response.status_code == 200
    data = response.json()
    assert data["national_id"] == "1199099999999999"

def test_get_patient_not_found(client):
    response = client.get("/api/records/patients/12345678-1234-1234-1234-123456789012")
    assert response.status_code == 404
