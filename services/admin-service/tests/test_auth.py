from app import models

def test_login_success(client, db_session):
    staff = models.Staff(
        full_name="Test Admin",
        email="testadmin@kuprin.rw",
        role="PLATFORM_ADMIN",
    )
    staff.set_password("testpass123")
    db_session.add(staff)
    db_session.commit()

    response = client.post("/api/admin/auth/login", json={
        "email": "testadmin@kuprin.rw",
        "password": "testpass123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "PLATFORM_ADMIN"
    assert "access_token" in data


def test_login_wrong_password(client, db_session):
    staff = models.Staff(
        full_name="Test Admin 2",
        email="testadmin2@kuprin.rw",
        role="PLATFORM_ADMIN",
    )
    staff.set_password("correctpass")
    db_session.add(staff)
    db_session.commit()

    response = client.post("/api/admin/auth/login", json={
        "email": "testadmin2@kuprin.rw",
        "password": "wrongpass"
    })
    assert response.status_code == 401


def test_staff_list_requires_auth(client):
    response = client.get("/api/admin/staff")
    assert response.status_code == 401
