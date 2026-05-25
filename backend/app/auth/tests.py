from app.auth.email_service import email_service


def test_session_register_login_and_negative_cases(client):
    register = client.post(
        "/api/v1/session",
        json={
            "mode": "register",
            "name": "alice",
            "email": "alice@example.com",
            "password": "password123",
            "lang": "ru",
            "device_id": "device-1",
        },
    )
    assert register.status_code == 200
    assert register.json()["user"]["email"] == "alice@example.com"

    duplicate_email = client.post(
        "/api/v1/session",
        json={
            "mode": "register",
            "name": "alice-2",
            "email": "alice@example.com",
            "password": "password123",
            "lang": "ru",
            "device_id": "device-2",
        },
    )
    assert duplicate_email.status_code == 400

    wrong_password = client.post(
        "/api/v1/session",
        json={
            "mode": "login",
            "email": "alice@example.com",
            "password": "wrong-pass",
            "lang": "ru",
            "device_id": "device-1",
        },
    )
    assert wrong_password.status_code == 400

    missing_user = client.post(
        "/api/v1/session",
        json={
            "mode": "login",
            "email": "ghost@example.com",
            "password": "password123",
            "lang": "ru",
            "device_id": "device-3",
        },
    )
    assert missing_user.status_code == 404

    login = client.post(
        "/api/v1/session",
        json={
            "mode": "login",
            "email": "alice@example.com",
            "password": "password123",
            "lang": "uz",
            "device_id": "device-1",
        },
    )
    assert login.status_code == 200
    assert login.json()["user"]["lang"] == "uz"
    assert login.json()["user"]["email"] == "alice@example.com"


def test_password_reset_flow(client, monkeypatch):
    sent_urls: list[str] = []

    def fake_send_password_reset_email(*, email: str, user_name: str, reset_url: str) -> None:
        assert email == "alice@example.com"
        assert user_name == "alice"
        sent_urls.append(reset_url)

    monkeypatch.setattr(email_service, "send_password_reset_email", fake_send_password_reset_email)

    register = client.post(
        "/api/v1/session",
        json={
            "mode": "register",
            "name": "alice",
            "email": "alice@example.com",
            "password": "password123",
            "lang": "ru",
            "device_id": "device-1",
        },
    )
    assert register.status_code == 200

    missing_request = client.post(
        "/api/v1/password-reset/request",
        json={"email": "missing@example.com"},
    )
    assert missing_request.status_code == 200
    assert missing_request.json() == {"ok": True}
    assert sent_urls == []

    reset_request = client.post(
        "/api/v1/password-reset/request",
        json={"email": "alice@example.com"},
    )
    assert reset_request.status_code == 200
    assert reset_request.json() == {"ok": True}
    assert len(sent_urls) == 1

    token = sent_urls[0].split("token=", 1)[1]

    confirm = client.post(
        "/api/v1/password-reset/confirm",
        json={"token": token, "password": "newpassword123"},
    )
    assert confirm.status_code == 200
    assert confirm.json() == {"ok": True}

    reused = client.post(
        "/api/v1/password-reset/confirm",
        json={"token": token, "password": "otherpassword123"},
    )
    assert reused.status_code == 400

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

    new_login = client.post(
        "/api/v1/session",
        json={
            "mode": "login",
            "email": "alice@example.com",
            "password": "newpassword123",
            "lang": "ru",
            "device_id": "device-1",
        },
    )
    assert new_login.status_code == 200


def test_password_reset_invalid_token(client):
    confirm = client.post(
        "/api/v1/password-reset/confirm",
        json={"token": "invalid-token", "password": "newpassword123"},
    )
    assert confirm.status_code == 400
    detail = confirm.json()["detail"]
    assert detail
