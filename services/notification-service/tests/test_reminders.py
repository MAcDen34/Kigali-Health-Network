from uuid import uuid4
from app import models

def test_get_reminders_for_patient(client, db_session):
    patient_id = uuid4()
    reminder = models.Reminder(
        patient_id=patient_id,
        prescription_id=uuid4(),
        drug_code="TESTDRUG",
        dosage="1 tablet daily",
    ) 

    db_session.add(reminder)
    db_session.commit()

    response = client.get(f"/api/notifications/reminders/{patient_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["drug_code"] == "TESTDRUG"

def test_get_reminders_empty_for_unknown_patient(client):
    response = client.get(f"/api/notifications/reminders/{uuid4()}")
    assert response.status_code == 200
    assert response.json() == []
