from datetime import datetime, timedelta, timezone
from urllib.parse import parse_qs, urlparse

from app.main import app as fastapi_app
from app.services.email_sender import get_email_sender
from tests.helpers import register_user


class CapturingEmailSender:
    def __init__(self):
        self.sent = []

    def send_password_reset_email(self, to_email, reset_url):
        self.sent.append((to_email, reset_url))


def _install_capturing_sender():
    sender = CapturingEmailSender()
    fastapi_app.dependency_overrides[get_email_sender] = lambda: sender
    return sender


def _extract_token(reset_url: str) -> str:
    return parse_qs(urlparse(reset_url).query)["token"][0]


def test_forgot_password_same_response_for_existing_and_unknown_email(client):
    register_user(client)

    existing = client.post("/auth/forgot-password", json={"email": "runner1@example.com"})
    unknown = client.post("/auth/forgot-password", json={"email": "nobody@example.com"})

    assert existing.status_code == 200
    assert unknown.status_code == 200
    assert existing.json() == unknown.json()


def test_forgot_password_only_emails_when_account_exists(client):
    sender = _install_capturing_sender()
    try:
        register_user(client)

        client.post("/auth/forgot-password", json={"email": "nobody@example.com"})
        assert sender.sent == []

        client.post("/auth/forgot-password", json={"email": "runner1@example.com"})
        assert len(sender.sent) == 1
        assert sender.sent[0][0] == "runner1@example.com"
    finally:
        fastapi_app.dependency_overrides.pop(get_email_sender, None)


def test_reset_password_with_valid_token_allows_login_with_new_password(client):
    sender = _install_capturing_sender()
    try:
        register_user(client)
        client.post("/auth/forgot-password", json={"email": "runner1@example.com"})
        token = _extract_token(sender.sent[0][1])

        response = client.post(
            "/auth/reset-password",
            json={"token": token, "new_password": "brand-new-password"},
        )
        assert response.status_code == 200

        login = client.post(
            "/auth/login",
            json={"email": "runner1@example.com", "password": "brand-new-password"},
        )
        assert login.status_code == 200
    finally:
        fastapi_app.dependency_overrides.pop(get_email_sender, None)


def test_reset_password_token_is_single_use(client):
    sender = _install_capturing_sender()
    try:
        register_user(client)
        client.post("/auth/forgot-password", json={"email": "runner1@example.com"})
        token = _extract_token(sender.sent[0][1])

        first = client.post(
            "/auth/reset-password",
            json={"token": token, "new_password": "first-new-password"},
        )
        second = client.post(
            "/auth/reset-password",
            json={"token": token, "new_password": "second-new-password"},
        )

        assert first.status_code == 200
        assert second.status_code == 400
    finally:
        fastapi_app.dependency_overrides.pop(get_email_sender, None)


def test_reset_password_rejects_invalid_token(client):
    response = client.post(
        "/auth/reset-password",
        json={"token": "not-a-real-token", "new_password": "whatever-password"},
    )

    assert response.status_code == 400


def test_reset_password_rejects_expired_token(client, db_session):
    sender = _install_capturing_sender()
    try:
        register_user(client)
        client.post("/auth/forgot-password", json={"email": "runner1@example.com"})
        token = _extract_token(sender.sent[0][1])

        from app.models.password_reset_token import PasswordResetToken

        reset_token = db_session.query(PasswordResetToken).one()
        reset_token.expires_at = datetime.now(timezone.utc) - timedelta(minutes=1)
        db_session.commit()

        response = client.post(
            "/auth/reset-password",
            json={"token": token, "new_password": "brand-new-password"},
        )

        assert response.status_code == 400
    finally:
        fastapi_app.dependency_overrides.pop(get_email_sender, None)
