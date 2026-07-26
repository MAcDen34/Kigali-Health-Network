PATIENT_ID = "33333333-3333-3333-3333-333333333333"


def test_create_claim_requires_auth(client):
    response = client.post("/api/insurance/claims", json={"patient_id": PATIENT_ID})
    assert response.status_code == 401


def test_create_claim_wrong_role(client, make_token):
    token = make_token(role="DOCTOR")
    response = client.post(
        "/api/insurance/claims",
        json={"patient_id": PATIENT_ID},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


def test_create_and_get_claim(client, make_token):
    token = make_token()
    response = client.post(
        "/api/insurance/claims",
        json={
            "patient_id": PATIENT_ID,
            "diagnosis_code": "I10",
            "service_description": "Consultation + labs",
            "amount": "45000.00",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    claim = response.json()
    assert claim["status"] == "pending"
    assert claim["amount"] == "45000.00"

    get_response = client.get(
        f"/api/insurance/claims/{claim['id']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_response.status_code == 200
    assert get_response.json()["patient_id"] == PATIENT_ID


def test_get_nonexistent_claim(client, make_token):
    token = make_token()
    response = client.get(
        "/api/insurance/claims/00000000-0000-0000-0000-000000000000",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 404


def test_approve_then_pay_claim(client, make_token):
    token = make_token()
    create_response = client.post(
        "/api/insurance/claims",
        json={"patient_id": PATIENT_ID, "amount": "22000.00"},
        headers={"Authorization": f"Bearer {token}"},
    )
    claim_id = create_response.json()["id"]

    approve_response = client.patch(
        f"/api/insurance/claims/{claim_id}/status",
        json={"status": "approved"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert approve_response.status_code == 200
    assert approve_response.json()["status"] == "approved"

    pay_response = client.patch(
        f"/api/insurance/claims/{claim_id}/status",
        json={"status": "paid"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert pay_response.status_code == 200
    assert pay_response.json()["status"] == "paid"


def test_cannot_reopen_a_paid_claim(client, make_token):
    token = make_token()
    create_response = client.post(
        "/api/insurance/claims",
        json={"patient_id": PATIENT_ID, "amount": "10000.00"},
        headers={"Authorization": f"Bearer {token}"},
    )
    claim_id = create_response.json()["id"]

    client.patch(
        f"/api/insurance/claims/{claim_id}/status",
        json={"status": "approved"},
        headers={"Authorization": f"Bearer {token}"},
    )
    client.patch(
        f"/api/insurance/claims/{claim_id}/status",
        json={"status": "paid"},
        headers={"Authorization": f"Bearer {token}"},
    )

    reopen_response = client.patch(
        f"/api/insurance/claims/{claim_id}/status",
        json={"status": "pending"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert reopen_response.status_code == 400


def test_list_patient_claims(client, make_token):
    token = make_token()
    client.post(
        "/api/insurance/claims",
        json={"patient_id": PATIENT_ID, "amount": "5000.00"},
        headers={"Authorization": f"Bearer {token}"},
    )

    response = client.get(
        f"/api/insurance/patients/{PATIENT_ID}/claims",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert len(response.json()) >= 1
