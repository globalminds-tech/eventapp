import logging

logger = logging.getLogger(__name__)

def send_notification_task(user_id: int, message: str):
    logger.info(f"Sending notification to user {user_id}: {message}")
    return True
