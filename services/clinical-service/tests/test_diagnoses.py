import app.routers.diagnoses as diagnoses_module

def test_create_diagnosis_requires_auth(client):
    response = client.post("/api/clinical/diagnoses", json={
        "patient_id": "33333333-3333-3333-3333-333333333333",
        "description": "Test diagnosis",
    })
    assert response.status_code == 401


def test_create_diagnosis_wrong_role(client, make_token):
    token = make_token(role="NURSE")
    response = client.post(
        "/api/clinical/diagnoses",
        json={"patient_id": "33333333-3333-3333-3333-333333333333", "description": "Test diagnosis"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


def test_create_diagnosis_success(client, make_token, monkeypatch):
    monkeypatch.setattr(diagnoses_module, "assert_consent", lambda *args, **kwargs: None)

    token = make_token(role="DOCTOR")
    response = client.post(
        "/api/clinical/diagnoses",
        json={"patient_id": "33333333-3333-3333-3333-333333333333", "description": "Hypertension"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["description"] == "Hypertension"


def test_create_diagnosis_no_consent(client, make_token, monkeypatch):
    def fake_no_consent(*args, **kwargs):
        raise Exception("No active consent")
    monkeypatch.setattr(diagnoses_module, "assert_consent", fake_no_consent)

    token = make_token(role="DOCTOR")
    response = client.post(
        "/api/clinical/diagnoses",
        json={"patient_id": "33333333-3333-3333-3333-333333333333", "description": "Hypertension"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
