from tests.helpers import register_user


def test_change_password_requires_authentication(client):
    response = client.post(
        "/auth/change-password",
        json={"current_password": "password123", "new_password": "new-password-1"},
    )

    assert response.status_code == 401


def test_change_password_rejects_wrong_current_password(client):
    register_user(client)

    response = client.post(
        "/auth/change-password",
        json={"current_password": "wrong-password", "new_password": "new-password-1"},
    )

    assert response.status_code == 400


def test_change_password_succeeds_and_updates_login(client):
    register_user(client)

    response = client.post(
        "/auth/change-password",
        json={"current_password": "password123", "new_password": "new-password-1"},
    )
    assert response.status_code == 200

    old_login = client.post(
        "/auth/login",
        json={"email": "runner1@example.com", "password": "password123"},
    )
    new_login = client.post(
        "/auth/login",
        json={"email": "runner1@example.com", "password": "new-password-1"},
    )

    assert old_login.status_code == 401
    assert new_login.status_code == 200
