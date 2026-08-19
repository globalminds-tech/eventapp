import logging

logger = logging.getLogger(__name__)

def send_email_task(to_email: str, subject: str, body: str):
    logger.info(f"Queueing/sending email task to {to_email} with subject: {subject}")
    # Integration point for SMTP or AWS SQS + Lambda worker
    return True
