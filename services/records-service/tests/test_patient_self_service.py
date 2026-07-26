import uuid

def _create_patient(db_session, national_id):
    from app import models
    patient = models.Patient(
        full_name="Test Patient",
        national_id=national_id,
        dob="1990-01-01",
        blood_group="O+",
        allergies=[],
    )
    db_session.add(patient)
    db_session.commit()
    db_session.refresh(patient)
    return patient


def test_patient_can_view_own_consents(client, db_session, make_patient_token):
    patient = _create_patient(db_session, "1100000000000001")
    token = make_patient_token(patient.id)

    response = client.get(f"/api/records/patients/{patient.id}/consents",
                           headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200


def test_patient_cannot_view_another_patients_consents(client, db_session, make_patient_token):
    patient_a = _create_patient(db_session, "1100000000000002")
    patient_b = _create_patient(db_session, "1100000000000003")
    token_for_a = make_patient_token(patient_a.id)

    response = client.get(f"/api/records/patients/{patient_b.id}/consents",
                           headers={"Authorization": f"Bearer {token_for_a}"})
    assert response.status_code == 403


def test_patient_cannot_view_another_patients_medical_records(client, db_session, make_patient_token):
    patient_a = _create_patient(db_session, "1100000000000004")
    patient_b = _create_patient(db_session, "1100000000000005")
    token_for_a = make_patient_token(patient_a.id)

    response = client.get(f"/api/records/patients/{patient_b.id}/medical-records",
                           headers={"Authorization": f"Bearer {token_for_a}"})
    assert response.status_code == 403


def test_patient_cannot_view_another_patients_audit_log(client, db_session, make_patient_token):
    patient_a = _create_patient(db_session, "1100000000000006")
    patient_b = _create_patient(db_session, "1100000000000007")
    token_for_a = make_patient_token(patient_a.id)

    response = client.get(f"/api/records/patients/{patient_b.id}/audit",
                           headers={"Authorization": f"Bearer {token_for_a}"})
    assert response.status_code == 403


def test_unauthenticated_request_is_rejected(client, db_session):
    patient = _create_patient(db_session, "1100000000000008")
    response = client.get(f"/api/records/patients/{patient.id}/consents")
    assert response.status_code == 401
