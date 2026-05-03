import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings


logger = logging.getLogger(__name__)


class EmailService:
    def is_configured(self) -> bool:
        return bool(settings.SMTP_HOST and settings.SMTP_FROM_EMAIL)

    def send_password_reset_email(self, *, email: str, user_name: str, reset_url: str) -> None:
        if not self.is_configured():
            logger.warning("SMTP is not configured; password reset email for %s was not sent", email)
            logger.info("Password reset URL for %s: %s", email, reset_url)
            return

        message = EmailMessage()
        message["Subject"] = "Sozlution password reset"
        message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        message["To"] = email
        message.set_content(
            "\n".join(
                [
                    f"Здравствуйте, {user_name}!",
                    "",
                    "Чтобы сбросить пароль, перейдите по ссылке:",
                    reset_url,
                    "",
                    "Если вы не запрашивали смену пароля, просто проигнорируйте это письмо.",
                ]
            )
        )

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as smtp:
            smtp.ehlo()
            if settings.SMTP_USE_TLS:
                smtp.starttls()
                smtp.ehlo()
            if settings.SMTP_USERNAME:
                smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp.send_message(message)


email_service = EmailService()
