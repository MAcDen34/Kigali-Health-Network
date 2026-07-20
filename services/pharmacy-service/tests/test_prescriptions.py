def test_create_prescription(client):
    response = client.post("/api/pharmacy/prescriptions", json={
        "record_id": "11111111-1111-1111-1111-111111111111",
        "doctor_id": "22222222-2222-2222-2222-222222222222",
        "drug_code": "PARA500",
        "dosage": "500mg every 6 hours"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["drug_code"] == "PARA500"
    assert data["status"] == "pending"


def test_get_prescription_not_found(client):
    response = client.get("/api/pharmacy/prescriptions/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
