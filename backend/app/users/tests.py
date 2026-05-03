def test_user_endpoints(client, registered_user):
    unauthorized = client.get("/api/v1/user")
    assert unauthorized.status_code == 401

    current = client.get("/api/v1/user", headers=registered_user)
    assert current.status_code == 200
    assert current.json()["user"]["name"] == "alice"
    assert current.json()["user"]["email"] == "alice@example.com"

    updated = client.patch(
        "/api/v1/user",
        headers=registered_user,
        json={"name": "alice-2", "email": "alice-2@example.com", "level": "B1"},
    )
    assert updated.status_code == 200
    assert updated.json()["user"]["name"] == "alice-2"
    assert updated.json()["user"]["email"] == "alice-2@example.com"
    assert updated.json()["user"]["level"] == "B1"


def test_user_password_change(client, registered_user):
    change = client.post(
        "/api/v1/user/password",
        headers=registered_user,
        json={"old_password": "password123", "new_password": "newpassword456"},
    )
    assert change.status_code == 200
    assert change.json()["ok"] is True

    # Old password should no longer work
    old_login = client.post(
        "/api/v1/session",
        json={
            "mode": "login",
            "email": "alice@example.com",
            "password": "password123",
            "lang": "ru",
            "device_id": "device-1",
        },
    )
    assert old_login.status_code == 400

    # New password should work
    new_login = client.post(
        "/api/v1/session",
        json={
            "mode": "login",
            "email": "alice@example.com",
            "password": "newpassword456",
            "lang": "ru",
            "device_id": "device-1",
        },
    )
    assert new_login.status_code == 200


def test_user_password_change_invalid_old(client, registered_user):
    change = client.post(
        "/api/v1/user/password",
        headers=registered_user,
        json={"old_password": "wrongpassword", "new_password": "newpassword456"},
    )
    assert change.status_code == 400
    assert "Invalid old password" in change.json()["detail"]
