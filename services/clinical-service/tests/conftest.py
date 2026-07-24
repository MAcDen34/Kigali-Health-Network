import os
import jwt
import pytest
from datetime import datetime, timedelta
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.main import app
from app.database import engine, get_db

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-production")

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

@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture()
def make_token():
    """Returns a function that builds a real, valid JWT for a fake test actor."""
    def _make(role="DOCTOR", actor_id="11111111-1111-1111-1111-111111111111", institution_id="22222222-2222-2222-2222-222222222222"):
        payload = {
            "sub": actor_id,
            "role": role,
            "institution_id": institution_id,
            "exp": datetime.utcnow() + timedelta(minutes=30),
            "iat": datetime.utcnow(),
        }
        return jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    return _make
