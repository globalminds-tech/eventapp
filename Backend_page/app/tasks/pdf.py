import logging

logger = logging.getLogger(__name__)

def generate_pdf_ticket_task(booking_id: int):
    logger.info(f"Generating PDF ticket task for booking {booking_id}")
    return True
