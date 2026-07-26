import app.routers.vitals as vitals_module

def test_record_vitals_requires_auth(client):
    response = client.post("/api/clinical/vitals", json={
        "patient_id": "33333333-3333-3333-3333-333333333333",
        "blood_pressure": "120/80",
    })
    assert response.status_code == 401


def test_record_vitals_wrong_role(client, make_token):
    token = make_token(role="PHARMACIST")
    response = client.post(
        "/api/clinical/vitals",
        json={"patient_id": "33333333-3333-3333-3333-333333333333", "blood_pressure": "120/80"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


def test_record_vitals_as_nurse_succeeds(client, make_token, monkeypatch):
    monkeypatch.setattr(vitals_module, "assert_consent", lambda *args, **kwargs: None)

    token = make_token(role="NURSE")
    response = client.post(
        "/api/clinical/vitals",
        json={"patient_id": "33333333-3333-3333-3333-333333333333", "blood_pressure": "120/80", "heart_rate": "72 bpm"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["blood_pressure"] == "120/80"


def test_record_vitals_no_consent(client, make_token, monkeypatch):
    def fake_no_consent(*args, **kwargs):
        raise Exception("No active consent")
    monkeypatch.setattr(vitals_module, "assert_consent", fake_no_consent)

    token = make_token(role="DOCTOR")
    response = client.post(
        "/api/clinical/vitals",
        json={"patient_id": "33333333-3333-3333-3333-333333333333", "blood_pressure": "120/80"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
