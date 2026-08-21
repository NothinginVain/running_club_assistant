import logging
from abc import ABC, abstractmethod

logger = logging.getLogger("app.email")


class EmailSender(ABC):
    @abstractmethod
    def send_password_reset_email(self, to_email: str, reset_url: str) -> None:
        raise NotImplementedError


class ConsoleEmailSender(EmailSender):
    """Logs the reset link instead of sending a real email.

    No email provider is configured for this project. Swap `get_email_sender`
    below for an SMTP/SES/SendGrid-backed implementation when one is added;
    nothing in the auth routes needs to change.
    """

    def send_password_reset_email(self, to_email: str, reset_url: str) -> None:
        message = f"Password reset link for {to_email}: {reset_url}"
        logger.info(message)
        # Also printed directly: uvicorn's default logging config filters out
        # INFO-level app logs, which would make this invisible in local dev
        # despite being the entire point of a console-based email stand-in.
        print(f"[email] {message}")


def get_email_sender() -> EmailSender:
    return ConsoleEmailSender()
