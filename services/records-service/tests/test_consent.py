ACTOR = "22222222-2222-2222-2222-222222222222"
INSTITUTION = "11111111-1111-1111-1111-111111111111"

def _create_test_patient(client):
    response = client.post("/api/records/patients", json={
        "full_name": "Test Patient",
        "national_id": "1188011122334455",
        "dob": "1992-01-01",
        "blood_group": "B+",
        "allergies": []
    })
    return response.json()["id"]


def test_grant_check_revoke_consent_flow(client):
    patient_id = _create_test_patient(client)

    grant_response = client.post("/api/records/consents", json={
        "patient_id": patient_id,
        "institution_id": INSTITUTION,
    }, headers={"X-Actor-ID": ACTOR})
    assert grant_response.status_code == 200
    consent_id = grant_response.json()["id"]

    check_consent_response = client.get(f"/api/records/consents/{patient_id}?institution_id={INSTITUTION}", headers={'X-Actor-ID': ACTOR})
    assert check_consent_response.status_code == 200
    assert check_consent_response.json()["id"] == consent_id
    assert check_consent_response.json()['revoked_at'] is None

    revoke_response = client.delete(f"/api/records/consents/{consent_id}", headers={'X-Actor-ID': ACTOR})
    assert revoke_response.status_code == 200
    assert revoke_response.json()["message"] == "Consent revoked successfully"

    check_after_revoke_response = client.get(f"/api/records/consents/{patient_id}?institution_id={INSTITUTION}", headers={'X-Actor-ID': ACTOR})
    assert check_after_revoke_response.status_code == 404
    assert check_after_revoke_response.json()["detail"] == "Consent not found"
