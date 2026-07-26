from app.consumer import poll_once, ensure_group, redis_client
from app import models

TEST_STREAM   = "test_prescription_events"
TEST_GROUP    = "test-insurance-service"
TEST_CONSUMER = "test-worker"


def test_poll_once_opens_a_pending_claim(db_session, monkeypatch):
    import app.consumer as consumer_module
    monkeypatch.setattr(consumer_module, "SessionLocal", lambda: db_session)

    ensure_group(stream_name=TEST_STREAM, group_name=TEST_GROUP)

    redis_client.xadd(TEST_STREAM, {
        "prescription_id": "11111111-1111-1111-1111-111111111111",
        "patient_id":      "22222222-2222-2222-2222-222222222222",
        "drug_code":       "TESTDRUG",
        "dosage":          "1 tablet daily",
    })

    processed = poll_once(
        count=1, block_ms=2000,
        stream_name=TEST_STREAM, group_name=TEST_GROUP, consumer_name=TEST_CONSUMER
    )
    assert processed == 1

    claim = db_session.query(models.Claim).filter(
        models.Claim.prescription_id == "11111111-1111-1111-1111-111111111111"
    ).first()
    assert claim is not None
    assert claim.status == "pending"
    assert "TESTDRUG" in claim.service_description
