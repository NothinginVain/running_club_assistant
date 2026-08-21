from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import AUTH_COOKIE_NAME, JWT_ALGORITHM, JWT_SECRET_KEY
from tests.helpers import register_user


def test_register_creates_user_with_hashed_password(client, db_session):
    response = register_user(client)

    assert response.status_code == 201
    body = response.json()
    assert body["username"] == "runner1"
    assert body["email"] == "runner1@example.com"
    assert "password" not in body
    assert AUTH_COOKIE_NAME in response.cookies

    from app.models.user import User

    user = db_session.query(User).filter(User.email == "runner1@example.com").one()
    assert user.password_hash.startswith("$argon2id$")
    assert user.password_hash != "password123"


def test_register_rejects_duplicate_email(client):
    register_user(client, username="first", email="dup@example.com")
    response = register_user(client, username="second", email="dup@example.com")

    assert response.status_code == 400


def test_register_rejects_duplicate_username(client):
    register_user(client, username="sameuser", email="a@example.com")
    response = register_user(client, username="sameuser", email="b@example.com")

    assert response.status_code == 400


def test_login_succeeds_with_correct_credentials(client):
    register_user(client)

    response = client.post(
        "/auth/login",
        json={"email": "runner1@example.com", "password": "password123"},
    )

    assert response.status_code == 200
    assert AUTH_COOKIE_NAME in response.cookies


def test_login_rejects_wrong_password(client):
    register_user(client)

    response = client.post(
        "/auth/login",
        json={"email": "runner1@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 401


def test_login_rejects_unknown_email(client):
    response = client.post(
        "/auth/login",
        json={"email": "nobody@example.com", "password": "password123"},
    )

    assert response.status_code == 401


def test_me_requires_authentication(client):
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_me_returns_current_user_when_authenticated(client):
    register_user(client)

    response = client.get("/auth/me")

    assert response.status_code == 200
    assert response.json()["email"] == "runner1@example.com"


def test_expired_jwt_is_rejected(client):
    register_user(client)

    expired_payload = {
        "sub": client.get("/auth/me").json()["id"],
        "iat": datetime.now(timezone.utc) - timedelta(days=10),
        "exp": datetime.now(timezone.utc) - timedelta(days=3),
    }
    expired_token = jwt.encode(expired_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

    client.cookies.set(AUTH_COOKIE_NAME, expired_token)
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_protected_endpoint_rejects_missing_cookie(client):
    response = client.get("/surveys/")

    assert response.status_code == 401


def test_health_endpoint_requires_no_authentication(client):
    response = client.get("/")

    assert response.status_code == 200
